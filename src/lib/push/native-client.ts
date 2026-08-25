import { isCapacitorAndroid } from "@/lib/pwa/environment";
import {
  runNativePushRegistration,
  type NativeRegisterResult
} from "@/lib/push/native-register-flow";
import {
  NATIVE_PUSH_DETECTION_TIMEOUT_MS,
  withTimeout,
  type NativePushPermission,
  type NativePushStatus
} from "@/lib/push/native-status";
import { extractPushNotificationHref } from "@/lib/push/native-url";

export const RIDE_CLOUD_ANDROID_CHANNEL_ID = "ridecloud-default";
export const NATIVE_PUSH_INSTALLATION_KEY = "ridecloud.nativePushInstallationId";
export const NATIVE_PUSH_LINKED_KEY = "ridecloud.nativePushLinked";

export type { NativePushPermission, NativePushStatus };

let listenersReady = false;
let onForegroundReceivedHandler: (() => void) | undefined;
let onActionUrlHandler: ((href: string) => void) | undefined;
let pendingTokenResolve: ((token: string) => void) | undefined;
let pendingTokenReject: ((error: Error) => void) | undefined;

function readLinkedFlag(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(NATIVE_PUSH_LINKED_KEY) === "1";
}

function writeLinkedFlag(linked: boolean): void {
  if (typeof window === "undefined") return;
  if (linked) {
    window.localStorage.setItem(NATIVE_PUSH_LINKED_KEY, "1");
    return;
  }
  window.localStorage.removeItem(NATIVE_PUSH_LINKED_KEY);
}

export function getOrCreateNativeInstallationId(): string {
  if (typeof window === "undefined") return "ssr";
  const existing = window.localStorage.getItem(NATIVE_PUSH_INSTALLATION_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.localStorage.setItem(NATIVE_PUSH_INSTALLATION_KEY, created);
  return created;
}

function mapReceivePermission(receive: string | undefined): NativePushPermission {
  if (receive === "granted") return "granted";
  if (receive === "denied") return "denied";
  if (receive === "prompt" || receive === "prompt-with-rationale") return "prompt";
  return "prompt";
}

async function getPushPlugin() {
  const { PushNotifications } = await import("@capacitor/push-notifications");
  return PushNotifications;
}

async function ensureAndroidChannel(): Promise<void> {
  const PushNotifications = await getPushPlugin();
  await PushNotifications.createChannel({
    id: RIDE_CLOUD_ANDROID_CHANNEL_ID,
    name: "RideCloud",
    description: "Rappels et alertes RideCloud",
    importance: 4,
    visibility: 1,
    vibration: true,
    sound: "default"
  });
}

async function persistRegistrationToken(token: string): Promise<void> {
  const response = await fetch("/api/push/native/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      platform: "android",
      installationId: getOrCreateNativeInstallationId()
    })
  });
  if (!response.ok) {
    throw new Error("register_failed");
  }
  writeLinkedFlag(true);
}

async function resetNativePushListeners(): Promise<void> {
  listenersReady = false;
  pendingTokenResolve = undefined;
  pendingTokenReject = undefined;
  try {
    const PushNotifications = await getPushPlugin();
    await PushNotifications.removeAllListeners();
  } catch (error) {
    console.error("[native-push] reset listeners failed", error);
  }
}

function logNativePush(
  event: string,
  extra?: { tokenReceived?: boolean; tokenLength?: number; code?: string }
): void {
  if (extra?.tokenReceived) {
    console.info(`[native-push] ${event}`, { tokenReceived: true, tokenLength: extra.tokenLength });
    return;
  }
  if (extra?.code) {
    console.info(`[native-push] ${event}`, { code: extra.code });
    return;
  }
  console.info(`[native-push] ${event}`);
}

export async function ensureNativePushListeners(handlers?: {
  onForegroundReceived?: () => void;
  onActionUrl?: (href: string) => void;
}): Promise<void> {
  if (handlers?.onForegroundReceived) onForegroundReceivedHandler = handlers.onForegroundReceived;
  if (handlers?.onActionUrl) onActionUrlHandler = handlers.onActionUrl;
  if (!isCapacitorAndroid() || listenersReady) return;
  const PushNotifications = await getPushPlugin();
  await PushNotifications.removeAllListeners();

  await PushNotifications.addListener("registration", (token) => {
    logNativePush("registration:event", { tokenReceived: true, tokenLength: token.value.length });
    pendingTokenResolve?.(token.value);
    void persistRegistrationToken(token.value).catch((error) => {
      console.error("[native-push] register token failed", error);
    });
  });

  await PushNotifications.addListener("registrationError", (error) => {
    const code = typeof error === "object" && error && "error" in error ? String(error.error) : "registration_error";
    logNativePush("registration:error", { code });
    pendingTokenReject?.(new Error(code));
  });

  await PushNotifications.addListener("pushNotificationReceived", () => {
    /**
     * Foreground : FCM + payload `notification` n'affiche pas de notif système
     * tant que l'app est ouverte. On rafraîchit l'inbox, sans doublon local.
     */
    onForegroundReceivedHandler?.();
    window.dispatchEvent(new Event("ridecloud:inbox-refresh"));
  });

  await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    const href = extractPushNotificationHref(action.notification);
    onActionUrlHandler?.(href);
  });

  listenersReady = true;
}

