import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAdminNotificationDeps } from "@/lib/notifications/admin-deps";
import { processNotificationCron } from "@/lib/notifications/cron";
import type { MaintenancePlanEntry, Vehicle } from "@/types/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface VehicleWithUser extends Vehicle {
  user_id: string;
}

/**
 * Vérifie le secret du cron : header Authorization "Bearer X" ou
 * query ?token=X. Vercel Cron envoie `Authorization: Bearer $CRON_SECRET`
 * automatiquement quand on configure le job.
 */
function isAuthorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const auth = request.headers.get("authorization");
  if (auth && auth === `Bearer ${expected}`) return true;

  const url = new URL(request.url);
  if (url.searchParams.get("token") === expected) return true;

  return false;
}

/**
 * POST/GET /api/cron/notifications
 *
 * 1. calcule les événements métier pour tous les véhicules
 * 2. upsert `notifications` (inbox indépendante du Push)
 * 3. Push uniquement si abonnement actif + cooldown `last_pushed_at`
 * 4. journalise le Push réussi dans `notification_log`
 */
async function handle(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  let result;
  try {
    result = await processNotificationCron({
      loadVehicles: async () => {
        const { data, error } = await admin.from("vehicles").select("*");
        if (error) {
          throw new Error(error.message);
        }
        return (data ?? []) as VehicleWithUser[];
      },
      loadPlanEntries: async (vehicleIds) => {
        if (vehicleIds.length === 0) return [];
        const { data, error } = await admin
          .from("maintenance_plan_entries")
          .select("*")
          .in("vehicle_id", vehicleIds);
        if (error) {
          throw new Error(error.message);
        }
        return (data ?? []) as MaintenancePlanEntry[];
      },
      ...createAdminNotificationDeps(admin)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json({ ok: false, reason: "db_error", details: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...result });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
