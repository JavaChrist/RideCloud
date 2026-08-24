import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendToUser } from "@/lib/push/server";
import { processNotificationCron } from "@/lib/notifications/cron";
import {
  insertNotificationLog,
  markNotificationPushed,
  persistBusinessNotification
} from "@/lib/notifications/persist";
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
      loadPushUserIds: async () => {
        const { data, error } = await admin.from("push_subscriptions").select("user_id");
        if (error) {
          throw new Error(error.message);
        }
        return new Set((data ?? []).map((row) => (row as { user_id: string }).user_id));
      },
      persistAlert: async (alert) => {
        const row = await persistBusinessNotification(admin, alert);
        if (!row) return null;
        return {
          id: row.id,
          lastPushedAt: row.last_pushed_at,
          readAt: row.read_at,
          dedupeKey: row.dedupe_key
        };
      },
      latestLogSentAt: async (alert) => {
        let query = admin
          .from("notification_log")
          .select("sent_at")
          .eq("user_id", alert.userId)
          .eq("vehicle_id", alert.vehicleId)
          .eq("kind", alert.type)
          .order("sent_at", { ascending: false })
          .limit(1);
        query = alert.subjectId ? query.eq("subject_id", alert.subjectId) : query.is("subject_id", null);
        const { data, error } = await query.maybeSingle();
        if (error) {
          throw new Error(error.message);
        }
        return (data as { sent_at: string } | null)?.sent_at ?? null;
      },
      sendPush: (userId, payload) => sendToUser(userId, payload),
      markPushed: (notificationId, at) => markNotificationPushed(admin, notificationId, at),
      logPushSuccess: (input) => insertNotificationLog(admin, input)
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
