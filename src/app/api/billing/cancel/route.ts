import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMollieClient, hasMollieEnv } from "@/lib/billing/mollie";

export const dynamic = "force-dynamic";

/**
 * POST /api/billing/cancel
 *
 * Annule la subscription Mollie active de l'utilisateur. Le plan reste actif
 * jusqu'à la date de prochain renouvellement (`plan_renews_at`) — Mollie
 * arrête simplement les prélèvements futurs.
 *
 * Pour rétrograder immédiatement, on devrait aussi forcer `plan = 'free'`,
 * mais l'usage métier (la majorité des SaaS) est de laisser l'utilisateur
 * profiter de ce qu'il a payé jusqu'à la fin de la période.
 */
export async function POST() {
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
    .select("mollie_customer_id, mollie_subscription_id, plan_status")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as {
    mollie_customer_id: string | null;
    mollie_subscription_id: string | null;
    plan_status: string | null;
  } | null;

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

  return NextResponse.json({ ok: true });
}
