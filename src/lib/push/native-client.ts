import { isCapacitorAndroid } from "@/lib/pwa/environment";
import { extractPushNotificationHref } from "@/lib/push/native-url";

export const RIDE_CLOUD_ANDROID_CHANNEL_ID = "ridecloud-default";
export const NATIVE_PUSH_INSTALLATION_KEY = "ridecloud.nativePushInstallationId";
export const NATIVE_PUSH_LINKED_KEY = "ridecloud.nativePushLinked";

export type NativePushPermission = "prompt" | "granted" | "denied" | "unsupported";

export interface NativePushStatus {
  available: boolean;
  permission: NativePushPermission;
  linked: boolean;
}

let listenersReady = false;
let onForegroundReceivedHandler: (() => void) | undefined;
let onActionUrlHandler: ((href: string) => void) | undefined;
let pendingTokenResolve: ((token: string) => void) | undefined;

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

function waitForRegistrationToken(timeoutMs = 15000): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("token_timeout")), timeoutMs);
    pendingTokenResolve = (token) => {
      clearTimeout(timer);
      pendingTokenResolve = undefined;
      resolve(token);
    };
  });
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
    pendingTokenResolve?.(token.value);
    void persistRegistrationToken(token.value).catch((error) => {
      console.error("[native-push] register token failed", error);
    });
  });

  await PushNotifications.addListener("registrationError", (error) => {
    console.error("[native-push] registrationError", error);
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
  if (!isCapacitorAndroid()) {
    return { available: false, permission: "unsupported", linked: false };
  }
  try {
    const PushNotifications = await getPushPlugin();
    const current = await PushNotifications.checkPermissions();
    return {
      available: true,
      permission: mapReceivePermission(current.receive),
      linked: readLinkedFlag()
    };
  } catch {
    return { available: false, permission: "unsupported", linked: false };
  }
}

export async function enableNativePush(): Promise<{ ok: true } | { ok: false; reason: string; permission: NativePushPermission }> {
  if (!isCapacitorAndroid()) {
    return { ok: false, reason: "Notifications natives disponibles uniquement dans l'app Android.", permission: "unsupported" };
  }

  await ensureNativePushListeners();
  await ensureAndroidChannel();

  const PushNotifications = await getPushPlugin();
  let current = await PushNotifications.checkPermissions();
  if (current.receive === "denied") {
    return {
      ok: false,
      reason:
        "Les notifications sont bloquées pour RideCloud. Ouvre Paramètres Android → Applications → RideCloud → Notifications pour les autoriser.",
      permission: "denied"
    };
  }

  if (current.receive !== "granted") {
    current = await PushNotifications.requestPermissions();
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

  const tokenWait = waitForRegistrationToken();
  await PushNotifications.register();
  try {
    const token = await tokenWait;
    await persistRegistrationToken(token);
  } catch {
    return {
      ok: false,
      reason: "Impossible de récupérer le jeton de notification. Réessaie dans un instant.",
      permission: "granted"
    };
  }
  return { ok: true };
}

/** Si la permission est déjà accordée, rafraîchit le token sans redemander. */
export async function syncNativePushIfGranted(handlers?: {
  onForegroundReceived?: () => void;
  onActionUrl?: (href: string) => void;
}): Promise<void> {
  if (!isCapacitorAndroid()) return;
  const PushNotifications = await getPushPlugin();
  const current = await PushNotifications.checkPermissions();
  if (current.receive !== "granted") return;
  await ensureNativePushListeners(handlers);
  await ensureAndroidChannel();
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
