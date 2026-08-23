"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead
} from "@/lib/notifications/repository";
import { applyMarkAllRead, applyMarkOneRead, INBOX_NOTIFICATIONS_LIMIT, sortInboxNotifications } from "@/lib/notifications/inbox";
import type { AppNotification } from "@/lib/notifications/types";

interface NotificationsContextValue {
  unreadCount: number;
  notifications: AppNotification[];
  loading: boolean;
  error: string | null;
  refresh: (options?: { includeList?: boolean }) => Promise<void>;
  markRead: (notificationId: string) => Promise<boolean>;
  markAllRead: () => Promise<boolean>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function tryCreateBrowserClient() {
  try {
    return createClient();
  } catch (error) {
    console.error("[notifications] client indisponible", error);
    return null;
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => tryCreateBrowserClient(), []);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (options?: { includeList?: boolean }) => {
      if (!supabase) {
        setError("Notifications indisponibles.");
        return;
      }
      setLoading(true);
      try {
        const count = await getUnreadNotificationCount(supabase);
        setUnreadCount(count);
        if (options?.includeList) {
          const rows = await getNotifications(supabase, { limit: INBOX_NOTIFICATIONS_LIMIT });
          setNotifications(sortInboxNotifications(rows));
        }
        setError(null);
      } catch (cause) {
        console.error("[notifications] refresh failed", cause);
        setError("Impossible de charger les notifications.");
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!supabase) return false;
      const previous = notifications;
      const previousCount = unreadCount;
      const wasUnread = previous.find((row) => row.id === notificationId)?.readAt == null;
      const readAt = new Date().toISOString();
      setNotifications(sortInboxNotifications(applyMarkOneRead(previous, notificationId, readAt)));
      if (wasUnread) setUnreadCount((count) => Math.max(0, count - 1));
      try {
        await markNotificationRead(supabase, notificationId);
        const count = await getUnreadNotificationCount(supabase);
        setUnreadCount(count);
        return true;
      } catch (cause) {
        console.error("[notifications] markRead failed", cause);
        setNotifications(previous);
        setUnreadCount(previousCount);
        await refresh({ includeList: true });
        return false;
      }
    },
    [notifications, refresh, supabase, unreadCount]
  );

  const markAllRead = useCallback(async () => {
    if (!supabase) return false;
    const previous = notifications;
    const previousCount = unreadCount;
    const readAt = new Date().toISOString();
    setNotifications(applyMarkAllRead(previous, readAt));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead(supabase);
      const count = await getUnreadNotificationCount(supabase);
      setUnreadCount(count);
      return true;
    } catch (cause) {
      console.error("[notifications] markAllRead failed", cause);
      setNotifications(previous);
      setUnreadCount(previousCount);
      await refresh({ includeList: true });
      return false;
    }
  }, [notifications, refresh, supabase, unreadCount]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      unreadCount,
      notifications,
      loading,
      error,
      refresh,
      markRead,
      markAllRead
    }),
    [error, loading, markAllRead, markRead, notifications, refresh, unreadCount]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return context;
}
