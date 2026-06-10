import type { Plan, PlanInterval, PlanStatus, Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS } from "@/lib/billing/plans";

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
  mollieCustomerId: string | null;
  mollieSubscriptionId: string | null;
  mollieMandateId: string | null;
  isBeta: boolean;
  betaExpiresAt: string | null;
  betaFeedbackSubmitted: boolean;
  isBetaActive: boolean;
  isBetaBlocked: boolean;
  betaDaysRemaining: number | null;
}

const DEFAULT_PROFILE: Pick<
  Profile,
  | "plan"
  | "plan_status"
  | "plan_interval"
  | "plan_renews_at"
  | "plan_canceled_at"
  | "mollie_customer_id"
  | "mollie_subscription_id"
  | "mollie_mandate_id"
  | "beta_expires_at"
  | "beta_feedback_submitted"
> = {
  plan: "free",
  plan_status: "active",
  plan_interval: null,
  plan_renews_at: null,
  plan_canceled_at: null,
  mollie_customer_id: null,
  mollie_subscription_id: null,
  mollie_mandate_id: null,
  beta_expires_at: null,
  beta_feedback_submitted: false
};

/**
 * Récupère l'état du plan de l'utilisateur connecté, ainsi que le nombre de
 * véhicules déjà enregistrés. Si le profil n'existe pas encore (cas d'un
 * utilisateur Supabase fraîchement créé sans row `profiles`), on retombe
 * gracieusement sur le plan Free.
 */
export async function getUserPlanState(userId: string): Promise<UserPlanState> {
  const supabase = await createClient();

  const [profileRes, vehiclesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "plan, plan_status, plan_interval, plan_renews_at, plan_canceled_at, mollie_customer_id, mollie_subscription_id, mollie_mandate_id, beta_expires_at, beta_feedback_submitted"
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("user_id", userId)
  ]);

  const profile = (profileRes.data ?? DEFAULT_PROFILE) as unknown as typeof DEFAULT_PROFILE;
  const vehicleCount = vehiclesRes.count ?? 0;

  const plan: Plan = profile.plan ?? "free";
  const betaExpiresAt = profile.beta_expires_at ?? null;
  const betaFeedbackSubmitted = profile.beta_feedback_submitted ?? false;
  const isBeta = betaExpiresAt !== null;
  const now = new Date();
  const expiryDate = isBeta ? new Date(betaExpiresAt!) : null;
  const isBetaActive = isBeta && expiryDate! > now;
  const betaExpired = isBeta && expiryDate! <= now;
  const isBetaBlocked = betaExpired && !betaFeedbackSubmitted;
  const betaDaysRemaining = isBetaActive
    ? Math.ceil((expiryDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Pendant la période bêta active, l'utilisateur bénéficie du plan Premium
  const effectivePlan: Plan = isBetaActive ? "premium" : plan;
  const planDef = PLANS[effectivePlan] ?? PLANS.free;
  const vehicleLimit = planDef.vehicleLimit;

  return {
    userId,
    plan,
    planStatus: profile.plan_status ?? "active",
    planInterval: profile.plan_interval,
    renewsAt: profile.plan_renews_at,
    canceledAt: profile.plan_canceled_at,
    vehicleLimit,
    vehicleCount,
    hasReachedVehicleLimit: vehicleCount >= vehicleLimit,
    remainingVehicles: Math.max(0, vehicleLimit - vehicleCount),
    mollieCustomerId: profile.mollie_customer_id,
    mollieSubscriptionId: profile.mollie_subscription_id,
    mollieMandateId: profile.mollie_mandate_id,
    isBeta,
    betaExpiresAt,
    betaFeedbackSubmitted,
    isBetaActive,
    isBetaBlocked,
    betaDaysRemaining
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
    mollie_customer_id: string | null;
    mollie_subscription_id: string | null;
    mollie_mandate_id: string | null;
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
