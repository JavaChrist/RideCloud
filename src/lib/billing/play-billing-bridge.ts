export interface PlayPurchaseResult {
  purchaseToken: string;
  productId: string;
  orderId: string | null;
}

export interface PlayBillingBridge {
  isAvailable: () => Promise<{ available: boolean }>;
  purchase: (options: {
    productId: string;
    obfuscatedAccountId: string;
  }) => Promise<PlayPurchaseResult>;
  restorePurchases: () => Promise<{ purchases: PlayPurchaseResult[] }>;
}

export interface PlayBillingPluginLike {
  isAvailable: () => Promise<{ available: boolean }>;
  purchase: (options: {
    productId: string;
    obfuscatedAccountId: string;
  }) => Promise<PlayPurchaseResult>;
  restorePurchases: () => Promise<{ purchases: PlayPurchaseResult[] }>;
}

export function isUnsafeCapacitorThenable(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  try {
    return typeof (value as { then?: unknown }).then === "function";
  } catch {
    return true;
  }
}

export function wrapPlayBillingPlugin(plugin: PlayBillingPluginLike): PlayBillingBridge {
  return {
    isAvailable: () => plugin.isAvailable(),
    purchase: (options) => plugin.purchase(options),
    restorePurchases: () => plugin.restorePurchases()
  };
}

export async function loadPlayBillingBridge(
  importer?: () => Promise<{ PlayBilling: PlayBillingPluginLike }>
): Promise<PlayBillingBridge> {
  if (importer) {
    const module = await importer();
    return wrapPlayBillingPlugin(module.PlayBilling);
  }

  const { registerPlugin } = await import("@capacitor/core");
  const PlayBilling = registerPlugin<PlayBillingPluginLike>("PlayBilling");
  return wrapPlayBillingPlugin(PlayBilling);
}
