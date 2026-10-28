import type { BillingProvider, Plan, PlanInterval, PlanStatus, Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS } from "@/lib/billing/plans";
import {
  countHouseholdVehicles,
  getHouseholdMembership,
  householdVehicleLimit
} from "@/lib/family/household";

/**
 * Vérifie si un abonnement annulé a atteint sa date de fin.
 * Dans ce cas, l'utilisateur doit être rétrogradé vers Free.
 */
export function isSubscriptionExpired(
  plan: string,
  canceledAt: string | null,
  renewsAt: string | null
): boolean {
  if (plan === "free" || !canceledAt || !renewsAt) return false;
  return new Date(renewsAt) < new Date();
}

export interface UserPlanState {
  userId: string;
  plan: Plan;
  planStatus: PlanStatus;
  planInterval: PlanInterval | null;
  renewsAt: string | null;
  canceledAt: string | null;
  vehicleLimit: number;
  vehicleCount: number;
  hasReachedVehicleLimit: boolean;
  remainingVehicles: number;
  billingProvider: BillingProvider | null;
  mollieCustomerId: string | null;
  mollieSubscriptionId: string | null;
  mollieMandateId: string | null;
  playProductId: string | null;
  playPurchaseToken: string | null;
  isFounder: boolean;
  founderBadge: boolean;
  /** Accès payants via un foyer Family actif (titulaire ou membre). */
  hasHouseholdBenefits: boolean;
  householdRole: "owner" | "member" | null;
  canUsePaidFeatures: boolean;
}

const DEFAULT_PROFILE: Pick<
  Profile,
  | "plan"
  | "plan_status"
  | "plan_interval"
  | "plan_renews_at"
  | "plan_canceled_at"
  | "billing_provider"
  | "mollie_customer_id"
  | "mollie_subscription_id"
  | "mollie_mandate_id"
  | "play_product_id"
  | "play_purchase_token"
  | "founder_premium_lifetime"
  | "founder_badge"
> = {
  plan: "free",
  plan_status: "active",
  plan_interval: null,
  plan_renews_at: null,
  plan_canceled_at: null,
  billing_provider: null,
  mollie_customer_id: null,
  mollie_subscription_id: null,
  mollie_mandate_id: null,
  play_product_id: null,
  play_purchase_token: null,
  founder_premium_lifetime: false,
  founder_badge: false
};

/**
 * Récupère l'état du plan de l'utilisateur connecté, ainsi que le nombre de
 * véhicules déjà enregistrés. Si le profil n'existe pas encore (cas d'un
 * utilisateur Supabase fraîchement créé sans row `profiles`), on retombe
 * gracieusement sur le plan Free.
 *
 * Les membres fondateurs avec `founder_premium_lifetime = true` ont leur
 * `effectivePlan` forcé à "premium" (override indépendant de Mollie).
 */
export async function getUserPlanState(userId: string): Promise<UserPlanState> {
  const supabase = await createClient();

  const [profileRes, vehiclesRes, membership] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "plan, plan_status, plan_interval, plan_renews_at, plan_canceled_at, billing_provider, mollie_customer_id, mollie_subscription_id, mollie_mandate_id, play_product_id, play_purchase_token, founder_premium_lifetime, founder_badge"
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("user_id", userId),
    getHouseholdMembership(userId)
  ]);

  const profile = (profileRes.data ?? DEFAULT_PROFILE) as unknown as typeof DEFAULT_PROFILE;
  const ownVehicleCount = vehiclesRes.count ?? 0;

  const plan: Plan = profile.plan ?? "free";
  const isFounder = profile.founder_premium_lifetime ?? false;
  const founderBadge = profile.founder_badge ?? false;

  // Détection d'expiration : abonnement annulé dont la période payée est écoulée.
  const expired = isSubscriptionExpired(
    plan,
    profile.plan_canceled_at,
    profile.plan_renews_at
  );

  if (expired) {
    // Rétrogradation asynchrone en base sans bloquer le rendu.
    const admin = createAdminClient();
    void admin
      .from("profiles")
      .update({
        plan: "free",
        plan_status: "active",
        plan_interval: null,
        plan_renews_at: null,
        plan_canceled_at: null,
        updated_at: new Date().toISOString()
      } as never)
      .eq("id", userId);
  }

  const resolvedPlan: Plan = expired ? "free" : plan;
  const planStatus = expired ? "active" : (profile.plan_status ?? "active");

  // Override Fondateur : Premium à vie indépendant du plan Mollie.
  const effectivePlan: Plan = isFounder ? "premium" : resolvedPlan;
  const planDef = PLANS[effectivePlan] ?? PLANS.free;
  const hasHouseholdBenefits = Boolean(membership?.isActive);
  const vehicleLimit = householdVehicleLimit(hasHouseholdBenefits, planDef.vehicleLimit);
  const vehicleCount =
    hasHouseholdBenefits && membership
      ? await countHouseholdVehicles(membership.householdId)
      : ownVehicleCount;
  const canUsePaidFeatures =
    hasHouseholdBenefits ||
    ((effectivePlan === "premium" || effectivePlan === "family") && planStatus === "active");

  return {
    userId,
    plan: resolvedPlan,
    planStatus,
    planInterval: expired ? null : profile.plan_interval,
    renewsAt: expired ? null : profile.plan_renews_at,
    canceledAt: expired ? null : profile.plan_canceled_at,
    vehicleLimit,
    vehicleCount,
    hasReachedVehicleLimit: vehicleCount >= vehicleLimit,
    remainingVehicles: Math.max(0, vehicleLimit - vehicleCount),
    billingProvider: profile.billing_provider ?? null,
    mollieCustomerId: profile.mollie_customer_id,
    mollieSubscriptionId: expired ? null : profile.mollie_subscription_id,
    mollieMandateId: profile.mollie_mandate_id,
    playProductId: profile.play_product_id ?? null,
    playPurchaseToken: expired ? null : profile.play_purchase_token ?? null,
    isFounder,
    founderBadge,
    hasHouseholdBenefits,
    householdRole: membership?.role ?? null,
    canUsePaidFeatures
  };
}

/**
 * Vérifie si l'utilisateur peut créer un nouveau véhicule. Utilisé côté serveur
 * AVANT toute insertion afin d'éviter qu'un utilisateur ne contourne la limite
 * en bricolant le formulaire.
 */
export async function canCreateVehicle(userId: string): Promise<{
  allowed: boolean;
  state: UserPlanState;
}> {
  const state = await getUserPlanState(userId);
  return {
    allowed: !state.hasReachedVehicleLimit && state.planStatus === "active",
    state
  };
}

/**
 * Mise à jour du plan d'un utilisateur depuis le webhook Mollie. Utilise le
 * service role pour bypass RLS (le webhook n'a pas de session utilisateur).
 */
export async function updateUserPlanFromAdmin(
  userId: string,
  patch: Partial<{
    plan: Plan;
    plan_status: PlanStatus;
    plan_interval: PlanInterval | null;
    plan_renews_at: string | null;
    plan_canceled_at: string | null;
    billing_provider: BillingProvider | null;
    mollie_customer_id: string | null;
    mollie_subscription_id: string | null;
    mollie_mandate_id: string | null;
    play_product_id: string | null;
    play_purchase_token: string | null;
    play_order_id: string | null;
  }>
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      ...patch,
      updated_at: new Date().toISOString()
    } as never)
    .eq("id", userId);
  if (error) {
    throw new Error(`updateUserPlan: ${error.message}`);
  }
}
