export interface CapacitorBridge {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

export function isCapacitorNative(
  win: { Capacitor?: CapacitorBridge } | undefined = globalThis.window as { Capacitor?: CapacitorBridge } | undefined
): boolean {
  if (!win?.Capacitor) return false;
  if (typeof win.Capacitor.isNativePlatform === "function") {
    return win.Capacitor.isNativePlatform();
  }
  return true;
}

export function getCapacitorPlatform(
  win: { Capacitor?: CapacitorBridge } | undefined = globalThis.window as { Capacitor?: CapacitorBridge } | undefined
): "android" | "ios" | "web" {
  const platform = win?.Capacitor?.getPlatform?.();
  if (platform === "android" || platform === "ios" || platform === "web") return platform;
  return "web";
}

export function isCapacitorAndroid(
  win: { Capacitor?: CapacitorBridge } | undefined = globalThis.window as { Capacitor?: CapacitorBridge } | undefined
): boolean {
  return isCapacitorNative(win) && getCapacitorPlatform(win) === "android";
}

export function shouldRegisterServiceWorkerOnBoot(input: {
  isNative: boolean;
  nodeEnv: string | undefined;
}): boolean {
  if (input.isNative) return false;
  return input.nodeEnv === "production";
}

export function shouldRunPwaUpdateClient(input: {
  isNative: boolean;
  nodeEnv: string | undefined;
}): boolean {
  return input.nodeEnv === "production";
}

/** WebView Android/iOS : le SW n'est pas fiable. Comparaison persisted + version distante. */
export function shouldUseRemoteVersionFallback(isNative: boolean): boolean {
  return isNative;
}
