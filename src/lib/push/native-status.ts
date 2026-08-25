import type { PushStatus } from "@/lib/push/client";

export type NativePushPermission = "prompt" | "granted" | "denied" | "unsupported";

export interface NativePushStatus {
  available: boolean;
  permission: NativePushPermission;
  linked: boolean;
  checkFailed?: boolean;
}

export const NATIVE_PUSH_DETECTION_TIMEOUT_MS = 8000;

export type NotificationsDetectionPhase = "loading" | "ready" | "error";

export type NotificationsDetectionView =
  | { kind: "loading" }
  | { kind: "error"; message: string; recoverable: true }
  | {
      kind: "native";
      permission: NativePushPermission;
      linked: boolean;
      label: "activated" | "denied" | "prompt" | "check_failed";
    }
  | { kind: "web"; status: PushStatus };

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label = "timeout"
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(label)), timeoutMs);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function resolveNativeActionView(input: {
  permission: NativePushPermission;
  linked: boolean;
  actionError?: "registration_error" | "register_api" | "timeout" | null;
}): NotificationsDetectionView {
  if (input.actionError === "timeout") {
    return { kind: "error", message: "Impossible de vérifier les notifications", recoverable: true };
  }
  if (input.actionError === "registration_error" || input.actionError === "register_api") {
    return { kind: "error", message: "Impossible de vérifier les notifications", recoverable: true };
  }
  return resolveNotificationsDetectionView({
    phase: "ready",
    isAndroidNative: true,
    nativeStatus: {
      available: true,
      permission: input.permission,
      linked: input.linked
    },
    webStatus: null,
    error: null
  });
}

export function nativeStatusLabel(status: NativePushStatus): "activated" | "denied" | "prompt" | "check_failed" {
  if (status.checkFailed && !status.linked) return "check_failed";
  if (status.permission === "denied") return "denied";
  if (status.permission === "granted" && status.linked) return "activated";
  return "prompt";
}

/**
 * Décide l'UI Paramètres. Un statut déjà connu gagne toujours sur le spinner,
 * y compris si un re-register silencieux est encore en cours.
 */
export function resolveNotificationsDetectionView(input: {
  phase: NotificationsDetectionPhase;
  isAndroidNative: boolean;
  nativeStatus: NativePushStatus | null;
  webStatus: PushStatus | null;
  error: string | null;
}): NotificationsDetectionView {
  if (input.isAndroidNative && input.nativeStatus) {
    return {
      kind: "native",
      permission: input.nativeStatus.permission,
      linked: input.nativeStatus.linked,
      label: nativeStatusLabel(input.nativeStatus)
    };
  }

  if (!input.isAndroidNative && input.webStatus) {
    return { kind: "web", status: input.webStatus };
  }

  if (input.phase === "error" || input.error) {
    return {
      kind: "error",
      message: input.error ?? "Impossible de vérifier les notifications",
      recoverable: true
    };
  }

  return { kind: "loading" };
}
