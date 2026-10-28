import type { PlanStatus } from "@/types/database";

export type BillingProvider = "mollie" | "play";

export type PlayAccess = "entitled" | "restricted" | "pending" | "none";

export interface BillingEntitlementInput {
  plan?: string | null;
  planStatus?: string | null;
  canceledAt?: string | null;
  renewsAt?: string | null;
  mollieSubscriptionId?: string | null;
  playPurchaseToken?: string | null;
  now?: Date;
}

/**
 * Droits encore payés (Mollie ou Play), y compris après résiliation
 * tant que `renewsAt` n'est pas dépassé. Bloque un second prestataire.
 */
export function hasPaidPeriodRemaining(input: BillingEntitlementInput): boolean {
  if (input.plan === "free" || !input.plan) return false;
  if (input.planStatus === "pending" || input.planStatus === "past_due") return false;
  if (input.planStatus !== "active" && input.planStatus !== "canceled") return false;
  const now = input.now ?? new Date();
  if (input.renewsAt) {
    const renews = new Date(input.renewsAt);
    if (!Number.isNaN(renews.getTime()) && renews.getTime() < now.getTime()) {
      return false;
    }
  }
  return Boolean(input.mollieSubscriptionId || input.playPurchaseToken || input.plan !== "free");
}

/** @deprecated utiliser hasPaidPeriodRemaining */
export function hasOpenPaidSubscription(input: BillingEntitlementInput): boolean {
  return hasPaidPeriodRemaining(input);
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
  access: PlayAccess;
  planStatus: PlanStatus;
  canceledAt: string | null;
  renewsAt: string | null;
  expired: boolean;
}

/**
 * Cycle officiel Google Play (subscriptionsv2 + lifecycle/subscriptions).
 * Grâce : droits conservés. Hold / pause : droits retirés.
 * Résilié encore payé : droits jusqu'à expiryTime.
 */
export function resolvePlayEntitlement(input: {
  subscriptionState: string;
  expiryTime?: string | null;
  now?: Date;
}): PlayEntitlement {
  const now = input.now ?? new Date();
  const expiry = input.expiryTime ?? null;
  const expiredByTime = isPlaySubscriptionExpired(expiry, now);
  const renewsAt = expiry;

  switch (input.subscriptionState) {
    case "SUBSCRIPTION_STATE_ACTIVE":
    case "SUBSCRIPTION_STATE_IN_GRACE_PERIOD":
      return {
        access: expiredByTime ? "none" : "entitled",
        planStatus: expiredByTime ? "canceled" : "active",
        canceledAt: null,
        renewsAt,
        expired: expiredByTime
      };
    case "SUBSCRIPTION_STATE_CANCELED":
      return {
        access: expiredByTime ? "none" : "entitled",
        planStatus: expiredByTime ? "canceled" : "active",
        canceledAt: now.toISOString(),
        renewsAt,
        expired: expiredByTime
      };
    case "SUBSCRIPTION_STATE_ON_HOLD":
    case "SUBSCRIPTION_STATE_PAUSED":
      return {
        access: "restricted",
        planStatus: "past_due",
        canceledAt: null,
        renewsAt,
        expired: false
      };
    case "SUBSCRIPTION_STATE_PENDING":
      return {
        access: "pending",
        planStatus: "pending",
        canceledAt: null,
        renewsAt,
        expired: false
      };
    case "SUBSCRIPTION_STATE_EXPIRED":
    case "SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED":
      return {
        access: "none",
        planStatus: "canceled",
        canceledAt: now.toISOString(),
        renewsAt,
        expired: true
      };
    default:
      return {
        access: expiredByTime ? "none" : "pending",
        planStatus: expiredByTime ? "canceled" : "pending",
        canceledAt: expiredByTime ? now.toISOString() : null,
        renewsAt,
        expired: expiredByTime
      };
  }
}

export function shouldApplyPlayPlanToProfile(input: {
  access: PlayAccess;
  existingHasPaidRights: boolean;
}): "apply" | "keep-existing" {
  if (input.access === "pending" && input.existingHasPaidRights) {
    return "keep-existing";
  }
  return "apply";
}

export function founderPlanAfterFamilyExpiry(isFounder: boolean): "premium" | "free" {
  return isFounder ? "premium" : "free";
}

export type PlayOwnerResolution =
  | { ok: true; userId: string | null }
  | { ok: false; reason: "obfuscated_mismatch" | "already_bound" };

/**
 * Propriété d'un jeton : pas d'attribution automatique à un compte
 * si l'identifiant Play attendu manque, diffère, ou si le jeton
 * est déjà lié ailleurs. Un RTDN sans compte connu reste orphelin.
 */
export function resolvePlayPurchaseOwner(input: {
  requestedUserId?: string | null;
  existingUserId?: string | null;
  linkedUserId?: string | null;
  obfuscatedAccountId?: string | null;
  requireObfuscated: boolean;
}): PlayOwnerResolution {
  const requested = input.requestedUserId ?? null;
  if (input.requireObfuscated && requested) {
    if (!playPurchaseBelongsToUser(input.obfuscatedAccountId, requested)) {
      return { ok: false, reason: "obfuscated_mismatch" };
    }
  }
  if (input.existingUserId && requested && input.existingUserId !== requested) {
    return { ok: false, reason: "already_bound" };
  }
  if (input.existingUserId) {
    return { ok: true, userId: input.existingUserId };
  }
  if (requested) {
    return { ok: true, userId: requested };
  }
  if (input.linkedUserId) {
    return { ok: true, userId: input.linkedUserId };
  }
  return { ok: true, userId: null };
}

export function playReplacementParams(input: {
  paidRemaining: boolean;
  playProductId?: string | null;
  playPurchaseToken?: string | null;
}): { oldProductId: string; oldPurchaseToken: string } | null {
  if (!input.paidRemaining) return null;
  if (!input.playProductId || !input.playPurchaseToken) return null;
  return {
    oldProductId: input.playProductId,
    oldPurchaseToken: input.playPurchaseToken
  };
}
