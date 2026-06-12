import { describe, expect, it } from "vitest";
import {
  daysSinceOdometerRefresh,
  estimateCurrentOdometer,
  getEffectiveDueDate,
  projectDateForOdometer
} from "./odometer-estimate";

const FIXED_NOW = new Date("2026-06-12T12:00:00Z");

describe("estimateCurrentOdometer", () => {
  it("renvoie la valeur de référence quand aucun temps ne s'est écoulé", () => {
    const result = estimateCurrentOdometer({
      lastOdometerValue: 50000,
      lastOdometerDate: FIXED_NOW.toISOString(),
      avgKmPerYear: 12000,
      now: FIXED_NOW
    });
    expect(result).toBe(50000);
  });

  it("ajoute environ avg_km_per_year après un an complet", () => {
    const oneYearAgo = new Date(FIXED_NOW);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const result = estimateCurrentOdometer({
      lastOdometerValue: 50000,
      lastOdometerDate: oneYearAgo,
      avgKmPerYear: 12000,
      now: FIXED_NOW
    });
    // Tolérance ±50 km : on accepte le bruit lié aux années bissextiles.
    expect(result).toBeGreaterThanOrEqual(61950);
    expect(result).toBeLessThanOrEqual(62050);
  });

  it("ne descend jamais sous la dernière valeur connue (horloge en arrière)", () => {
    const future = new Date(FIXED_NOW);
    future.setDate(future.getDate() + 30);
    const result = estimateCurrentOdometer({
      lastOdometerValue: 80000,
      lastOdometerDate: future.toISOString(),
      avgKmPerYear: 12000,
      now: FIXED_NOW
    });
    expect(result).toBe(80000);
  });
});

describe("projectDateForOdometer", () => {
  it("renvoie null sans rythme connu", () => {
    expect(
      projectDateForOdometer({
        targetKm: 60000,
        lastOdometerValue: 50000,
        lastOdometerDate: FIXED_NOW,
        avgKmPerYear: 0
      })
    ).toBeNull();
  });

  it("projette correctement la date pour atteindre un km cible", () => {
    // 10 000 km à parcourir, à 10 000 km/an → ~365 jours
    const projected = projectDateForOdometer({
      targetKm: 60000,
      lastOdometerValue: 50000,
      lastOdometerDate: FIXED_NOW,
      avgKmPerYear: 10000
    });
    expect(projected).not.toBeNull();
    const diffDays = Math.round(
      (projected!.getTime() - FIXED_NOW.getTime()) / (24 * 60 * 60 * 1000)
    );
    expect(diffDays).toBeGreaterThanOrEqual(364);
    expect(diffDays).toBeLessThanOrEqual(366);
  });

  it("renvoie la date de référence si le km cible est déjà atteint", () => {
    const projected = projectDateForOdometer({
      targetKm: 40000,
      lastOdometerValue: 50000,
      lastOdometerDate: FIXED_NOW,
      avgKmPerYear: 10000
    });
    expect(projected).toEqual(FIXED_NOW);
  });
});

describe("daysSinceOdometerRefresh", () => {
  it("renvoie 0 le jour même", () => {
    expect(
      daysSinceOdometerRefresh({
        lastOdometerDate: FIXED_NOW,
        now: FIXED_NOW
      })
    ).toBe(0);
  });

  it("compte correctement les jours pleins écoulés", () => {
    const tenDaysAgo = new Date(FIXED_NOW);
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    expect(
      daysSinceOdometerRefresh({
        lastOdometerDate: tenDaysAgo,
        now: FIXED_NOW
      })
    ).toBe(10);
  });

  it("renvoie null si aucune date fournie", () => {
    expect(daysSinceOdometerRefresh({ lastOdometerDate: null, now: FIXED_NOW })).toBeNull();
  });
});

describe("getEffectiveDueDate — premier des deux seuils", () => {
  /**
   * Cas "gros rouleur" : 25 000 km/an, échéance km dans 5 000 km,
   * échéance temps dans 12 mois. Le km projeté arrive avant les 12 mois
   * → c'est le KM qui déclenche.
   */
  it("gros rouleur : c'est le km qui déclenche", () => {
    const oneYearLater = new Date(FIXED_NOW);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    const result = getEffectiveDueDate({
      nextDueKm: 55000,
      nextDueDate: oneYearLater.toISOString(),
      lastOdometerValue: 50000,
      lastOdometerDate: FIXED_NOW,
      avgKmPerYear: 25000
    });

    expect(result.triggeredBy).toBe("km");
    // ~5000 km à 25000 km/an = ~73 jours, donc bien avant les 365 jours.
    const daysToEffective = Math.round(
      (result.effectiveDate!.getTime() - FIXED_NOW.getTime()) / (24 * 60 * 60 * 1000)
    );
    expect(daysToEffective).toBeLessThan(100);
  });

  /**
   * Cas "petit rouleur" : 2 000 km/an, échéance km dans 5 000 km,
   * échéance temps dans 12 mois. À ce rythme, le km projeté arrive dans
   * ~2,5 ans → c'est le TEMPS qui déclenche au bout de 12 mois.
   */
  it("petit rouleur : c'est le temps qui déclenche", () => {
    const oneYearLater = new Date(FIXED_NOW);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    const result = getEffectiveDueDate({
      nextDueKm: 55000,
      nextDueDate: oneYearLater.toISOString(),
      lastOdometerValue: 50000,
      lastOdometerDate: FIXED_NOW,
      avgKmPerYear: 2000
    });

    expect(result.triggeredBy).toBe("date");
    const diffMs = result.effectiveDate!.getTime() - oneYearLater.getTime();
    expect(Math.abs(diffMs)).toBeLessThan(60 * 1000); // ~ même seconde
  });

  it("ne déclenche que sur date si pas de km cible", () => {
    const oneYearLater = new Date(FIXED_NOW);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    const result = getEffectiveDueDate({
      nextDueKm: null,
      nextDueDate: oneYearLater.toISOString(),
      lastOdometerValue: 50000,
      lastOdometerDate: FIXED_NOW,
      avgKmPerYear: 10000
    });
    expect(result.triggeredBy).toBe("date");
    expect(result.kmBound).toBeNull();
  });

  it("ne déclenche que sur km si pas d'échéance temporelle", () => {
    const result = getEffectiveDueDate({
      nextDueKm: 55000,
      nextDueDate: null,
      lastOdometerValue: 50000,
      lastOdometerDate: FIXED_NOW,
      avgKmPerYear: 10000
    });
    expect(result.triggeredBy).toBe("km");
    expect(result.dateBound).toBeNull();
  });
});
