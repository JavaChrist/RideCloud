import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS } from "@/lib/billing/plans";
import { RIDE_CLOUD_SUPPORT_EMAIL } from "@/lib/legal/account-deletion";
import type { Plan, PlanStatus, UsageProfile, VehicleCategory } from "@/types/database";

function adminClient(): SupabaseClient {
  return createAdminClient() as unknown as SupabaseClient;
}

export const FAMILY_HOUSEHOLD_LIMIT = 4;
export const FAMILY_INVITE_DAYS = 14;

export type HouseholdRole = "owner" | "member";

export interface HouseholdMemberView {
  userId: string;
  email: string;
  fullName: string | null;
  role: HouseholdRole;
  joinedAt: string;
}

export interface HouseholdInviteView {
  id: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  status: "pending" | "expired";
}

export interface HouseholdVehicleStat {
  id: string;
  label: string;
  category: VehicleCategory;
  usageProfile: UsageProfile;
  kilometrage: number;
  nextDueTitle: string | null;
  nextDueStatus: string | null;
  ownerUserId: string;
}

export interface HouseholdStats {
  vehicleCount: number;
  memberCount: number;
  yearCost: number;
  upcomingCount: number;
  vehicles: HouseholdVehicleStat[];
}

export interface HouseholdState {
  householdId: string | null;
  role: HouseholdRole | null;
  isActive: boolean;
  ownerEmail: string | null;
  members: HouseholdMemberView[];
  invites: HouseholdInviteView[];
  pendingInvite: { token: string; ownerEmail: string } | null;
  stats: HouseholdStats | null;
  seatUsed: number;
  seatLimit: number;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidInviteEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function familyInviteExpiresAt(from = new Date(), days = FAMILY_INVITE_DAYS): Date {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}

export function isFamilyPlanActive(input: {
  plan: Plan | string | null;
  planStatus: PlanStatus | string | null;
  canceledAt: string | null;
  renewsAt: string | null;
}): boolean {
  if (input.plan !== "family" || input.planStatus !== "active") return false;
  if (!input.canceledAt || !input.renewsAt) return true;
  return new Date(input.renewsAt) >= new Date();
}

export function remainingHouseholdSeats(memberCount: number, pendingInviteCount: number): number {
  return Math.max(0, FAMILY_HOUSEHOLD_LIMIT - memberCount - pendingInviteCount);
}

export function buildFamilyPrioritySupportMailto(ownerEmail: string): string {
  const subject = "Support prioritaire Family — RideCloud";
  const body = `Bonjour,\n\nJe contacte le support prioritaire Family.\n\nCompte titulaire : ${ownerEmail}\n\nSujet :\n`;
  return `mailto:${RIDE_CLOUD_SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

type OwnerProfile = {
  plan: Plan | null;
  plan_status: PlanStatus | null;
  plan_canceled_at: string | null;
  plan_renews_at: string | null;
  email: string;
  full_name: string | null;
};

async function getOwnerProfile(ownerId: string): Promise<OwnerProfile | null> {
  const admin = adminClient();
  const { data } = await admin
    .from("profiles")
    .select("plan, plan_status, plan_canceled_at, plan_renews_at, email, full_name")
    .eq("id", ownerId)
    .maybeSingle();
  return (data as OwnerProfile | null) ?? null;
}

export async function ensureHouseholdForOwner(ownerId: string): Promise<string> {
  const admin = adminClient();
  const { data: existing } = await admin
    .from("households")
    .select("id")
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (existing?.id) {
    await admin
      .from("household_members")
      .upsert(
        { household_id: existing.id, user_id: ownerId, role: "owner" } as never,
        { onConflict: "user_id" }
      );
    return existing.id as string;
  }

  const { data: created, error } = await admin
    .from("households")
    .insert({ owner_id: ownerId } as never)
    .select("id")
    .single();
  if (error || !created) {
    throw new Error(error?.message ?? "Impossible de créer le foyer.");
  }
  const householdId = created.id as string;
  await admin.from("household_members").insert({
    household_id: householdId,
    user_id: ownerId,
    role: "owner"
  } as never);
  return householdId;
}

export async function getHouseholdMembership(userId: string): Promise<{
  householdId: string;
  ownerId: string;
  role: HouseholdRole;
  isActive: boolean;
  owner: OwnerProfile | null;
} | null> {
  const admin = adminClient();
  const { data: membership } = await admin
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", userId)
    .maybeSingle();
  if (!membership) return null;

  const { data: household } = await admin
    .from("households")
    .select("id, owner_id")
    .eq("id", membership.household_id)
    .maybeSingle();
  if (!household) return null;

  const owner = await getOwnerProfile(household.owner_id as string);
  const isActive = owner
    ? isFamilyPlanActive({
        plan: owner.plan,
        planStatus: owner.plan_status,
        canceledAt: owner.plan_canceled_at,
        renewsAt: owner.plan_renews_at
      })
    : false;

  return {
    householdId: household.id as string,
    ownerId: household.owner_id as string,
    role: membership.role as HouseholdRole,
    isActive,
    owner
  };
}

export async function countHouseholdVehicles(householdId: string): Promise<number> {
  const admin = adminClient();
  const { data: members } = await admin
    .from("household_members")
    .select("user_id")
    .eq("household_id", householdId);
  const ids = (members ?? []).map((row) => row.user_id as string);
  if (ids.length === 0) return 0;
  const { count } = await admin
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .in("user_id", ids);
  return count ?? 0;
}

async function loadHouseholdStats(householdId: string): Promise<HouseholdStats> {
  const admin = adminClient();
  const { data: members } = await admin
    .from("household_members")
    .select("user_id")
    .eq("household_id", householdId);
  const ids = (members ?? []).map((row) => row.user_id as string);
  if (ids.length === 0) {
    return { vehicleCount: 0, memberCount: 0, yearCost: 0, upcomingCount: 0, vehicles: [] };
  }

  const year = new Date().getFullYear();
  const yearStart = `${year}-01-01`;

  const [vehiclesRes, entriesRes, modsRes, planRes] = await Promise.all([
    admin.from("vehicles").select("id, user_id, marque, modele, surnom, category, usage_profile, kilometrage").in("user_id", ids),
    admin.from("maintenance_entries").select("cout, date_entretien, vehicle_id").in("user_id", ids),
    admin.from("modifications").select("cout, date_pose, vehicle_id").in("user_id", ids),
    admin
      .from("maintenance_plan_entries")
      .select("vehicle_id, titre, status, next_due_date, next_due_km")
      .in("user_id", ids)
      .in("status", ["overdue", "due_soon", "upcoming"])
  ]);

  const vehicles = (vehiclesRes.data ?? []) as Array<{
    id: string;
    user_id: string;
    marque: string;
    modele: string;
    surnom: string | null;
    category: VehicleCategory;
    usage_profile: UsageProfile;
    kilometrage: number;
  }>;

  const yearCost = [...(entriesRes.data ?? []), ...(modsRes.data ?? [])].reduce((sum, row) => {
    const date = "date_entretien" in row ? row.date_entretien : row.date_pose;
    if (!date || String(date) < yearStart) return sum;
    return sum + (Number(row.cout) || 0);
  }, 0);

  const planRows = (planRes.data ?? []) as Array<{
    vehicle_id: string;
    titre: string;
    status: string;
    next_due_date: string | null;
    next_due_km: number | null;
  }>;
  const upcomingCount = planRows.filter((row) => row.status === "overdue" || row.status === "due_soon").length;

  const nextByVehicle = new Map<string, (typeof planRows)[number]>();
  for (const row of planRows) {
    const current = nextByVehicle.get(row.vehicle_id);
    if (!current) {
      nextByVehicle.set(row.vehicle_id, row);
      continue;
    }
    const rank = { overdue: 0, due_soon: 1, upcoming: 2 } as Record<string, number>;
    if ((rank[row.status] ?? 9) < (rank[current.status] ?? 9)) {
      nextByVehicle.set(row.vehicle_id, row);
    }
  }

  return {
    vehicleCount: vehicles.length,
    memberCount: ids.length,
    yearCost,
    upcomingCount,
    vehicles: vehicles.map((vehicle) => {
      const next = nextByVehicle.get(vehicle.id);
      return {
        id: vehicle.id,
        label: vehicle.surnom?.trim() || `${vehicle.marque} ${vehicle.modele}`,
        category: vehicle.category,
        usageProfile: vehicle.usage_profile,
        kilometrage: vehicle.kilometrage,
        nextDueTitle: next?.titre ?? null,
        nextDueStatus: next?.status ?? null,
        ownerUserId: vehicle.user_id
      };
    })
  };
}

export async function getHouseholdState(input: {
  userId: string;
  email: string;
}): Promise<HouseholdState> {
  const admin = adminClient();
  const membership = await getHouseholdMembership(input.userId);
  const empty: HouseholdState = {
    householdId: null,
    role: null,
    isActive: false,
    ownerEmail: null,
    members: [],
    invites: [],
    pendingInvite: null,
    stats: null,
    seatUsed: 0,
    seatLimit: FAMILY_HOUSEHOLD_LIMIT
  };

  const email = normalizeEmail(input.email);
  const { data: incoming } = await admin
    .from("household_invites")
    .select("token, household_id, expires_at, accepted_at, revoked_at")
    .eq("email", email)
    .is("accepted_at", null)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let pendingInvite: HouseholdState["pendingInvite"] = null;
  if (incoming && !membership) {
    const { data: household } = await admin
      .from("households")
      .select("owner_id")
      .eq("id", incoming.household_id)
      .maybeSingle();
    const owner = household ? await getOwnerProfile(household.owner_id as string) : null;
    if (owner && isFamilyPlanActive({
      plan: owner.plan,
      planStatus: owner.plan_status,
      canceledAt: owner.plan_canceled_at,
      renewsAt: owner.plan_renews_at
    })) {
      pendingInvite = { token: incoming.token as string, ownerEmail: owner.email };
    }
  }

  if (!membership) {
    return { ...empty, pendingInvite };
  }

  const { data: memberRows } = await admin
    .from("household_members")
    .select("user_id, role, joined_at")
    .eq("household_id", membership.householdId)
    .order("joined_at", { ascending: true });

  const memberIds = (memberRows ?? []).map((row) => row.user_id as string);
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email, full_name")
    .in("id", memberIds.length > 0 ? memberIds : ["00000000-0000-0000-0000-000000000000"]);

  const profileById = new Map(
    (profiles ?? []).map((row) => [row.id as string, row as { email: string; full_name: string | null }])
  );

  const members: HouseholdMemberView[] = (memberRows ?? []).map((row) => {
    const profile = profileById.get(row.user_id as string);
    return {
      userId: row.user_id as string,
      email: profile?.email ?? "—",
      fullName: profile?.full_name ?? null,
      role: row.role as HouseholdRole,
      joinedAt: row.joined_at as string
    };
  });

  let invites: HouseholdInviteView[] = [];
  if (membership.role === "owner") {
    const { data: inviteRows } = await admin
      .from("household_invites")
      .select("id, email, token, created_at, expires_at, accepted_at, revoked_at")
      .eq("household_id", membership.householdId)
      .is("accepted_at", null)
      .is("revoked_at", null)
      .order("created_at", { ascending: false });
    const now = Date.now();
    invites = (inviteRows ?? []).map((row) => ({
      id: row.id as string,
      email: row.email as string,
      createdAt: row.created_at as string,
      expiresAt: row.expires_at as string,
      status: new Date(row.expires_at as string).getTime() < now ? "expired" : "pending"
    }));
  }

  const pendingCount = invites.filter((invite) => invite.status === "pending").length;
  const stats = membership.isActive ? await loadHouseholdStats(membership.householdId) : null;

  return {
    householdId: membership.householdId,
    role: membership.role,
    isActive: membership.isActive,
    ownerEmail: membership.owner?.email ?? null,
    members,
    invites,
    pendingInvite,
    stats,
    seatUsed: members.length + pendingCount,
    seatLimit: FAMILY_HOUSEHOLD_LIMIT
  };
}

export async function inviteHouseholdMember(input: {
  ownerId: string;
  ownerEmail: string;
  email: string;
}): Promise<{ token: string; reused: boolean; lastEmailSentAt: string | null }> {
  const target = normalizeEmail(input.email);
  if (!isValidInviteEmail(target)) {
    throw new Error("Adresse e-mail invalide.");
  }
  if (target === normalizeEmail(input.ownerEmail)) {
    throw new Error("Vous ne pouvez pas vous inviter vous-même.");
  }

  const owner = await getOwnerProfile(input.ownerId);
  if (
    !owner ||
    !isFamilyPlanActive({
      plan: owner.plan,
      planStatus: owner.plan_status,
      canceledAt: owner.plan_canceled_at,
      renewsAt: owner.plan_renews_at
    })
  ) {
    throw new Error("Le partage foyer est réservé au plan Family actif.");
  }

  const existingMembership = await getHouseholdMembership(input.ownerId);
  if (existingMembership && existingMembership.role !== "owner") {
    throw new Error("Seul le titulaire du foyer peut inviter.");
  }

  const householdId = await ensureHouseholdForOwner(input.ownerId);
  const admin = adminClient();
  const { data: existingInvite } = await admin
    .from("household_invites")
    .select("token, last_email_sent_at")
    .eq("household_id", householdId)
    .eq("email", target)
    .is("accepted_at", null)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (existingInvite?.token) {
    return {
      token: existingInvite.token as string,
      reused: true,
      lastEmailSentAt: (existingInvite.last_email_sent_at as string | null) ?? null
    };
  }

  const state = await getHouseholdState({ userId: input.ownerId, email: input.ownerEmail });
  if (remainingHouseholdSeats(state.members.length, state.invites.filter((i) => i.status === "pending").length) <= 0) {
    throw new Error(`Le foyer est limité à ${FAMILY_HOUSEHOLD_LIMIT} comptes.`);
  }

  const { data: alreadyMember } = await admin
    .from("profiles")
    .select("id")
    .eq("email", target)
    .maybeSingle();
  if (alreadyMember?.id) {
    const other = await getHouseholdMembership(alreadyMember.id as string);
    if (other) {
      throw new Error("Ce compte appartient déjà à un foyer.");
    }
  }

  const expiresAt = familyInviteExpiresAt().toISOString();
  const { data, error } = await admin
    .from("household_invites")
    .insert({
      household_id: householdId,
      email: target,
      invited_by: input.ownerId,
      expires_at: expiresAt
    } as never)
    .select("token")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      const { data: raced } = await admin
        .from("household_invites")
        .select("token, last_email_sent_at")
        .eq("household_id", householdId)
        .eq("email", target)
        .is("accepted_at", null)
        .is("revoked_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (raced?.token) {
        return {
          token: raced.token as string,
          reused: true,
          lastEmailSentAt: (raced.last_email_sent_at as string | null) ?? null
        };
      }
    }
    throw new Error(error?.message ?? "Impossible d'envoyer l'invitation.");
  }
  return { token: data.token as string, reused: false, lastEmailSentAt: null };
}

export async function markHouseholdInviteEmailed(token: string): Promise<void> {
  const admin = adminClient();
  await admin
    .from("household_invites")
    .update({ last_email_sent_at: new Date().toISOString() } as never)
    .eq("token", token)
    .is("accepted_at", null)
    .is("revoked_at", null);
}

export async function hasOpenHouseholdInviteForEmail(email: string): Promise<boolean> {
  const admin = adminClient();
  const { data } = await admin
    .from("household_invites")
    .select("id")
    .eq("email", normalizeEmail(email))
    .is("accepted_at", null)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}

export async function acceptHouseholdInvite(input: {
  userId: string;
  email: string;
  token: string;
}): Promise<void> {
  const admin = adminClient();
  const email = normalizeEmail(input.email);
  const { data: invite } = await admin
    .from("household_invites")
    .select("id, household_id, email, expires_at, accepted_at, revoked_at")
    .eq("token", input.token)
    .maybeSingle();

  if (!invite || invite.accepted_at || invite.revoked_at) {
    throw new Error("Invitation introuvable ou déjà utilisée.");
  }
  if (normalizeEmail(invite.email as string) !== email) {
    throw new Error("Cette invitation ne correspond pas à votre adresse e-mail.");
  }
  if (new Date(invite.expires_at as string).getTime() < Date.now()) {
    throw new Error("Cette invitation a expiré.");
  }

  const current = await getHouseholdMembership(input.userId);
  if (current) {
    throw new Error("Vous appartenez déjà à un foyer.");
  }

  const { data: household } = await admin
    .from("households")
    .select("owner_id")
    .eq("id", invite.household_id)
    .maybeSingle();
  const owner = household ? await getOwnerProfile(household.owner_id as string) : null;
  if (
    !owner ||
    !isFamilyPlanActive({
      plan: owner.plan,
      planStatus: owner.plan_status,
      canceledAt: owner.plan_canceled_at,
      renewsAt: owner.plan_renews_at
    })
  ) {
    throw new Error("Le foyer n'est plus actif.");
  }

  const { count } = await admin
    .from("household_members")
    .select("user_id", { count: "exact", head: true })
    .eq("household_id", invite.household_id);
  if ((count ?? 0) >= FAMILY_HOUSEHOLD_LIMIT) {
    throw new Error(`Le foyer est limité à ${FAMILY_HOUSEHOLD_LIMIT} comptes.`);
  }

  const { error: memberError } = await admin.from("household_members").insert({
    household_id: invite.household_id,
    user_id: input.userId,
    role: "member"
  } as never);
  if (memberError) {
    throw new Error(memberError.message);
  }

  await admin
    .from("household_invites")
    .update({ accepted_at: new Date().toISOString() } as never)
    .eq("id", invite.id);
}

export async function revokeHouseholdInvite(input: { ownerId: string; inviteId: string }): Promise<void> {
  const membership = await getHouseholdMembership(input.ownerId);
  if (!membership || membership.role !== "owner") {
    throw new Error("Seul le titulaire peut retirer une invitation.");
  }
  const admin = adminClient();
  const { error } = await admin
    .from("household_invites")
    .update({ revoked_at: new Date().toISOString() } as never)
    .eq("id", input.inviteId)
    .eq("household_id", membership.householdId)
    .is("accepted_at", null);
  if (error) throw new Error(error.message);
}

export async function removeHouseholdMember(input: { ownerId: string; memberUserId: string }): Promise<void> {
  const membership = await getHouseholdMembership(input.ownerId);
  if (!membership || membership.role !== "owner") {
    throw new Error("Seul le titulaire peut retirer un membre.");
  }
  if (input.memberUserId === input.ownerId) {
    throw new Error("Le titulaire ne peut pas quitter son propre foyer.");
  }
  const admin = adminClient();
  const { error } = await admin
    .from("household_members")
    .delete()
    .eq("household_id", membership.householdId)
    .eq("user_id", input.memberUserId)
    .eq("role", "member");
  if (error) throw new Error(error.message);
}

export async function leaveHousehold(userId: string): Promise<void> {
  const membership = await getHouseholdMembership(userId);
  if (!membership) return;
  if (membership.role === "owner") {
    throw new Error("Le titulaire ne peut pas quitter le foyer. Annulez l'abonnement Family ou retirez les membres.");
  }
  const admin = adminClient();
  const { error } = await admin
    .from("household_members")
    .delete()
    .eq("household_id", membership.householdId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export function householdVehicleLimit(hasHouseholdBenefits: boolean, ownLimit: number): number {
  return hasHouseholdBenefits ? PLANS.family.vehicleLimit : ownLimit;
}
