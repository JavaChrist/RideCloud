import { createAdminClient } from "@/lib/supabase/admin";
import { ensureHouseholdForOwner } from "@/lib/family/household";
import type { Plan, PlanInterval, PlanStatus } from "@/types/database";
import type { BillingProvider } from "@/lib/billing/play-state";

export interface ApplyPlanUpdateInput {
  userId: string;
  plan: Plan;
  status: PlanStatus;
  interval?: PlanInterval | null;
  renewsAt?: string | null;
  canceledAt?: string | null;
  provider?: BillingProvider | null;
  mollie?: {
    customerId?: string | null;
    subscriptionId?: string | null;
    mandateId?: string | null;
  };
  play?: {
    productId?: string | null;
    purchaseToken?: string | null;
    orderId?: string | null;
  };
}

/**
 * Applique un changement de plan sans effacer l'autre prestataire ni les
 * drapeaux fondateur. Active le foyer dès qu'un Family est réellement actif.
 */
export async function applyPlanUpdate(input: ApplyPlanUpdateInput): Promise<void> {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    plan: input.plan,
    plan_status: input.status,
    updated_at: now
  };

  if (input.interval !== undefined) patch.plan_interval = input.interval;
  if (input.renewsAt !== undefined) patch.plan_renews_at = input.renewsAt;
  if (input.canceledAt !== undefined) patch.plan_canceled_at = input.canceledAt;
  if (input.provider !== undefined) patch.billing_provider = input.provider;

  if (input.mollie) {
    if (input.mollie.customerId !== undefined) {
      patch.mollie_customer_id = input.mollie.customerId;
    }
    if (input.mollie.subscriptionId !== undefined) {
      patch.mollie_subscription_id = input.mollie.subscriptionId;
    }
    if (input.mollie.mandateId !== undefined) {
      patch.mollie_mandate_id = input.mollie.mandateId;
    }
  }

  if (input.play) {
    if (input.play.productId !== undefined) patch.play_product_id = input.play.productId;
    if (input.play.purchaseToken !== undefined) {
      patch.play_purchase_token = input.play.purchaseToken;
    }
    if (input.play.orderId !== undefined) patch.play_order_id = input.play.orderId;
  }

  const { error } = await admin.from("profiles").update(patch as never).eq("id", input.userId);
  if (error) {
    throw new Error(`applyPlanUpdate: ${error.message}`);
  }

  if (input.plan === "family" && input.status === "active") {
    await ensureHouseholdForOwner(input.userId);
  }
}
