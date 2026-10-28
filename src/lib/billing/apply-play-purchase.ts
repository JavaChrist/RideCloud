import { createAdminClient } from "@/lib/supabase/admin";
import { applyPlanUpdate } from "@/lib/billing/activate-plan";
import { resolvePlayCatalog } from "@/lib/billing/play-products";
import {
  acknowledgePlaySubscription,
  getPlaySubscriptionPurchase,
  primaryPlayLineItem,
  type PlaySubscriptionPurchase
} from "@/lib/billing/play-publisher";
import {
  hasPaidPeriodRemaining,
  resolvePlayEntitlement,
  resolvePlayPurchaseOwner,
  shouldApplyPlayPlanToProfile,
  type PlayAccess
} from "@/lib/billing/play-state";
import {
  isPlayAcknowledged,
  needsPlayAcknowledgement,
  nextPlayAckRetryAt
} from "@/lib/billing/play-ack";
import type { Plan } from "@/types/database";

export interface ApplyPlayPurchaseInput {
  userId?: string | null;
  purchaseToken: string;
  claimedProductId?: string | null;
  claimedBasePlanId?: string | null;
  claimedOrderId?: string | null;
  requireObfuscatedAccount?: boolean;
}

export interface ApplyPlayPurchaseResult {
  plan: Plan;
  planStatus: string;
  renewsAt: string | null;
  expired: boolean;
  access: PlayAccess;
  boundUserId: string | null;
  applied: boolean;
}

interface StoredPurchase {
  user_id: string | null;
  product_id: string;
  base_plan_id: string;
}

function catalogFromPurchase(
  purchase: PlaySubscriptionPurchase,
  claimedProductId?: string | null,
  claimedBasePlanId?: string | null
) {
  const line = primaryPlayLineItem(purchase);
  return resolvePlayCatalog(
    line?.productId ?? claimedProductId,
    line?.offerDetails?.basePlanId ?? claimedBasePlanId
  );
}

async function bindPurchaseToken(input: {
  purchaseToken: string;
  userId: string | null;
  productId: string;
  basePlanId: string;
  offerId: string | null;
  orderId: string | null;
  obfuscatedAccountId: string | null;
  linkedPurchaseToken: string | null;
  subscriptionState: string;
  acknowledgementState: string | null;
  expiryTime: string | null;
}): Promise<{ userId: string | null }> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  let linkedUserId: string | null = null;
  if (input.linkedPurchaseToken) {
    const { data: linked } = await admin
      .from("play_purchases")
      .select("user_id")
      .eq("purchase_token", input.linkedPurchaseToken)
      .maybeSingle();
    linkedUserId = (linked as { user_id: string | null } | null)?.user_id ?? null;
  }

  const { data: existingData } = await admin
    .from("play_purchases")
    .select("user_id, product_id, base_plan_id")
    .eq("purchase_token", input.purchaseToken)
    .maybeSingle();
  const existing = existingData as StoredPurchase | null;

  const owner = resolvePlayPurchaseOwner({
    requestedUserId: input.userId,
    existingUserId: existing?.user_id ?? null,
    linkedUserId,
    obfuscatedAccountId: input.obfuscatedAccountId,
    requireObfuscated: false
  });
  if (!owner.ok) {
    throw new Error("Cet achat Google Play est déjà associé à un autre compte.");
  }
  const userId = owner.userId;

  const row = {
    purchase_token: input.purchaseToken,
    user_id: userId ?? existing?.user_id ?? null,
    product_id: input.productId,
    base_plan_id: input.basePlanId,
    offer_id: input.offerId,
    package_name: process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim() || "fr.javachrist.ridecloud",
    order_id: input.orderId,
    obfuscated_account_id: input.obfuscatedAccountId,
    linked_purchase_token: input.linkedPurchaseToken,
    subscription_state: input.subscriptionState,
    acknowledgement_state: input.acknowledgementState,
    expiry_time: input.expiryTime,
    updated_at: now
  };

  if (!existing) {
    const { error } = await admin.from("play_purchases").insert(row as never);
    if (error) {
      if (error.code === "23505") {
        throw new Error("Cet achat Google Play est déjà associé à un autre compte.");
      }
      throw new Error(`play_purchases: ${error.message}`);
    }
  } else {
    let query = admin
      .from("play_purchases")
      .update(row as never)
      .eq("purchase_token", input.purchaseToken);
    if (existing.user_id) {
      query = query.eq("user_id", existing.user_id);
    } else if (userId) {
      query = query.is("user_id", null);
    }
    const { data: updated, error } = await query.select("purchase_token").maybeSingle();
    if (error) {
      throw new Error(`play_purchases: ${error.message}`);
    }
    if (!updated) {
      throw new Error("Cet achat Google Play est déjà associé à un autre compte.");
    }
  }

  if (input.linkedPurchaseToken && userId) {
    await admin
      .from("play_purchases")
      .update({ superseded_by: input.purchaseToken, updated_at: now } as never)
      .eq("purchase_token", input.linkedPurchaseToken)
      .eq("user_id", userId);
  }

  return { userId: userId ?? null };
}

