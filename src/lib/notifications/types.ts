import type { NotificationRow, UUID } from "@/types/database";

/** Modèle métier inbox, distinct de NotificationLogRow (journal Push). */
export interface AppNotification {
  id: UUID;
  userId: UUID;
  vehicleId: UUID | null;
  type: string;
  title: string;
  body: string;
  href: string | null;
  dedupeKey: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  readAt: string | null;
  lastPushedAt: string | null;
}

export const DEFAULT_NOTIFICATIONS_LIMIT = 50;

export function toAppNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    vehicleId: row.vehicle_id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    dedupeKey: row.dedupe_key,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    readAt: row.read_at,
    lastPushedAt: row.last_pushed_at
  };
}
