export interface PlayPurchaseResult {
  purchaseToken: string;
  productId: string;
  orderId: string | null;
}

export interface PlayOffer {
  productId: string;
  basePlanId: string;
  formattedPrice: string;
  priceAmountMicros: number;
  billingPeriod: string;
}

export interface PlayPurchaseOptions {
  productId: string;
  basePlanId: string;
  obfuscatedAccountId: string;
  oldProductId?: string;
  oldPurchaseToken?: string;
}

export interface PlayBillingBridge {
  isAvailable: () => Promise<{ available: boolean }>;
  getOffers: () => Promise<{ offers: PlayOffer[] }>;
  purchase: (options: PlayPurchaseOptions) => Promise<PlayPurchaseResult>;
  restorePurchases: () => Promise<{ purchases: PlayPurchaseResult[] }>;
}

export interface PlayBillingPluginLike {
  isAvailable: () => Promise<{ available: boolean }>;
  getOffers: () => Promise<{ offers: PlayOffer[] }>;
  purchase: (options: PlayPurchaseOptions) => Promise<PlayPurchaseResult>;
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

export function isPlayPluginMissing(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /not implemented|UNIMPLEMENTED|plugin is not implemented|PlayBilling\./i.test(message);
}

export function wrapPlayBillingPlugin(plugin: PlayBillingPluginLike): PlayBillingBridge {
  return {
    isAvailable: () => plugin.isAvailable(),
    getOffers: () => plugin.getOffers(),
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
