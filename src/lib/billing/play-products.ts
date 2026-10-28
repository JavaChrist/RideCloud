import type { Plan, PlanInterval } from "@/types/database";
import { PLANS } from "@/lib/billing/plans";

export const PLAY_PACKAGE_NAME = "fr.javachrist.ridecloud";

export const PLAY_PRODUCT_IDS = {
  premium: "ridecloud_premium",
  family: "ridecloud_family"
} as const;

export const PLAY_BASE_PLAN_IDS = {
  premium: {
    monthly: "premium-monthly",
    yearly: "premium-yearly"
  },
  family: {
    monthly: "family-monthly",
    yearly: "family-yearly"
  }
} as const;

export type PlayPaidPlan = "premium" | "family";

export interface PlayCatalogEntry {
  productId: string;
  basePlanId: string;
  plan: PlayPaidPlan;
  interval: PlanInterval;
  priceEuros: number;
}

const CATALOG: readonly PlayCatalogEntry[] = [
  {
    productId: PLAY_PRODUCT_IDS.premium,
    basePlanId: PLAY_BASE_PLAN_IDS.premium.monthly,
    plan: "premium",
    interval: "monthly",
    priceEuros: PLANS.premium.price.monthly
  },
  {
    productId: PLAY_PRODUCT_IDS.premium,
    basePlanId: PLAY_BASE_PLAN_IDS.premium.yearly,
    plan: "premium",
    interval: "yearly",
    priceEuros: PLANS.premium.price.yearly
  },
  {
    productId: PLAY_PRODUCT_IDS.family,
    basePlanId: PLAY_BASE_PLAN_IDS.family.monthly,
    plan: "family",
    interval: "monthly",
    priceEuros: PLANS.family.price.monthly
  },
  {
    productId: PLAY_PRODUCT_IDS.family,
    basePlanId: PLAY_BASE_PLAN_IDS.family.yearly,
    plan: "family",
    interval: "yearly",
    priceEuros: PLANS.family.price.yearly
  }
];

/** Anciens IDs à 4 produits : aucun achat en base, conservés seulement en lecture de secours. */
const LEGACY_PRODUCT_IDS: Record<string, { productId: string; basePlanId: string }> = {
  ridecloud_premium_monthly: {
    productId: PLAY_PRODUCT_IDS.premium,
    basePlanId: PLAY_BASE_PLAN_IDS.premium.monthly
  },
  ridecloud_premium_yearly: {
    productId: PLAY_PRODUCT_IDS.premium,
    basePlanId: PLAY_BASE_PLAN_IDS.premium.yearly
  },
  ridecloud_family_monthly: {
    productId: PLAY_PRODUCT_IDS.family,
    basePlanId: PLAY_BASE_PLAN_IDS.family.monthly
  },
  ridecloud_family_yearly: {
    productId: PLAY_PRODUCT_IDS.family,
    basePlanId: PLAY_BASE_PLAN_IDS.family.yearly
  }
};

export function getPlayPackageName(): string {
  return process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim() || PLAY_PACKAGE_NAME;
}

export function isExpectedPlayPackage(packageName: string | null | undefined): boolean {
  return Boolean(packageName && packageName === getPlayPackageName());
}

export function getPlayCatalogEntry(
  plan: PlayPaidPlan,
  interval: PlanInterval
): PlayCatalogEntry {
  const entry = CATALOG.find((item) => item.plan === plan && item.interval === interval);
  if (!entry) {
    throw new Error("Combinaison Play introuvable.");
  }
  return entry;
}

export function resolvePlayCatalog(
  productId: string | null | undefined,
  basePlanId?: string | null
): PlayCatalogEntry | null {
  if (!productId) return null;
  const legacy = LEGACY_PRODUCT_IDS[productId];
  const resolvedProductId = legacy?.productId ?? productId;
  const resolvedBasePlanId = basePlanId ?? legacy?.basePlanId ?? null;
  if (!resolvedBasePlanId) return null;
  return (
    CATALOG.find(
      (item) => item.productId === resolvedProductId && item.basePlanId === resolvedBasePlanId
    ) ?? null
  );
}

export function listPlayProductIds(): string[] {
  return [PLAY_PRODUCT_IDS.premium, PLAY_PRODUCT_IDS.family];
}

export function playManageSubscriptionsUrl(productId?: string | null): string {
  const sku = productId ? `&sku=${encodeURIComponent(productId)}` : "";
  return `https://play.google.com/store/account/subscriptions?package=${encodeURIComponent(getPlayPackageName())}${sku}`;
}
