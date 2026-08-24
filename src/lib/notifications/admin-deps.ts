import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { sendToUser } from "@/lib/push/server";
import {
  insertNotificationLog,
  markNotificationPushed,
  persistBusinessNotification
} from "@/lib/notifications/persist";
import type { CronDependencies } from "@/lib/notifications/cron";

type AdminClient = SupabaseClient<Database>;

export function createAdminNotificationDeps(
  admin: AdminClient,
  options?: { pushUserId?: string }
): Omit<CronDependencies, "loadVehicles" | "loadPlanEntries" | "now"> {
  return {
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
    loadPushUserIds: async () => {
      let query = admin.from("push_subscriptions").select("user_id");
      if (options?.pushUserId) {
        query = query.eq("user_id", options.pushUserId);
      }
      const { data, error } = await query;
      if (error) {
        throw new Error(error.message);
      }
      return new Set((data ?? []).map((row) => (row as { user_id: string }).user_id));
    },
    sendPush: (userId, payload) => sendToUser(userId, payload),
    markPushed: (notificationId, at) => markNotificationPushed(admin, notificationId, at),
    logPushSuccess: (input) => insertNotificationLog(admin, input)
  };
}
