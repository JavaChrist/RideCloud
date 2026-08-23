/**
 * Persistance notifications côté cron / service_role.
 * Ne pas importer depuis le repository client N1 (RLS / RPC authenticated).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, NotificationKind, NotificationRow } from "@/types/database";
import { shouldReopenReadNotification } from "@/lib/notifications/dedupe";
import type { NotificationAlert } from "@/lib/notifications/alerts";

type AdminClient = SupabaseClient<Database>;

export interface PersistNotificationRow {
  user_id: string;
  vehicle_id: string;
  type: NotificationAlert["type"];
  title: string;
  body: string;
  href: string;
  dedupe_key: string;
  metadata: Record<string, unknown>;
  read_at?: string | null;
  last_pushed_at?: string | null;
}

export function existingNotificationStatus(
  metadata: Record<string, unknown> | null | undefined
): string | null {
  const status = metadata?.status;
  return typeof status === "string" ? status : null;
}

/** Décide le payload d'upsert sans SELECT+INSERT naïf côté appelant. */
export function buildNotificationUpsertRow(
  alert: NotificationAlert,
  existing: Pick<NotificationRow, "read_at" | "last_pushed_at" | "metadata"> | null
): PersistNotificationRow {
  const reopen =
    existing != null &&
    shouldReopenReadNotification({
      existingStatus: existingNotificationStatus(existing.metadata),
      incomingStatus: alert.status
    });

  const row: PersistNotificationRow = {
    user_id: alert.userId,
    vehicle_id: alert.vehicleId,
    type: alert.type,
    title: alert.title,
    body: alert.body,
    href: alert.href,
    dedupe_key: alert.dedupeKey,
    metadata: alert.metadata
  };

  if (!existing) {
    row.read_at = null;
    row.last_pushed_at = null;
  } else if (reopen) {
    row.read_at = null;
  }

  return row;
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

export async function persistBusinessNotification(
  admin: AdminClient,
  alert: NotificationAlert,
  attempt = 0
): Promise<NotificationRow> {
  const { data: existing, error: selectError } = await admin
    .from("notifications")
    .select("id, read_at, last_pushed_at, metadata")
    .eq("user_id", alert.userId)
    .eq("dedupe_key", alert.dedupeKey)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  const row = buildNotificationUpsertRow(
    alert,
    (existing as Pick<NotificationRow, "read_at" | "last_pushed_at" | "metadata"> | null) ?? null
  );

  const { data, error } = await admin
    .from("notifications")
    .upsert(row as never, { onConflict: "user_id,dedupe_key" })
    .select("*")
    .single();

  if (error) {
    if (isUniqueViolation(error) && attempt < 1) {
      return persistBusinessNotification(admin, alert, attempt + 1);
    }
    throw new Error(error.message);
  }

  return data as NotificationRow;
}

export async function markNotificationPushed(
  admin: AdminClient,
  notificationId: string,
  at: Date
): Promise<void> {
  const { error } = await admin
    .from("notifications")
    .update({ last_pushed_at: at.toISOString() } as never)
    .eq("id", notificationId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function insertNotificationLog(
  admin: AdminClient,
  input: {
    userId: string;
    vehicleId: string;
    kind: NotificationKind;
    subjectId: string | null;
    payload: Record<string, unknown>;
  }
): Promise<void> {
  const { error } = await admin.from("notification_log").insert({
    user_id: input.userId,
    vehicle_id: input.vehicleId,
    kind: input.kind,
    subject_id: input.subjectId,
    payload: input.payload
  } as never);

  if (error) {
    throw new Error(error.message);
  }
}
