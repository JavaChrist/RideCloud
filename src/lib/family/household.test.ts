import { describe, expect, it } from "vitest";
import {
  FAMILY_HOUSEHOLD_LIMIT,
  buildFamilyPrioritySupportMailto,
  householdVehicleLimit,
  isFamilyPlanActive,
  isValidInviteEmail,
  remainingHouseholdSeats
} from "./household";

describe("isFamilyPlanActive", () => {
  it("n'accorde le foyer que si Family est actif et non expiré", () => {
    expect(
      isFamilyPlanActive({
        plan: "family",
        planStatus: "active",
        canceledAt: null,
        renewsAt: null
      })
    ).toBe(true);
    expect(
      isFamilyPlanActive({
        plan: "premium",
        planStatus: "active",
        canceledAt: null,
        renewsAt: null
      })
    ).toBe(false);
    expect(
      isFamilyPlanActive({
        plan: "family",
        planStatus: "active",
        canceledAt: "2026-01-01T00:00:00.000Z",
        renewsAt: "2020-01-01T00:00:00.000Z"
      })
    ).toBe(false);
  });
});

describe("remainingHouseholdSeats", () => {
  it("compte les membres et les invitations dans la limite de 4", () => {
    expect(remainingHouseholdSeats(1, 0)).toBe(3);
    expect(remainingHouseholdSeats(2, 2)).toBe(0);
    expect(remainingHouseholdSeats(FAMILY_HOUSEHOLD_LIMIT, 1)).toBe(0);
  });
});

describe("isValidInviteEmail", () => {
  it("accepte une adresse normalisable et refuse le reste", () => {
    expect(isValidInviteEmail("  Alex@JavaChrist.fr ")).toBe(true);
    expect(isValidInviteEmail("pas-un-email")).toBe(false);
  });
});

describe("householdVehicleLimit", () => {
  it("applique la limite Family au foyer actif seulement", () => {
    expect(householdVehicleLimit(true, 1)).toBe(10);
    expect(householdVehicleLimit(false, 5)).toBe(5);
  });
});

describe("buildFamilyPrioritySupportMailto", () => {
  it("ouvre le support prioritaire sans secret", () => {
    const href = buildFamilyPrioritySupportMailto("titulaire@example.com");
    expect(href.startsWith("mailto:support@javachrist.fr?")).toBe(true);
    expect(href.toLowerCase()).not.toContain("password");
    expect(href.toLowerCase()).not.toContain("token");
    expect(decodeURIComponent(href)).toContain("titulaire@example.com");
  });
});