async function loadProfileEntitlement(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select(
      "plan, plan_status, plan_canceled_at, plan_renews_at, mollie_subscription_id, play_purchase_token, founder_premium_lifetime"
    )
    .eq("id", userId)
    .maybeSingle();
  return data as {
    plan: string | null;
    plan_status: string | null;
    plan_canceled_at: string | null;
    plan_renews_at: string | null;
    mollie_subscription_id: string | null;
    play_purchase_token: string | null;
    founder_premium_lifetime: boolean | null;
  } | null;
}

async function persistAcknowledgementNeed(input: {
  purchaseToken: string;
  acknowledgementState: string | null;
  productId: string;
}): Promise<void> {
  const admin = createAdminClient();
  if (isPlayAcknowledged(input.acknowledgementState)) {
    await admin
      .from("play_purchases")
      .update({
        acknowledgement_state: input.acknowledgementState,
        acknowledged_at: new Date().toISOString(),
        ack_last_error: null,
        ack_next_retry_at: null,
        updated_at: new Date().toISOString()
      } as never)
      .eq("purchase_token", input.purchaseToken);
    return;
  }
  if (!needsPlayAcknowledgement(input.acknowledgementState)) {
    return;
  }
  try {
    await acknowledgePlaySubscription({
      productId: input.productId,
      purchaseToken: input.purchaseToken
    });
    const refreshed = await getPlaySubscriptionPurchase(input.purchaseToken);
    if (!isPlayAcknowledged(refreshed.acknowledgementState ?? null)) {
      throw new Error("acknowledgementState still pending after HTTP success");
    }
    await admin
      .from("play_purchases")
      .update({
        acknowledgement_state: refreshed.acknowledgementState,
        acknowledged_at: new Date().toISOString(),
        ack_last_error: null,
        ack_next_retry_at: null,
        updated_at: new Date().toISOString()
      } as never)
      .eq("purchase_token", input.purchaseToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : "acknowledge failed";
    const { data } = await admin
      .from("play_purchases")
      .select("ack_attempts")
      .eq("purchase_token", input.purchaseToken)
      .maybeSingle();
    const attempts = Number((data as { ack_attempts?: number } | null)?.ack_attempts ?? 0) + 1;
    await admin
      .from("play_purchases")
      .update({
        ack_attempts: attempts,
        ack_last_error: message.slice(0, 400),
        ack_next_retry_at: nextPlayAckRetryAt(attempts).toISOString(),
        updated_at: new Date().toISOString()
      } as never)
      .eq("purchase_token", input.purchaseToken);
  }
}

export async function applyVerifiedPlayPurchase(
  input: ApplyPlayPurchaseInput
): Promise<ApplyPlayPurchaseResult> {
  const purchase = await getPlaySubscriptionPurchase(input.purchaseToken);
  const line = primaryPlayLineItem(purchase);
  const catalog = catalogFromPurchase(purchase, input.claimedProductId, input.claimedBasePlanId);
  if (!catalog) {
    throw new Error("Produit ou plan de base Google Play inconnu.");
  }

  const obfuscated = purchase.externalAccountIdentifiers?.obfuscatedExternalAccountId ?? null;
  const requireObfuscated = input.requireObfuscatedAccount !== false && Boolean(input.userId);
  const ownership = resolvePlayPurchaseOwner({
    requestedUserId: input.userId ?? null,
    existingUserId: null,
    linkedUserId: null,
    obfuscatedAccountId: obfuscated,
    requireObfuscated
  });
  if (!ownership.ok && ownership.reason === "obfuscated_mismatch") {
    throw new Error("Cet achat Google Play n'est pas lié à ce compte RideCloud.");
  }

  const bound = await bindPurchaseToken({
    purchaseToken: input.purchaseToken,
    userId: input.userId ?? null,
    productId: catalog.productId,
    basePlanId: catalog.basePlanId,
    offerId: line?.offerDetails?.offerId ?? null,
    orderId: input.claimedOrderId ?? purchase.latestOrderId ?? null,
    obfuscatedAccountId: obfuscated,
    linkedPurchaseToken: purchase.linkedPurchaseToken ?? null,
    subscriptionState: purchase.subscriptionState ?? "",
    acknowledgementState: purchase.acknowledgementState ?? null,
    expiryTime: line?.expiryTime ?? null
  });

  const entitlement = resolvePlayEntitlement({
    subscriptionState: purchase.subscriptionState ?? "",
    expiryTime: line?.expiryTime ?? null
  });

  if (!bound.userId) {
    return {
      plan: "free",
      planStatus: entitlement.planStatus,
      renewsAt: entitlement.renewsAt,
      expired: entitlement.expired,
      access: entitlement.access,
      boundUserId: null,
      applied: false
    };
  }

  const profile = await loadProfileEntitlement(bound.userId);
  const existingHasPaidRights = hasPaidPeriodRemaining({
    plan: profile?.plan,
    planStatus: profile?.plan_status,
    canceledAt: profile?.plan_canceled_at,
    renewsAt: profile?.plan_renews_at,
    mollieSubscriptionId: profile?.mollie_subscription_id,
    playPurchaseToken: profile?.play_purchase_token
  });
  const applyDecision = shouldApplyPlayPlanToProfile({
    access: entitlement.access,
    existingHasPaidRights
  });

  if (applyDecision === "keep-existing") {
    await persistAcknowledgementNeed({
      purchaseToken: input.purchaseToken,
      acknowledgementState: purchase.acknowledgementState ?? null,
      productId: catalog.productId
    });
    return {
      plan: (profile?.plan as Plan) ?? "free",
      planStatus: profile?.plan_status ?? "active",
      renewsAt: profile?.plan_renews_at ?? null,
      expired: false,
      access: entitlement.access,
      boundUserId: bound.userId,
      applied: false
    };
  }

  let plan: Plan = catalog.plan;
  let status = entitlement.planStatus;
  let interval: "monthly" | "yearly" | null = catalog.interval;
  let renewsAt = entitlement.renewsAt;
  let canceledAt = entitlement.canceledAt;

  if (entitlement.access === "none" || entitlement.expired) {
    plan = "free";
    status = "active";
    interval = null;
    renewsAt = null;
    canceledAt = null;
  } else if (entitlement.access === "pending") {
    plan = (profile?.plan as Plan) ?? "free";
    status = profile?.plan_status === "active" ? "active" : "pending";
    interval = (profile?.plan as Plan) === catalog.plan ? catalog.interval : null;
  }

  await applyPlanUpdate({
    userId: bound.userId,
    plan,
    status,
    interval,
    renewsAt,
    canceledAt,
    provider: entitlement.access === "none" ? profile?.play_purchase_token ? "play" : profile?.mollie_subscription_id ? "mollie" : "play" : "play",
    play: {
      productId: catalog.productId,
      purchaseToken: input.purchaseToken,
      orderId: input.claimedOrderId ?? purchase.latestOrderId ?? null,
      basePlanId: catalog.basePlanId
    }
  });

  if (entitlement.access === "entitled" && !isPlayAcknowledged(purchase.acknowledgementState ?? null)) {
    await persistAcknowledgementNeed({
      purchaseToken: input.purchaseToken,
      acknowledgementState: purchase.acknowledgementState ?? null,
      productId: catalog.productId
    });
  } else if (isPlayAcknowledged(purchase.acknowledgementState ?? null)) {
    await persistAcknowledgementNeed({
      purchaseToken: input.purchaseToken,
      acknowledgementState: purchase.acknowledgementState ?? null,
      productId: catalog.productId
    });
  }

  return {
    plan,
    planStatus: status,
    renewsAt,
    expired: entitlement.expired,
    access: entitlement.access,
    boundUserId: bound.userId,
    applied: true
  };
}

export async function retryPendingPlayAcknowledgements(limit = 25): Promise<number> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("play_purchases")
    .select("purchase_token, product_id, acknowledgement_state")
    .is("acknowledged_at", null)
    .lte("ack_next_retry_at", new Date().toISOString())
    .limit(limit);
  const rows = (data ?? []) as Array<{
    purchase_token: string;
    product_id: string;
    acknowledgement_state: string | null;
  }>;
  for (const row of rows) {
    await persistAcknowledgementNeed({
      purchaseToken: row.purchase_token,
      acknowledgementState: row.acknowledgement_state ?? "ACKNOWLEDGEMENT_STATE_PENDING",
      productId: row.product_id
    });
  }
  return rows.length;
}
