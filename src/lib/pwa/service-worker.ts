export const SW_PATH = "/sw.js";
export const SW_SCOPE = "/";
export const SKIP_WAITING_MESSAGE = { type: "SKIP_WAITING" } as const;

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

export function isServiceWorkerSupported(
  nav: Pick<Navigator, "serviceWorker"> | undefined = typeof navigator === "undefined" ? undefined : navigator
): boolean {
  return Boolean(nav && "serviceWorker" in nav);
}

export async function getRideCloudServiceWorkerRegistration(
  nav: Pick<Navigator, "serviceWorker"> | undefined = typeof navigator === "undefined" ? undefined : navigator
): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported(nav) || !nav) return null;
  return (await nav.serviceWorker.getRegistration(SW_PATH)) ?? null;
}

/**
 * Enregistre /sw.js une seule fois. N'appelle jamais Notification.requestPermission.
 * Le Push réutilise ce même enregistrement.
 */
export async function registerRideCloudServiceWorker(
  nav: Pick<Navigator, "serviceWorker"> | undefined = typeof navigator === "undefined" ? undefined : navigator
): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported(nav) || !nav) return null;
  if (!registrationPromise) {
    registrationPromise = (async () => {
      const existing = await nav.serviceWorker.getRegistration(SW_PATH);
      if (existing) return existing;
      return nav.serviceWorker.register(SW_PATH, { scope: SW_SCOPE });
    })().catch((error) => {
      registrationPromise = null;
      throw error;
    });
  }
  return registrationPromise;
}

export function resetServiceWorkerRegistrationCache(): void {
  registrationPromise = null;
}

export function postSkipWaiting(worker: Pick<ServiceWorker, "postMessage">): void {
  worker.postMessage(SKIP_WAITING_MESSAGE);
}
