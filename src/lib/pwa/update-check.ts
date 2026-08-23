import { APP_VERSION_PATH, getLoadedAppVersion, hasDeployedAppUpdate } from "@/lib/pwa/app-version";
import { getRideCloudServiceWorkerRegistration, postSkipWaiting } from "@/lib/pwa/service-worker";

export const PWA_UPDATE_INTERVAL_MS = 60_000;

export function shouldPromptForPwaUpdate(input: {
  isNative: boolean;
  loadedVersion: string;
  deployedVersion: string | null;
  hasWaitingWorker: boolean;
  dismissedVersion?: string | null;
}): boolean {
  if (input.isNative) return false;
  if (input.dismissedVersion) {
    const dismissedThisDeploy =
      input.deployedVersion !== null
        ? input.dismissedVersion === input.deployedVersion
        : input.dismissedVersion === "waiting";
    if (dismissedThisDeploy) return false;
  }
  if (input.hasWaitingWorker) return true;
  return hasDeployedAppUpdate(input.loadedVersion, input.deployedVersion);
}

export function createReloadGuard(reload: () => void): () => boolean {
  let started = false;
  return () => {
    if (started) return false;
    started = true;
    reload();
    return true;
  };
}

export function applyWaitingOrReload(input: {
  waiting: Pick<ServiceWorker, "postMessage"> | null | undefined;
  reloadOnce: () => boolean;
}): "skip-waiting" | "reload" {
  if (input.waiting) {
    postSkipWaiting(input.waiting);
    return "skip-waiting";
  }
  input.reloadOnce();
  return "reload";
}

export async function fetchDeployedAppVersion(
  fetcher: typeof fetch = fetch
): Promise<string | null> {
  const response = await fetcher(APP_VERSION_PATH, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" }
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { version?: unknown };
  return typeof body.version === "string" && body.version.length > 0 ? body.version : null;
}

export interface AppUpdateCheckResult {
  shouldPrompt: boolean;
  deployedVersion: string | null;
  hasWaitingWorker: boolean;
}

let inFlightCheck: Promise<AppUpdateCheckResult> | null = null;

export async function checkForAppUpdate(input: {
  isNative: boolean;
  dismissedVersion?: string | null;
  loadedVersion?: string;
  fetchDeployedVersion?: () => Promise<string | null>;
  refreshRegistration?: () => Promise<ServiceWorkerRegistration | null>;
}): Promise<AppUpdateCheckResult> {
  if (inFlightCheck) return inFlightCheck;

  inFlightCheck = (async () => {
    if (input.isNative) {
      return { shouldPrompt: false, deployedVersion: null, hasWaitingWorker: false };
    }

    const [deployedVersion, registration] = await Promise.all([
      (input.fetchDeployedVersion ?? fetchDeployedAppVersion)().catch(() => null),
      (input.refreshRegistration ??
        (async () => {
          const existing = await getRideCloudServiceWorkerRegistration();
          if (existing) {
            try {
              await existing.update();
            } catch {
              // update() peut échouer hors ligne — on continue avec l'état connu.
            }
          }
          return existing;
        }))()
    ]);

    const hasWaitingWorker = Boolean(registration?.waiting);
    const loadedVersion = input.loadedVersion ?? getLoadedAppVersion();

    return {
      deployedVersion,
      hasWaitingWorker,
      shouldPrompt: shouldPromptForPwaUpdate({
        isNative: false,
        loadedVersion,
        deployedVersion,
        hasWaitingWorker,
        dismissedVersion: input.dismissedVersion
      })
    };
  })().finally(() => {
    inFlightCheck = null;
  });

  return inFlightCheck;
}

export function resetUpdateCheckCache(): void {
  inFlightCheck = null;
}
