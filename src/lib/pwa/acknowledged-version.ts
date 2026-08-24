export const ACKNOWLEDGED_APP_VERSION_KEY = "ridecloud.lastAcknowledgedAppVersion";

export type VersionStorage = Pick<Storage, "getItem" | "setItem">;

export function getDefaultVersionStorage(): VersionStorage | null {
  if (typeof window === "undefined") return null;
  try {
    const storage = window.localStorage;
    return storage ?? null;
  } catch {
    return null;
  }
}

export function readAcknowledgedAppVersion(storage: VersionStorage | null | undefined): string | null {
  if (!storage) return null;
  try {
    const value = storage.getItem(ACKNOWLEDGED_APP_VERSION_KEY);
    return typeof value === "string" && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

export function writeAcknowledgedAppVersion(
  storage: VersionStorage | null | undefined,
  version: string
): boolean {
  if (!storage || !version) return false;
  try {
    storage.setItem(ACKNOWLEDGED_APP_VERSION_KEY, version);
    return true;
  } catch {
    return false;
  }
}

/**
 * Premier lancement : si aucune version n'est persistée, on enregistre la version
 * actuellement chargée et on ne propose pas de mise à jour.
 */
export function seedAcknowledgedAppVersion(
  storage: VersionStorage | null | undefined,
  currentVersion: string
): string {
  const existing = readAcknowledgedAppVersion(storage);
  if (existing) return existing;
  writeAcknowledgedAppVersion(storage, currentVersion);
  return currentVersion;
}

/**
 * Version à proposer à l'utilisateur sur Capacitor natif.
 * Couvre app ouverte (remote ≠ current) et app relancée (persisted ≠ current).
 */
export function resolveNativePromptVersion(input: {
  acknowledgedVersion: string;
  loadedVersion: string;
  deployedVersion: string | null;
}): string | null {
  const { acknowledgedVersion, loadedVersion, deployedVersion } = input;
  if (!acknowledgedVersion || !loadedVersion) return null;
  if (acknowledgedVersion !== loadedVersion) {
    return loadedVersion;
  }
  if (deployedVersion && deployedVersion !== loadedVersion) {
    return deployedVersion;
  }
  return null;
}
