import { formatDistance, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { AppNotification } from "@/lib/notifications/types";

export const INBOX_NOTIFICATIONS_LIMIT = 50;

export function formatUnreadBadge(count: number): string | null {
  if (count <= 0) return null;
  if (count > 99) return "99+";
  return String(count);
}

export function formatUnreadAriaLabel(count: number): string {
  if (count <= 0) return "Notifications, aucune non lue";
  if (count === 1) return "Notifications, 1 non lue";
  return `Notifications, ${count} non lues`;
}

export function notificationUrgencyRank(metadata: Record<string, unknown> | null | undefined): number {
  const status = metadata?.status;
  if (status === "overdue") return 0;
  if (status === "due_soon") return 1;
  return 2;
}

/**
 * Tri UI N3 : non lues d'abord, puis overdue / due_soon / autres,
 * puis created_at DESC. Le serveur N1 reste en created_at DESC ;
 * on retrie après chargement d'une limite raisonnable (50).
 */
export function sortInboxNotifications<
  T extends {
    id: string;
    readAt: string | null;
    createdAt: string;
    metadata: Record<string, unknown>;
  }
>(rows: T[]): T[] {
  return [...rows].sort((left, right) => {
    const unreadLeft = left.readAt == null ? 0 : 1;
    const unreadRight = right.readAt == null ? 0 : 1;
    if (unreadLeft !== unreadRight) return unreadLeft - unreadRight;

    const rankLeft = notificationUrgencyRank(left.metadata);
    const rankRight = notificationUrgencyRank(right.metadata);
    if (rankLeft !== rankRight) return rankLeft - rankRight;

    if (left.createdAt !== right.createdAt) {
      return left.createdAt < right.createdAt ? 1 : -1;
    }
    return left.id < right.id ? 1 : -1;
  });
}

export function isSafeInternalHref(href: string | null | undefined): href is string {
  if (!href) return false;
  if (!href.startsWith("/")) return false;
  if (href.startsWith("//") || href.startsWith("/\\")) return false;
  if (href.includes("://")) return false;
  return true;
}

export function formatNotificationTime(createdAt: string, now?: Date): string {
  try {
    return formatDistance(parseISO(createdAt), now ?? new Date(), {
      addSuffix: true,
      locale: fr
    });
  } catch {
    return "";
  }
}

export function applyMarkOneRead(rows: AppNotification[], notificationId: string, readAt: string): AppNotification[] {
  return rows.map((row) => (row.id === notificationId ? { ...row, readAt } : row));
}

export function applyMarkAllRead(rows: AppNotification[], readAt: string): AppNotification[] {
  return rows.map((row) => (row.readAt == null ? { ...row, readAt } : row));
}

export function applyRemoveNotification(
  rows: AppNotification[],
  notificationId: string
): { rows: AppNotification[]; removed: AppNotification | undefined } {
  const removed = rows.find((row) => row.id === notificationId);
  return {
    rows: rows.filter((row) => row.id !== notificationId),
    removed
  };
}

export function unreadCountAfterRemove(
  count: number,
  removed: Pick<AppNotification, "readAt"> | undefined
): number {
  if (removed == null || removed.readAt != null) {
    return Math.max(0, count);
  }
  return Math.max(0, count - 1);
}
