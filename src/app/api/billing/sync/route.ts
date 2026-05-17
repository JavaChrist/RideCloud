import { NextResponse } from "next/server";
import { PaymentStatus, SequenceType } from "@mollie/api-client";
import { createClient } from "@/lib/supabase/server";
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
export const maxDuration = 30;

/**
 * POST /api/billing/sync
 *
 * Resynchronise le profil utilisateur depuis Mollie. À utiliser quand le
 * webhook a échoué ou n'a pas été reçu (filet de sécurité).
 *
 * Algorithme :
 *   1. Récupère le profile. Si mollie_customer_id absent, on tente une
 *      recherche chez Mollie par e-mail (filet de sécurité supplémentaire).
 *   2. Liste les paiements du customer Mollie
 *   3. Si un paiement "first" en status "paid" existe sans subscription côté
 *      profil → on (re)crée la subscription Mollie et on active le plan
 *   4. Si une subscription Mollie existe → on actualise plan_renews_at
 *   5. Retourne l'état finalement appliqué
 */
export async function POST(request: Request) {
  if (!hasMollieEnv()) {
    return NextResponse.json(
      { error: "Paiements indisponibles : MOLLIE_API_KEY non configurée." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profileData } = await admin
    .from("profiles")
    .select(
      "id, mollie_customer_id, mollie_subscription_id, mollie_mandate_id, plan, plan_status, plan_interval"
    )
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as {
    id: string;
    mollie_customer_id: string | null;
    mollie_subscription_id: string | null;
    mollie_mandate_id: string | null;
    plan: string | null;
    plan_status: string | null;
    plan_interval: string | null;
  } | null;

  const mollie = getMollieClient();
  const now = new Date().toISOString();

  // Si on n'a pas de mollie_customer_id en DB (cas : checkout interrompu juste
  // avant l'update Supabase), on tente de le retrouver chez Mollie via l'email
  // de l'utilisateur. Ça évite à l'utilisateur de devoir refaire un checkout.
  let customerId = profile?.mollie_customer_id ?? null;

  if (!customerId) {
    if (!user.email) {
      return NextResponse.json(
        {
          error:
            "Aucun email associé à votre compte. Impossible de retrouver votre paiement chez Mollie."
        },
        { status: 404 }
      );
    }

    try {
      const customers = await mollie.customers.page({ limit: 250 });
      const match = customers.find(
        (customer) => customer.email?.toLowerCase() === user.email!.toLowerCase()
      );

      if (!match) {
        return NextResponse.json(
          {
            error:
              "Aucun client Mollie trouvé pour votre e-mail. Lancez un nouveau checkout depuis /tarifs."
          },
          { status: 404 }
        );
      }

      customerId = match.id;

      await admin
        .from("profiles")
        .update({ mollie_customer_id: customerId, updated_at: now } as never)
        .eq("id", user.id);
    } catch (error) {
      console.error("[billing/sync] customer lookup by email failed", error);
      return NextResponse.json(
        { error: "Impossible de joindre Mollie. Réessayez dans quelques minutes." },
        { status: 502 }
      );
    }
  }

  // 1. Si on a déjà une subscription en base, on actualise l'état
  if (profile?.mollie_subscription_id) {
    try {
      const sub = await mollie.customerSubscriptions.get(profile.mollie_subscription_id, {
        customerId
      });

      const renewsAt = sub.nextPaymentDate
        ? new Date(sub.nextPaymentDate).toISOString()
        : null;
      const status = sub.status === "active" ? "active" : sub.status === "canceled" ? "canceled" : "past_due";

      await admin
        .from("profiles")
        .update({
          plan_status: status,
          plan_renews_at: renewsAt,
          updated_at: now
        } as never)
        .eq("id", user.id);

      return NextResponse.json({
        ok: true,
        synced: "subscription_refreshed",
        plan: profile?.plan ?? "premium",
        planStatus: status,
        renewsAt
      });
    } catch (error) {
      console.error("[billing/sync] subscription get failed", error);
    }
  }

  // 2. Cherche un premier paiement "paid" sans subscription créée
  let payments;
  try {
    payments = await mollie.customerPayments.page({ customerId, limit: 50 });
  } catch (error) {
    console.error("[billing/sync] payments list failed", error);
    return NextResponse.json(
      { error: "Impossible de joindre Mollie. Réessayez dans quelques minutes." },
      { status: 502 }
    );
  }

  const firstPaid = payments.find(
    (payment) =>
      payment.sequenceType === SequenceType.first && payment.status === PaymentStatus.paid
  );

  if (!firstPaid) {
    const pending = payments.find(
      (payment) =>
        payment.sequenceType === SequenceType.first &&
        (payment.status === PaymentStatus.open || payment.status === PaymentStatus.pending)
    );
    if (pending) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Votre paiement est encore en cours côté Mollie. Réessayez dans quelques minutes."
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: "Aucun paiement validé trouvé. Lancez un nouveau checkout depuis /tarifs."
      },
      { status: 404 }
    );
  }

  // 3. Recrée la subscription Mollie à partir du metadata + active le plan
  const metadata = (firstPaid.metadata ?? {}) as {
    userId?: string;
    plan?: Plan;
    interval?: PlanInterval;
  };
  const plan: Plan = metadata.plan ?? "premium";
  const interval: PlanInterval = metadata.interval ?? "monthly";
  const planDef = PLANS[plan];
  const amount = interval === "monthly" ? planDef.price.monthly : planDef.price.yearly;

  try {
    const subscription = await mollie.customerSubscriptions.create({
      customerId,
      amount: toMollieAmount(amount),
      interval: getMollieInterval(interval),
      description: describeSubscription(plan, interval),
      webhookUrl: new URL("/api/billing/webhook", request.url).toString(),
      metadata: { userId: user.id, plan, interval }
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
        mollie_mandate_id: firstPaid.mandateId ?? null,
        updated_at: now
      } as never)
      .eq("id", user.id);

    return NextResponse.json({
      ok: true,
      synced: "subscription_created",
      plan,
      planStatus: "active",
      planInterval: interval,
      renewsAt
    });
  } catch (error) {
    console.error("[billing/sync] subscription create failed", error);
    const message = error instanceof Error ? error.message : "Erreur Mollie";
    return NextResponse.json(
      { error: `Création de l'abonnement Mollie échouée : ${message}` },
      { status: 502 }
    );
  }
}
