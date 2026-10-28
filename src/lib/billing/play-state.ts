import type { PlanStatus } from "@/types/database";

export type BillingProvider = "mollie" | "play";

export interface BillingEntitlementInput {
  plan?: string | null;
  planStatus?: string | null;
  canceledAt?: string | null;
  renewsAt?: string | null;
  mollieSubscriptionId?: string | null;
  playPurchaseToken?: string | null;
}

/**
 * Un abonnement encore facturé (Mollie ou Play) bloque un nouveau checkout.
 * Après annulation, la période payée reste utilisable mais un nouveau plan
 * peut être souscrit.
 */
export function hasOpenPaidSubscription(input: BillingEntitlementInput): boolean {
  if (input.plan === "free" || !input.plan) return false;
  if (input.planStatus !== "active") return false;
  if (input.canceledAt) return false;
  return Boolean(input.mollieSubscriptionId || input.playPurchaseToken);
}

export function playPurchaseBelongsToUser(
  obfuscatedAccountId: string | null | undefined,
  userId: string
): boolean {
  if (!obfuscatedAccountId || !userId) return false;
  return obfuscatedAccountId === userId;
}

export function isPlaySubscriptionExpired(
  expiryTime: string | null | undefined,
  now = new Date()
): boolean {
  if (!expiryTime) return false;
  const expiry = new Date(expiryTime);
  if (Number.isNaN(expiry.getTime())) return false;
  return expiry.getTime() < now.getTime();
}

export interface PlayEntitlement {
  planStatus: PlanStatus;
  canceledAt: string | null;
  renewsAt: string | null;
  expired: boolean;
}

/**
 * Traduit l'état Google Play (SubscriptionPurchaseV2) vers le modèle RideCloud.
 * Family reste actif jusqu'à `expiryTime` : les membres gardent le garage
 * partagé jusqu'à cette date, puis RLS et `isFamilyPlanActive` retirent les droits.
 */
export function resolvePlayEntitlement(input: {
  subscriptionState: string;
  expiryTime?: string | null;
  now?: Date;
}): PlayEntitlement {
  const now = input.now ?? new Date();
  const expiry = input.expiryTime ?? null;
  const expired = isPlaySubscriptionExpired(expiry, now);
  const renewsAt = expiry;

  switch (input.subscriptionState) {
    case "SUBSCRIPTION_STATE_ACTIVE":
      return {
        planStatus: expired ? "canceled" : "active",
        canceledAt: null,
        renewsAt,
        expired
      };
    case "SUBSCRIPTION_STATE_CANCELED":
      return {
        planStatus: expired ? "canceled" : "active",
        canceledAt: now.toISOString(),
        renewsAt,
        expired
      };
    case "SUBSCRIPTION_STATE_EXPIRED":
    case "SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED":
      return {
        planStatus: "canceled",
        canceledAt: now.toISOString(),
        renewsAt,
        expired: true
      };
    case "SUBSCRIPTION_STATE_ON_HOLD":
    case "SUBSCRIPTION_STATE_PAUSED":
    case "SUBSCRIPTION_STATE_IN_GRACE_PERIOD":
      return {
        planStatus: "past_due",
        canceledAt: null,
        renewsAt,
        expired
      };
    case "SUBSCRIPTION_STATE_PENDING":
      return {
        planStatus: "pending",
        canceledAt: null,
        renewsAt,
        expired: false
      };
    default:
      return {
        planStatus: expired ? "canceled" : "pending",
        canceledAt: expired ? now.toISOString() : null,
        renewsAt,
        expired
      };
  }
}
