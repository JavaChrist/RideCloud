import {
  getDefaultVersionStorage,
  resolveNativePromptVersion,
  seedAcknowledgedAppVersion,
  type VersionStorage
} from "@/lib/pwa/acknowledged-version";
import { appVersionRequestUrl, getLoadedAppVersion, hasDeployedAppUpdate } from "@/lib/pwa/app-version";
import { shouldUseRemoteVersionFallback } from "@/lib/pwa/environment";
import { getRideCloudServiceWorkerRegistration, postSkipWaiting } from "@/lib/pwa/service-worker";

export const PWA_UPDATE_INTERVAL_MS = 60_000;

export function shouldPromptForPwaUpdate(input: {
  isNative: boolean;
  loadedVersion: string;
  deployedVersion: string | null;
  hasWaitingWorker: boolean;
  dismissedVersion?: string | null;
  acknowledgedVersion?: string | null;
}): boolean {
  if (input.isNative) {
    const promptVersion = resolveNativePromptVersion({
      acknowledgedVersion: input.acknowledgedVersion ?? input.loadedVersion,
      loadedVersion: input.loadedVersion,
      deployedVersion: input.deployedVersion
    });
    if (!promptVersion) return false;
    if (input.dismissedVersion && input.dismissedVersion === promptVersion) return false;
    return true;
  }

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
  fetcher: typeof fetch = fetch,
  now = Date.now()
): Promise<string | null> {
  const response = await fetcher(appVersionRequestUrl(now), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache"
    }
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { version?: unknown };
  return typeof body.version === "string" && body.version.length > 0 ? body.version : null;
}

export interface AppUpdateCheckResult {
  shouldPrompt: boolean;
  deployedVersion: string | null;
  hasWaitingWorker: boolean;
  acknowledgedVersion: string | null;
  promptVersion: string | null;
}

let inFlightCheck: Promise<AppUpdateCheckResult> | null = null;

export async function checkForAppUpdate(input: {
  isNative: boolean;
  dismissedVersion?: string | null;
  loadedVersion?: string;
  acknowledgedVersion?: string | null;
  versionStorage?: VersionStorage | null;
  fetchDeployedVersion?: () => Promise<string | null>;
  refreshRegistration?: () => Promise<ServiceWorkerRegistration | null>;
}): Promise<AppUpdateCheckResult> {
  if (inFlightCheck) return inFlightCheck;

  inFlightCheck = (async () => {
    const skipServiceWorker = shouldUseRemoteVersionFallback(input.isNative);
    const [deployedVersion, registration] = await Promise.all([
      (input.fetchDeployedVersion ?? fetchDeployedAppVersion)().catch(() => null),
      skipServiceWorker
        ? Promise.resolve(null)
        : (input.refreshRegistration ??
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
    const acknowledgedVersion = input.isNative
      ? (input.acknowledgedVersion ||
        seedAcknowledgedAppVersion(input.versionStorage ?? getDefaultVersionStorage(), loadedVersion))
      : null;
    const promptVersion =
      input.isNative && acknowledgedVersion
        ? resolveNativePromptVersion({
            acknowledgedVersion,
            loadedVersion,
            deployedVersion
          })
        : deployedVersion;

    return {
      deployedVersion,
      hasWaitingWorker,
      acknowledgedVersion,
      promptVersion,
      shouldPrompt: shouldPromptForPwaUpdate({
        isNative: input.isNative,
        loadedVersion,
        deployedVersion,
        hasWaitingWorker,
        dismissedVersion: input.dismissedVersion,
        acknowledgedVersion
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
