export const APP_VERSION_FALLBACK = "dev";
export const APP_VERSION_PATH = "/api/app-version";

export function resolveAppVersion(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): string {
  return (
    env.NEXT_PUBLIC_APP_VERSION ||
    env.VERCEL_DEPLOYMENT_ID ||
    env.VERCEL_GIT_COMMIT_SHA ||
    APP_VERSION_FALLBACK
  );
}

/** Version du bundle JS actuellement chargé dans le navigateur. */
export function getLoadedAppVersion(): string {
  return process.env.NEXT_PUBLIC_APP_VERSION || APP_VERSION_FALLBACK;
}

export function hasDeployedAppUpdate(loadedVersion: string, deployedVersion: string | null): boolean {
  if (!loadedVersion || !deployedVersion) return false;
  return loadedVersion !== deployedVersion;
}
