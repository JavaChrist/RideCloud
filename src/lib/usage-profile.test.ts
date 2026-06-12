import { describe, expect, it } from "vitest";
import { AVG_KM_PER_YEAR, getAvgKmPerYear, isUsageProfile } from "./usage-profile";

describe("usage-profile", () => {
  it("respecte la table de correspondance documentée dans le brief", () => {
    expect(AVG_KM_PER_YEAR.daily.voitures).toBe(15000);
    expect(AVG_KM_PER_YEAR.daily.motos).toBe(12000);
    expect(AVG_KM_PER_YEAR.daily.scooters).toBe(5000);
    expect(AVG_KM_PER_YEAR.daily.utilitaires).toBe(25000);
    expect(AVG_KM_PER_YEAR.rare.scooters).toBe(800);
  });

  it("getAvgKmPerYear renvoie la valeur attendue pour un couple donné", () => {
    expect(getAvgKmPerYear("often", "voitures")).toBe(10000);
    expect(getAvgKmPerYear("occasional", "utilitaires")).toBe(8000);
  });

  it("isUsageProfile valide correctement les chaînes", () => {
    expect(isUsageProfile("daily")).toBe(true);
    expect(isUsageProfile("often")).toBe(true);
    expect(isUsageProfile("occasional")).toBe(true);
    expect(isUsageProfile("rare")).toBe(true);
    expect(isUsageProfile("weekly")).toBe(false);
    expect(isUsageProfile(undefined)).toBe(false);
    expect(isUsageProfile(null)).toBe(false);
    expect(isUsageProfile(42)).toBe(false);
  });
});
