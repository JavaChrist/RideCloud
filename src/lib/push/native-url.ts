const FALLBACK_HREF = "/categories";

/** Destinations internes RideCloud uniquement — jamais d'URL externe injectée. */
export function resolveRideCloudPushHref(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return FALLBACK_HREF;
  const trimmed = url.trim();
  if (!trimmed.startsWith("/")) return FALLBACK_HREF;
  if (trimmed.startsWith("//")) return FALLBACK_HREF;
  if (trimmed.includes("://") || trimmed.includes("\\")) return FALLBACK_HREF;
  if (/[\s<>'"]/.test(trimmed)) return FALLBACK_HREF;
  return trimmed;
}

export function extractPushNotificationHref(notification: {
  data?: Record<string, unknown> | null;
  notification?: { data?: Record<string, unknown> | null };
}): string {
  const nested = notification.notification?.data?.url;
  const top = notification.data?.url;
  const raw = typeof top === "string" ? top : typeof nested === "string" ? nested : null;
  return resolveRideCloudPushHref(raw);
}
