"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { formatUnreadAriaLabel, formatUnreadBadge } from "@/lib/notifications/inbox";
import { useNotifications } from "@/components/notifications/notifications-provider";
import { NotificationInbox } from "@/components/notifications/notification-inbox";

export function NotificationBell() {
  const { unreadCount, refresh } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const badge = formatUnreadBadge(unreadCount);

  useEffect(() => {
    if (!open) return;
    void refresh({ includeList: true });
  }, [open, refresh]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      void refresh({ includeList: open });
    };
    const onFocus = () => {
      void refresh({ includeList: open });
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [open, refresh]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={formatUnreadAriaLabel(unreadCount)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={formatUnreadAriaLabel(unreadCount)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
      >
        <Bell className="h-4 w-4" strokeWidth={2} aria-hidden />
        {badge ? (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-4 text-white"
          >
            {badge}
          </span>
        ) : null}
      </button>
      {open ? <NotificationInbox onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
