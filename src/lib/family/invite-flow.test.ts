import { describe, expect, it } from "vitest";
import {
  canResendFamilyInvite,
  describeHouseholdSync,
  familyInviteAcceptPath,
  familyInviteAuthPath,
  familyInviteEmailRedirect,
  familyInvitePostAuthPath,
  householdMemberSkipsPersonalCheckout,
  safeFamilyInviteToken,
  shouldShowFamilyHouseholdSection
} from "@/lib/family/invite-flow";
import { familyInviteEmailSubject, familyInviteEmailText, resolveFamilyInviteMailer } from "@/lib/family/invite-email";

const TOKEN = "11111111-1111-4111-8111-111111111111";

describe("parcours invitation Family", () => {
  it("conserve l'invitation après inscription ou connexion", () => {
    expect(safeFamilyInviteToken("not-a-token")).toBeNull();
    expect(familyInviteAuthPath("/register", TOKEN)).toBe(`/register?invite=${TOKEN}`);
    expect(familyInvitePostAuthPath(TOKEN)).toBe(`/parametres?invite=${TOKEN}`);
    expect(familyInvitePostAuthPath(null)).toBe("/categories");
    expect(familyInviteEmailRedirect("https://ridecloud.app", TOKEN)).toContain(
      encodeURIComponent(familyInviteAcceptPath(TOKEN))
    );
  });

  it("distingue invitation ouverte et membre accepté", () => {
    expect(
      shouldShowFamilyHouseholdSection({
        canManage: false,
        hasHouseholdBenefits: false,
        pendingInvite: true,
        inviteQuery: false
      })
    ).toBe(true);
    expect(householdMemberSkipsPersonalCheckout({ hasHouseholdBenefits: false })).toBe(false);
    expect(householdMemberSkipsPersonalCheckout({ hasHouseholdBenefits: true })).toBe(true);
    expect(
      describeHouseholdSync({
        acceptedMember: false,
        householdActive: true,
        hasPersonalPlay: false,
        hasPersonalMollie: false
      })
    ).toEqual({ synced: "personal", skipMollie: false, skipPlay: false });
    expect(
      describeHouseholdSync({
        acceptedMember: true,
        householdActive: true,
        hasPersonalPlay: false,
        hasPersonalMollie: false
      })
    ).toEqual({ synced: "household", skipMollie: true, skipPlay: true });
    expect(
      describeHouseholdSync({
        acceptedMember: true,
        householdActive: true,
        hasPersonalPlay: false,
        hasPersonalMollie: true
      })
    ).toEqual({ synced: "personal", skipMollie: false, skipPlay: false });
  });

  it("limite le renvoi sans créer de doublon logique", () => {
    expect(canResendFamilyInvite(null)).toBe(true);
    expect(canResendFamilyInvite(new Date().toISOString())).toBe(false);
    expect(canResendFamilyInvite("2026-10-28T10:00:00.000Z", new Date("2026-10-28T10:03:00.000Z"))).toBe(
      true
    );
  });

  it("prépare un e-mail Family et choisit le fournisseur sans secret", () => {
    const text = familyInviteEmailText({
      ownerLabel: "Alex",
      acceptUrl: "https://ridecloud.app/parametres?invite=demo"
    });
    expect(familyInviteEmailSubject()).toContain("Family");
    expect(text).toContain("n'avez pas besoin de payer");
    expect(text.toLowerCase()).not.toContain("mollie");
    expect(resolveFamilyInviteMailer({ resendApiKey: "re_test", supabaseUrl: null, supabaseAnonKey: null })).toEqual({
      ready: true,
      provider: "resend"
    });
    expect(
      resolveFamilyInviteMailer({
        resendApiKey: "",
        supabaseUrl: "https://example.supabase.co",
        supabaseAnonKey: "anon"
      })
    ).toEqual({ ready: true, provider: "supabase_smtp" });
    expect(resolveFamilyInviteMailer({ resendApiKey: "", supabaseUrl: "", supabaseAnonKey: "" })).toEqual({
      ready: false,
      provider: "none"
    });
  });
});
