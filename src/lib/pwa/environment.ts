export interface CapacitorBridge {
  isNativePlatform?: () => boolean;
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

/** WebView Android/iOS : le SW n'est pas fiable. On compare uniquement la version distante. */
export function shouldUseRemoteVersionFallback(isNative: boolean): boolean {
  return isNative;
}
