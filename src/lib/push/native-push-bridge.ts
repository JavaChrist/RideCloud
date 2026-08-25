export interface NativePushPermissionResult {
  receive?: string;
}

export interface NativePushChannelOptions {
  id: string;
  name: string;
  description?: string;
  importance?: number;
  visibility?: number;
  vibration?: boolean;
  sound?: string;
}

export interface NativePushRegistrationToken {
  value: string;
}

export interface NativePushRegistrationError {
  error?: string;
}

export interface NativePushReceivedAction {
  notification: {
    data?: Record<string, unknown> | null;
    notification?: { data?: Record<string, unknown> | null };
  };
}

/** Contrat JS normal — jamais le proxy Capacitor. */
export interface NativePushBridge {
  checkPermissions: () => Promise<NativePushPermissionResult>;
  requestPermissions: () => Promise<NativePushPermissionResult>;
  register: () => Promise<void>;
  createChannel: (options: NativePushChannelOptions) => Promise<void>;
  removeAllListeners: () => Promise<void>;
  addListener: (
    event: string,
    callback: (payload: NativePushRegistrationToken & NativePushRegistrationError & NativePushReceivedAction) => void
  ) => Promise<unknown>;
}

export interface CapacitorPushPluginLike {
  checkPermissions: () => Promise<NativePushPermissionResult>;
  requestPermissions: () => Promise<NativePushPermissionResult>;
  register: () => Promise<void>;
  createChannel: (options: NativePushChannelOptions) => Promise<void>;
  removeAllListeners: () => Promise<void>;
  addListener: (event: string, callback: (payload: unknown) => void) => Promise<unknown>;
}

export function isUnsafeCapacitorThenable(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  try {
    return typeof (value as { then?: unknown }).then === "function";
  } catch {
    return true;
  }
}

/** Enveloppe le proxy Capacitor dans un objet JS plat, sans `then`. */
export function wrapPushNotificationsPlugin(plugin: CapacitorPushPluginLike): NativePushBridge {
  return {
    checkPermissions: () => plugin.checkPermissions(),
    requestPermissions: () => plugin.requestPermissions(),
    register: () => plugin.register(),
    createChannel: (options) => plugin.createChannel(options),
    removeAllListeners: () => plugin.removeAllListeners(),
    addListener: (event, callback) => plugin.addListener(event, callback as (payload: unknown) => void)
  };
}

export async function loadNativePushBridge(
  importer?: () => Promise<{ PushNotifications: CapacitorPushPluginLike }>
): Promise<NativePushBridge> {
  const module = importer
    ? await importer()
    : await import("@capacitor/push-notifications");
  return wrapPushNotificationsPlugin(module.PushNotifications as CapacitorPushPluginLike);
}
