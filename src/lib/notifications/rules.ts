/**
 * Règles métier testables sans Postgres.
 * La sécurité réelle (RLS / RPC auth.uid()) vit dans la migration.
 */

export function isUnreadNotification(readAt: string | null): boolean {
  return readAt == null;
}

export function countUnreadNotifications(rows: Array<{ read_at: string | null }>): number {
  return rows.filter((row) => isUnreadNotification(row.read_at)).length;
}

export function canAccessNotification(actorUserId: string, ownerUserId: string): boolean {
  return actorUserId === ownerUserId;
}

export function isSameUserDedupeKey(
  left: { user_id: string; dedupe_key: string },
  right: { user_id: string; dedupe_key: string }
): boolean {
  return left.user_id === right.user_id && left.dedupe_key === right.dedupe_key;
}

export function isOccurrenceDismissed(
  dismissals: Array<{ user_id: string; dedupe_key: string }>,
  occurrence: { user_id: string; dedupe_key: string }
): boolean {
  return dismissals.some((row) => isSameUserDedupeKey(row, occurrence));
}

export function filterNotificationsForUser<T extends { user_id: string }>(
  rows: T[],
  userId: string
): T[] {
  return rows.filter((row) => row.user_id === userId);
}
