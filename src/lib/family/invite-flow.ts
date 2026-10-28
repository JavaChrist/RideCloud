const INVITE_TOKEN_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function safeFamilyInviteToken(value: string | null | undefined): string | null {
  if (!value) return null;
  const token = value.trim();
  return INVITE_TOKEN_RE.test(token) ? token : null;
}

export function familyInviteAcceptPath(token: string): string {
  return `/parametres?invite=${encodeURIComponent(token)}`;
}

export function familyInviteAuthPath(path: "/login" | "/register", token: string | null): string {
  const safe = safeFamilyInviteToken(token);
  return safe ? `${path}?invite=${encodeURIComponent(safe)}` : path;
}

export function familyInvitePostAuthPath(token: string | null, fallback = "/categories"): string {
  const safe = safeFamilyInviteToken(token);
  return safe ? familyInviteAcceptPath(safe) : fallback;
}

export function familyInviteEmailRedirect(origin: string, token: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/auth/callback?next=${encodeURIComponent(familyInviteAcceptPath(token))}`;
}

export function shouldShowFamilyHouseholdSection(input: {
  canManage: boolean;
  hasHouseholdBenefits: boolean;
  pendingInvite: boolean;
  inviteQuery: boolean;
}): boolean {
  return input.canManage || input.hasHouseholdBenefits || input.pendingInvite || input.inviteQuery;
}

export const FAMILY_INVITE_RESEND_MIN_MS = 2 * 60 * 1000;
export const FAMILY_INVITE_SENDS_PER_HOUR = 3;

export function householdMemberSkipsPersonalCheckout(input: {
  hasHouseholdBenefits: boolean;
}): boolean {
  return input.hasHouseholdBenefits;
}

export function canResendFamilyInvite(lastEmailSentAt: string | null, now = new Date()): boolean {
  if (!lastEmailSentAt) return true;
  const last = new Date(lastEmailSentAt).getTime();
  if (Number.isNaN(last)) return true;
  return now.getTime() - last >= FAMILY_INVITE_RESEND_MIN_MS;
}

export function describeHouseholdSync(input: {
  acceptedMember: boolean;
  householdActive: boolean;
  hasPersonalPlay: boolean;
  hasPersonalMollie: boolean;
}): { synced: "household" | "personal"; skipMollie: boolean; skipPlay: boolean } {
  if (input.hasPersonalPlay || input.hasPersonalMollie) {
    return { synced: "personal", skipMollie: false, skipPlay: false };
  }
  if (input.acceptedMember && input.householdActive) {
    return { synced: "household", skipMollie: true, skipPlay: true };
  }
  return { synced: "personal", skipMollie: false, skipPlay: false };
}
