/**
 * Helpers Web Push côté navigateur.
 *
 * L'enregistrement du Service Worker est partagé avec le client PWA
 * (`registerRideCloudServiceWorker`). Ici : permission, souscription Web Push
 * et appels API. Les composants UI n'ont qu'à appeler `enablePush()` /
 * `disablePush()` / `getPushStatus()`.
 * Enregistrement SW ≠ opt-in notifications.
 *
 * Compatibilité :
 *   - Android Chrome / Edge / Firefox : OK
 *   - iOS Safari : nécessite l'app PWA installée (Ajouter à l'écran d'accueil)
 *     ET iOS 16.4+. Les navigateurs iOS hors PWA installée ne supportent
 *     pas Push.
 */

import { getRideCloudServiceWorkerRegistration, registerRideCloudServiceWorker } from "@/lib/pwa/service-worker";

export type PushSupport =
  | "unsupported"
  | "needs-install" // iOS Safari hors PWA installée
  | "supported";

export interface PushStatus {
  support: PushSupport;
  permission: NotificationPermission | "unsupported";
  subscribed: boolean;
}

/** Détecte la situation iOS PWA-only sans cracher sur d'autres navigateurs. */
function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const mediaStandalone = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true;
  return mediaStandalone || iosStandalone;
}

function detectSupport(): PushSupport {
  if (typeof window === "undefined") return "unsupported";
  if (!("serviceWorker" in navigator)) return "unsupported";
  if (!("PushManager" in window)) return "unsupported";
  if (!("Notification" in window)) return "unsupported";

  // iOS Safari : Push uniquement quand l'app est installée et ouverte en
  // mode standalone (Ajouter à l'écran d'accueil).
  const ua = navigator.userAgent || "";
  const isIos = /iPad|iPhone|iPod/.test(ua);
  if (isIos && !isStandaloneDisplay()) return "needs-install";

  return "supported";
}

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i += 1) {
    view[i] = rawData.charCodeAt(i);
  }
  return buffer;
}

/** Récupère (ou crée) l'enregistrement du Service Worker /sw.js. */

/**
 * État courant : support du navigateur + permission notification + s'il
 * existe déjà une PushSubscription côté browser.
 */
export async function getPushStatus(): Promise<PushStatus> {
  const support = detectSupport();
  if (support === "unsupported" || support === "needs-install") {
    return {
      support,
      permission: support === "unsupported" ? "unsupported" : Notification.permission,
      subscribed: false
    };
  }

  const permission = Notification.permission;
  let subscribed = false;
  try {
    const registration = await getRideCloudServiceWorkerRegistration();
    if (registration) {
      const sub = await registration.pushManager.getSubscription();
      subscribed = sub !== null;
    }
  } catch {
    subscribed = false;
  }

  return { support, permission, subscribed };
}

/**
 * Active les notifications : demande la permission, enregistre le SW,
 * souscrit au PushManager, envoie le tout à l'API.
 *
 * Renvoie un message d'erreur utilisateur en cas d'échec connu, sinon
 * `null`.
 */
export async function enablePush(vapidPublicKey: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const support = detectSupport();
  if (support === "unsupported") {
    return { ok: false, reason: "Ce navigateur ne supporte pas les notifications push." };
  }
  if (support === "needs-install") {
    return {
      ok: false,
      reason:
        "Sur iPhone, installe d'abord l'app via Safari → \"Ajouter à l'écran d'accueil\", puis active les notifications depuis l'app installée."
    };
  }

  if (Notification.permission === "denied") {
    return {
      ok: false,
      reason: "Les notifications sont bloquées dans le navigateur. Active-les dans les réglages du site puis réessaie."
    };
  }

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { ok: false, reason: "Permission refusée." };
    }
  }

  const registration = await registerRideCloudServiceWorker();
  if (!registration) {
    return { ok: false, reason: "Impossible d'enregistrer le Service Worker." };
  }
  // Attend que le SW soit "ready" avant de souscrire (parfois `register`
  // résout avant que l'activation soit terminée).
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToArrayBuffer(vapidPublicKey)
    });
  }

  const payload = subscription.toJSON();
  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: payload.endpoint,
      keys: payload.keys,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null
    })
  });

  if (!response.ok) {
    return {
      ok: false,
      reason: "Souscription échouée côté serveur. Réessaie dans un instant."
    };
  }

  return { ok: true };
}

/**
 * Coupe les notifications côté navigateur ET côté serveur. Idempotent :
 * si l'utilisateur n'était pas abonné, renvoie ok.
 */
export async function disablePush(): Promise<{ ok: true } | { ok: false; reason: string }> {
  const support = detectSupport();
  if (support === "unsupported") return { ok: true };

  try {
    const registration = await getRideCloudServiceWorkerRegistration();
    if (!registration) return { ok: true };

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return { ok: true };

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint })
    });

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Erreur inconnue"
    };
  }
}