export async function getNativePushStatus(): Promise<NativePushStatus> {
  const linked = readLinkedFlag();
  if (!isCapacitorAndroid()) {
    return { available: false, permission: "unsupported", linked };
  }
  try {
    const PushNotifications = await withTimeout(getPushPlugin(), NATIVE_PUSH_DETECTION_TIMEOUT_MS, "plugin_timeout");
    const current = await withTimeout(
      PushNotifications.checkPermissions(),
      NATIVE_PUSH_DETECTION_TIMEOUT_MS,
      "permission_timeout"
    );
    return {
      available: true,
      permission: mapReceivePermission(current.receive),
      linked,
      checkFailed: false
    };
  } catch (error) {
    console.error("[native-push] getNativePushStatus failed", error);
    return {
      available: true,
      permission: linked ? "granted" : "prompt",
      linked,
      checkFailed: true
    };
  }
}

export async function enableNativePush(): Promise<{ ok: true } | { ok: false; reason: string; permission: NativePushPermission }> {
  if (!isCapacitorAndroid()) {
    return { ok: false, reason: "Notifications natives disponibles uniquement dans l'app Android.", permission: "unsupported" };
  }

  const PushNotifications = await getPushPlugin();
  try {
    let current = await withTimeout(
      PushNotifications.checkPermissions(),
      NATIVE_PUSH_DETECTION_TIMEOUT_MS,
      "permission_timeout"
    );
    if (current.receive === "denied") {
      return {
        ok: false,
        reason:
          "Les notifications sont bloquées pour RideCloud. Ouvre Paramètres Android → Applications → RideCloud → Notifications pour les autoriser.",
        permission: "denied"
      };
    }
    if (current.receive !== "granted") {
      current = await withTimeout(
        PushNotifications.requestPermissions(),
        NATIVE_PUSH_DETECTION_TIMEOUT_MS,
        "permission_timeout"
      );
    }
    if (current.receive !== "granted") {
      return {
        ok: false,
        reason:
          current.receive === "denied"
            ? "Permission refusée. Tu pourras l'activer plus tard depuis les paramètres Android de RideCloud."
            : "Permission non accordée.",
        permission: mapReceivePermission(current.receive)
      };
    }
  } catch (error) {
    console.error("[native-push] permission check timed out, continuing register", error);
  }

  const result = await registerNativePushTokenWithPlugin();
  if (result.ok) return { ok: true };
  return {
    ok: false,
    reason:
      result.reason === "register_api"
        ? "Impossible d'enregistrer les notifications. Réessaie dans un instant."
        : "Impossible de récupérer le jeton de notification. Réessaie dans un instant.",
    permission: "granted"
  };
}

export async function retryNativePushRegistration(): Promise<NativeRegisterResult> {
  return registerNativePushTokenWithPlugin();
}

async function registerNativePushTokenWithPlugin(): Promise<NativeRegisterResult> {
  const PushNotifications = await getPushPlugin();
  try {
    await withTimeout(ensureAndroidChannel(), NATIVE_PUSH_DETECTION_TIMEOUT_MS, "channel_timeout");
  } catch (error) {
    console.error("[native-push] channel timeout", error);
  }

  return runNativePushRegistration({
    timeoutMs: NATIVE_PUSH_DETECTION_TIMEOUT_MS,
    log: logNativePush,
    resetListeners: resetNativePushListeners,
    installListeners: async (handlers) => {
      await PushNotifications.addListener("registration", (token) => {
        logNativePush("registration:event", { tokenReceived: true, tokenLength: token.value.length });
        handlers.onRegistration(token.value);
      });
      await PushNotifications.addListener("registrationError", (error) => {
        const code = typeof error === "object" && error && "error" in error ? String(error.error) : "registration_error";
        logNativePush("registration:error", { code });
        handlers.onRegistrationError(code);
      });
      await PushNotifications.addListener("pushNotificationReceived", () => {
        onForegroundReceivedHandler?.();
        window.dispatchEvent(new Event("ridecloud:inbox-refresh"));
      });
      await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        onActionUrlHandler?.(extractPushNotificationHref(action.notification));
      });
      listenersReady = true;
    },
    register: () => PushNotifications.register(),
    persistToken: persistRegistrationToken
  });
}

/** Si la permission est déjà accordée, rafraîchit le token sans redemander. */
export async function syncNativePushIfGranted(handlers?: {
  onForegroundReceived?: () => void;
  onActionUrl?: (href: string) => void;
}): Promise<void> {
  if (!isCapacitorAndroid()) return;
  const PushNotifications = await getPushPlugin();
  try {
    const current = await withTimeout(
      PushNotifications.checkPermissions(),
      NATIVE_PUSH_DETECTION_TIMEOUT_MS,
      "permission_timeout"
    );
    if (current.receive !== "granted") return;
  } catch (error) {
    console.error("[native-push] silent sync permission check failed", error);
    return;
  }
  await ensureNativePushListeners(handlers);
  try {
    await withTimeout(ensureAndroidChannel(), NATIVE_PUSH_DETECTION_TIMEOUT_MS, "channel_timeout");
  } catch (error) {
    console.error("[native-push] silent sync channel timeout", error);
  }
  logNativePush("register:start");
  await PushNotifications.register();
}

export async function disableNativePush(): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const installationId = getOrCreateNativeInstallationId();
    await fetch("/api/push/native/unregister", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ installationId })
    });
    writeLinkedFlag(false);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Erreur inconnue"
    };
  }
}

export async function unregisterNativePushOnLogout(): Promise<void> {
  if (!isCapacitorAndroid() || !readLinkedFlag()) return;
  try {
    await disableNativePush();
  } catch (error) {
    console.error("[native-push] logout unregister failed", error);
  }
}
