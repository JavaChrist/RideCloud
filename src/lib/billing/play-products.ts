import type { Plan, PlanInterval } from "@/types/database";
import { PLANS } from "@/lib/billing/plans";

export const PLAY_PACKAGE_NAME = "fr.javachrist.ridecloud";

export const PLAY_PRODUCT_IDS = {
  premium: {
    monthly: "ridecloud_premium_monthly",
    yearly: "ridecloud_premium_yearly"
  },
  family: {
    monthly: "ridecloud_family_monthly",
    yearly: "ridecloud_family_yearly"
  }
} as const;

export type PlayPaidPlan = "premium" | "family";

export interface PlayProductDefinition {
  productId: string;
  plan: PlayPaidPlan;
  interval: PlanInterval;
  priceEuros: number;
}

const PLAY_PRODUCTS: readonly PlayProductDefinition[] = [
  {
    productId: PLAY_PRODUCT_IDS.premium.monthly,
    plan: "premium",
    interval: "monthly",
    priceEuros: PLANS.premium.price.monthly
  },
  {
    productId: PLAY_PRODUCT_IDS.premium.yearly,
    plan: "premium",
    interval: "yearly",
    priceEuros: PLANS.premium.price.yearly
  },
  {
    productId: PLAY_PRODUCT_IDS.family.monthly,
    plan: "family",
    interval: "monthly",
    priceEuros: PLANS.family.price.monthly
  },
  {
    productId: PLAY_PRODUCT_IDS.family.yearly,
    plan: "family",
    interval: "yearly",
    priceEuros: PLANS.family.price.yearly
  }
];

export function getPlayPackageName(): string {
  return process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim() || PLAY_PACKAGE_NAME;
}

export function getPlayProductId(plan: PlayPaidPlan, interval: PlanInterval): string {
  return PLAY_PRODUCT_IDS[plan][interval];
}

export function getPlayProduct(productId: string): PlayProductDefinition | null {
  return PLAY_PRODUCTS.find((product) => product.productId === productId) ?? null;
}

export function listPlayProductIds(): string[] {
  return PLAY_PRODUCTS.map((product) => product.productId);
}

export function playManageSubscriptionsUrl(productId?: string | null): string {
  const sku = productId ? `&sku=${encodeURIComponent(productId)}` : "";
  return `https://play.google.com/store/account/subscriptions?package=${encodeURIComponent(getPlayPackageName())}${sku}`;
}
