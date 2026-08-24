import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, NotificationRow } from "@/types/database";
import {
  DEFAULT_NOTIFICATIONS_LIMIT,
  toAppNotification,
  type AppNotification
} from "@/lib/notifications/types";

type NotificationsClient = SupabaseClient<Database>;

export async function getNotifications(
  supabase: NotificationsClient,
  options?: { limit?: number }
): Promise<AppNotification[]> {
  const limit = options?.limit ?? DEFAULT_NOTIFICATIONS_LIMIT;
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as NotificationRow[]).map(toAppNotification);
}

/** Compte en base les non-lus (read_at IS NULL). Ne charge pas les lignes. */
export async function getUnreadNotificationCount(supabase: NotificationsClient): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

type NotificationsRpc = {
  rpc: (
    fn: "mark_notification_read" | "mark_all_notifications_read",
    args?: { notification_id: string }
  ) => PromiseLike<{ error: { message: string } | null }>;
};

export async function markNotificationRead(
  supabase: NotificationsClient,
  notificationId: string
): Promise<void> {
  const { error } = await (supabase as unknown as NotificationsRpc).rpc("mark_notification_read", {
    notification_id: notificationId
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function markAllNotificationsRead(supabase: NotificationsClient): Promise<void> {
  const { error } = await (supabase as unknown as NotificationsRpc).rpc("mark_all_notifications_read");
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Supprime une notification de l'inbox.
 * RLS : auth.uid() = user_id.
 * Le trigger SQL écrit le tombstone (user_id, dedupe_key). Aucun impact Push.
 */
export async function deleteNotification(
  supabase: NotificationsClient,
  notificationId: string
): Promise<void> {
  const { data, error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .select("id");

  if (error) {
    throw new Error(error.message);
  }
  if (!data || data.length === 0) {
    throw new Error("NOTIFICATION_NOT_DELETED");
  }
}
