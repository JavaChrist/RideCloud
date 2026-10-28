import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMollieClient, hasMollieEnv } from "@/lib/billing/mollie";
import { cancelPlaySubscription, hasPlayBillingEnv } from "@/lib/billing/play-publisher";
import { playManageSubscriptionsUrl } from "@/lib/billing/play-products";

export const dynamic = "force-dynamic";

/**
 * POST /api/billing/cancel
 *
 * Annule l'abonnement actif (Mollie ou Google Play). Le plan reste actif
 * jusqu'à `plan_renews_at`. Les membres Family perdent le garage partagé
 * seulement à cette date.
 */
export async function POST() {
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
      "billing_provider, mollie_customer_id, mollie_subscription_id, play_product_id, play_purchase_token, plan_status"
    )
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as {
    billing_provider: string | null;
    mollie_customer_id: string | null;
    mollie_subscription_id: string | null;
    play_product_id: string | null;
    play_purchase_token: string | null;
    plan_status: string | null;
  } | null;

  const isPlay =
    profile?.billing_provider === "play" || Boolean(profile?.play_purchase_token);

  if (isPlay) {
    if (!profile?.play_purchase_token || !profile.play_product_id) {
      return NextResponse.json(
        { error: "Aucun abonnement Google Play actif à annuler." },
        { status: 404 }
      );
    }
    if (hasPlayBillingEnv()) {
      try {
        await cancelPlaySubscription({
          productId: profile.play_product_id,
          purchaseToken: profile.play_purchase_token
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur Google Play";
        return NextResponse.json(
          { error: `Annulation Google Play échouée : ${message}` },
          { status: 500 }
        );
      }
    }

    await admin
      .from("profiles")
      .update({
        plan_canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as never)
      .eq("id", user.id);

    return NextResponse.json({
      ok: true,
      provider: "play",
      manageUrl: playManageSubscriptionsUrl(profile.play_product_id)
    });
  }

  if (!hasMollieEnv()) {
    return NextResponse.json(
      { error: "Paiements indisponibles : MOLLIE_API_KEY non configurée." },
      { status: 503 }
    );
  }

  if (!profile?.mollie_customer_id || !profile?.mollie_subscription_id) {
    return NextResponse.json(
      { error: "Aucun abonnement actif à annuler." },
      { status: 404 }
    );
  }

  const mollie = getMollieClient();
  try {
    await mollie.customerSubscriptions.cancel(profile.mollie_subscription_id, {
      customerId: profile.mollie_customer_id
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur Mollie";
    return NextResponse.json(
      { error: `Annulation échouée : ${message}` },
      { status: 500 }
    );
  }

  await admin
    .from("profiles")
    .update({
      plan_canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as never)
    .eq("id", user.id);

  return NextResponse.json({ ok: true, provider: "mollie" });
}
