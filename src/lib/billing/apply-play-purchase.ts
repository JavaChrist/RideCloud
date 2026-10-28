import { createAdminClient } from "@/lib/supabase/admin";
import { applyPlanUpdate } from "@/lib/billing/activate-plan";
import {
  getPlayProduct,
  type PlayPaidPlan
} from "@/lib/billing/play-products";
import {
  getPlaySubscriptionPurchase,
  acknowledgePlaySubscription,
  primaryPlayLineItem,
  type PlaySubscriptionPurchase
} from "@/lib/billing/play-publisher";
import {
  playPurchaseBelongsToUser,
  resolvePlayEntitlement
} from "@/lib/billing/play-state";
import type { Plan } from "@/types/database";

export interface ApplyPlayPurchaseInput {
  userId: string;
  purchaseToken: string;
  claimedProductId?: string | null;
  claimedOrderId?: string | null;
}

export interface ApplyPlayPurchaseResult {
  plan: Plan;
  planStatus: string;
  renewsAt: string | null;
  expired: boolean;
}

function resolveProductId(
  purchase: PlaySubscriptionPurchase,
  claimedProductId?: string | null
): string | null {
  return primaryPlayLineItem(purchase)?.productId ?? claimedProductId ?? null;
}

export async function applyVerifiedPlayPurchase(
  input: ApplyPlayPurchaseInput
): Promise<ApplyPlayPurchaseResult> {
  const purchase = await getPlaySubscriptionPurchase(input.purchaseToken);
  const obfuscated = purchase.externalAccountIdentifiers?.obfuscatedExternalAccountId;
  if (obfuscated && !playPurchaseBelongsToUser(obfuscated, input.userId)) {
    throw new Error("Cet achat Google Play est lié à un autre compte RideCloud.");
  }

  const productId = resolveProductId(purchase, input.claimedProductId);
  const catalog = productId ? getPlayProduct(productId) : null;
  if (!productId || !catalog) {
    throw new Error("Produit Google Play inconnu. Vérifiez les identifiants Play Console.");
  }

  const admin = createAdminClient();
  const { data: existingData } = await admin
    .from("profiles")
    .select("id, play_purchase_token")
    .eq("play_purchase_token", input.purchaseToken)
    .maybeSingle();
  const existing = existingData as { id: string; play_purchase_token: string | null } | null;
  if (existing && existing.id !== input.userId) {
    throw new Error("Cet achat Google Play est déjà associé à un autre compte.");
  }

  const line = primaryPlayLineItem(purchase);
  const entitlement = resolvePlayEntitlement({
    subscriptionState: purchase.subscriptionState ?? "",
    expiryTime: line?.expiryTime ?? null
  });

  const plan: PlayPaidPlan | "free" = entitlement.expired ? "free" : catalog.plan;
  const status = entitlement.expired ? "active" : entitlement.planStatus;
  const interval = entitlement.expired ? null : catalog.interval;

  await applyPlanUpdate({
    userId: input.userId,
    plan,
    status,
    interval,
    renewsAt: entitlement.expired ? null : entitlement.renewsAt,
    canceledAt: entitlement.expired ? null : entitlement.canceledAt,
    provider: "play",
    play: {
      productId,
      purchaseToken: input.purchaseToken,
      orderId: input.claimedOrderId ?? purchase.latestOrderId ?? null
    }
  });

  if (!entitlement.expired && purchase.acknowledgementState !== "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED") {
    try {
      await acknowledgePlaySubscription({
        productId,
        purchaseToken: input.purchaseToken
      });
    } catch (error) {
      console.warn("[play] acknowledge failed", error);
    }
  }

  return {
    plan,
    planStatus: status,
    renewsAt: entitlement.expired ? null : entitlement.renewsAt,
    expired: entitlement.expired
  };
}
