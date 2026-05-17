import { NextResponse } from "next/server";
import { PaymentStatus, SequenceType } from "@mollie/api-client";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  describeSubscription,
  getMollieClient,
  getMollieInterval,
  hasMollieEnv,
  toMollieAmount
} from "@/lib/billing/mollie";
import { PLANS } from "@/lib/billing/plans";
import type { Plan, PlanInterval } from "@/types/database";

export const dynamic = "force-dynamic";

/**
 * POST /api/billing/webhook
 *
 * Webhook Mollie. Mollie envoie un body `application/x-www-form-urlencoded`
 * contenant `id={payment_id}` à chaque évènement de paiement (initial,
 * renouvellement, échec).
 *
 * Responsabilités :
 *   - Premier paiement OK → créer la subscription Mollie + activer le plan
 *   - Renouvellement OK → mettre à jour `plan_renews_at`
 *   - Paiement échoué (recurring) → marquer le plan `past_due`
 *   - Annulation côté Mollie → marquer `canceled`
 *
 * Mollie attend uniquement un HTTP 200 — pas de payload nécessaire.
 */
export async function POST(request: Request) {
  if (!hasMollieEnv()) {
    return NextResponse.json({ ok: true, skipped: "no MOLLIE_API_KEY" }, { status: 200 });
  }

  let paymentId: string | null = null;

  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { id?: string };
      paymentId = body.id ?? null;
    } else {
      const form = await request.formData();
      paymentId = (form.get("id") as string | null) ?? null;
    }
  } catch {
    paymentId = null;
  }

  if (!paymentId) {
    return NextResponse.json({ ok: false, error: "missing id" }, { status: 200 });
  }

  const mollie = getMollieClient();
  const admin = createAdminClient();

  let payment;
  try {
    payment = await mollie.payments.get(paymentId);
  } catch (error) {
    console.warn("[billing/webhook] payments.get failed:", error);
    return NextResponse.json({ ok: false, error: "payment not found" }, { status: 200 });
  }

  const metadata = (payment.metadata ?? {}) as {
    userId?: string;
    plan?: Plan;
    interval?: PlanInterval;
    kind?: string;
  };

  const customerId = payment.customerId;
  if (!customerId) {
    return NextResponse.json({ ok: false, error: "no customerId" }, { status: 200 });
  }

  const { data: profileData } = await admin
    .from("profiles")
    .select(
      "id, mollie_customer_id, mollie_subscription_id, plan, plan_status, plan_interval"
    )
    .eq("mollie_customer_id", customerId)
    .maybeSingle();

  const profile = profileData as {
    id: string;
    mollie_customer_id: string | null;
    mollie_subscription_id: string | null;
    plan: string | null;
    plan_status: string | null;
    plan_interval: string | null;
  } | null;

  const userId = profile?.id ?? metadata.userId ?? null;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "unknown user" }, { status: 200 });
  }

  const now = new Date().toISOString();

  // 1. Premier paiement → créer la subscription
  if (payment.sequenceType === SequenceType.first) {
    if (payment.status === PaymentStatus.paid) {
      const plan = metadata.plan ?? "premium";
      const interval = metadata.interval ?? "monthly";
      const planDef = PLANS[plan];
      const amount = interval === "monthly" ? planDef.price.monthly : planDef.price.yearly;

      try {
        const subscription = await mollie.customerSubscriptions.create({
          customerId,
          amount: toMollieAmount(amount),
          interval: getMollieInterval(interval),
          description: describeSubscription(plan, interval),
          webhookUrl: new URL("/api/billing/webhook", request.url).toString(),
          metadata: { userId, plan, interval }
        });

        const renewsAt = subscription.nextPaymentDate
          ? new Date(subscription.nextPaymentDate).toISOString()
          : null;

        await admin
          .from("profiles")
          .update({
            plan,
            plan_status: "active",
            plan_interval: interval,
            plan_renews_at: renewsAt,
            plan_canceled_at: null,
            mollie_subscription_id: subscription.id,
            mollie_mandate_id: payment.mandateId ?? null,
            updated_at: now
          } as never)
          .eq("id", userId);
      } catch (error) {
        console.error("[billing/webhook] subscription create failed:", error);
        await admin
          .from("profiles")
          .update({ plan_status: "past_due", updated_at: now } as never)
          .eq("id", userId);
      }
    } else if (
      payment.status === PaymentStatus.failed ||
      payment.status === PaymentStatus.canceled ||
      payment.status === PaymentStatus.expired
    ) {
      await admin
        .from("profiles")
        .update({
          plan: "free",
          plan_status: "active",
          plan_interval: null,
          plan_renews_at: null,
          updated_at: now
        } as never)
        .eq("id", userId);
    }
    return NextResponse.json({ ok: true });
  }

  // 2. Renouvellement
  if (payment.sequenceType === SequenceType.recurring) {
    if (payment.status === PaymentStatus.paid) {
      let renewsAt: string | null = null;
      if (profile?.mollie_subscription_id) {
        try {
          const sub = await mollie.customerSubscriptions.get(profile.mollie_subscription_id, {
            customerId
          });
          renewsAt = sub.nextPaymentDate ? new Date(sub.nextPaymentDate).toISOString() : null;
        } catch {
          renewsAt = null;
        }
      }

      await admin
        .from("profiles")
        .update({
          plan_status: "active",
          plan_renews_at: renewsAt,
          updated_at: now
        } as never)
        .eq("id", userId);
    } else if (
      payment.status === PaymentStatus.failed ||
      payment.status === PaymentStatus.canceled ||
      payment.status === PaymentStatus.expired
    ) {
      await admin
        .from("profiles")
        .update({ plan_status: "past_due", updated_at: now } as never)
        .eq("id", userId);
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, ignored: true });
}
