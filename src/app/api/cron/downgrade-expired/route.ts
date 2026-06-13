import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/cron/downgrade-expired
 *
 * Cron nightly (02h00 UTC) : rétrograde vers Free tous les abonnements annulés
 * dont la période payée est écoulée (`plan_renews_at < now` ET `plan_canceled_at` non null).
 *
 * Ce job est un filet de sécurité — la rétrogradation est aussi faite à la
 * volée dans `getUserPlanState` au premier accès. Le cron garantit la cohérence
 * pour les utilisateurs inactifs (quotas véhicules, stats, etc.).
 *
 * Sécurisé par le header `Authorization: Bearer <CRON_SECRET>` vérifié par Vercel.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY manquante." },
      { status: 503 }
    );
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Récupère tous les profils payants annulés dont la période est écoulée.
  const { data: expiredRaw, error: fetchError } = await admin
    .from("profiles")
    .select("id, plan, plan_renews_at")
    .neq("plan", "free")
    .not("plan_canceled_at", "is", null)
    .lt("plan_renews_at", now);

  if (fetchError) {
    console.error("[cron/downgrade-expired] fetch failed:", fetchError);
    return NextResponse.json(
      { error: `Fetch échoué : ${fetchError.message}` },
      { status: 500 }
    );
  }

  const expired = (expiredRaw ?? []) as Array<{ id: string; plan: string; plan_renews_at: string }>;

  if (expired.length === 0) {
    return NextResponse.json({ ok: true, downgraded: 0 });
  }

  const ids = expired.map((p) => p.id);

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      plan: "free",
      plan_status: "active",
      plan_interval: null,
      plan_renews_at: null,
      plan_canceled_at: null,
      mollie_subscription_id: null,
      updated_at: now
    } as never)
    .in("id", ids);

  if (updateError) {
    console.error("[cron/downgrade-expired] update failed:", updateError);
    return NextResponse.json(
      { error: `Mise à jour échouée : ${updateError.message}` },
      { status: 500 }
    );
  }

  console.info(`[cron/downgrade-expired] ${ids.length} profil(s) rétrogradé(s) vers Free.`);
  return NextResponse.json({ ok: true, downgraded: ids.length });
}
