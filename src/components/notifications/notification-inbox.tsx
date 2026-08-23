"use client";

import { useRouter } from "next/navigation";
import { formatNotificationTime, isSafeInternalHref } from "@/lib/notifications/inbox";
import { useNotifications } from "@/components/notifications/notifications-provider";
import { cn } from "@/lib/utils";

function unreadTone(status: unknown) {
  if (status === "overdue") return "bg-red-500";
  if (status === "due_soon") return "bg-amber-500";
  return "bg-blue-600";
}

export function NotificationInbox({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { notifications, unreadCount, loading, error, markRead, markAllRead } = useNotifications();

  const handleOpen = async (notificationId: string, href: string | null) => {
    const ok = await markRead(notificationId);
    if (!ok) return;
    if (isSafeInternalHref(href)) {
      onClose();
      router.push(href);
      return;
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Boîte de réception des notifications"
      className="absolute right-0 top-full z-50 mt-2 flex w-[min(24rem,calc(100vw-1.5rem))] max-h-[min(28rem,70vh)] flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-lg dark:border-slate-700/80 dark:bg-slate-900 max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-[calc(env(safe-area-inset-top)+3.25rem)] max-sm:mt-0 max-sm:w-auto"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-3 py-2.5 dark:border-slate-700/80">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Notifications</p>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="text-xs font-medium text-blue-700 transition hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
          >
            Tout marquer comme lu
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {error ? (
          <p className="px-3 py-3 text-sm text-amber-700 dark:text-amber-300" role="status">
            {error}
          </p>
        ) : null}
        {!error && loading && notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
        ) : null}
        {!error && !loading && notifications.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Aucune notification
          </p>
        ) : null}
        {notifications.length > 0 ? (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((notification) => {
              const unread = notification.readAt == null;
              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => void handleOpen(notification.id, notification.href)}
                    className={cn(
                      "flex w-full gap-3 px-3 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/70",
                      unread && "bg-blue-50/50 dark:bg-blue-950/20"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        unread ? unreadTone(notification.metadata.status) : "bg-transparent"
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-sm",
                          unread
                            ? "font-semibold text-slate-900 dark:text-slate-50"
                            : "font-medium text-slate-600 dark:text-slate-300"
                        )}
                      >
                        {notification.title}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500 dark:text-slate-400">
                        {notification.body}
                      </span>
                      <span className="mt-1 block text-[11px] text-slate-400 dark:text-slate-500">
                        {formatNotificationTime(notification.createdAt)}
                        {unread ? " · Non lue" : " · Lue"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
