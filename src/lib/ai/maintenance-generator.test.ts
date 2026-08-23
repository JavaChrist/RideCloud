import { describe, expect, it } from "vitest";
import { parseAndNormalizeAiPlan } from "./maintenance-generator";

function validTask(overrides: Record<string, unknown> = {}) {
  return {
    titre: "Vidange moteur",
    categorie: "moteur",
    description: "Vidange huile + filtre, intervalle constructeur.",
    intervalKm: 10000,
    intervalMonths: 12,
    firstDueKm: 10000,
    firstDueDate: null,
    dueSoonKmThreshold: 700,
    dueSoonDaysThreshold: 30,
    priority: "important",
    ...overrides
  };
}

function validPlan(taskOverrides: Record<string, unknown> = {}) {
  return {
    profileName: "Peugeot 208",
    tasks: [validTask(taskOverrides), validTask({ titre: "Freins" }), validTask({ titre: "Pneus" })]
  };
}

describe("parseAndNormalizeAiPlan", () => {
  it("conserve un dueSoonKmThreshold numérique valide", () => {
    const result = parseAndNormalizeAiPlan(validPlan({ dueSoonKmThreshold: 700 }));
    expect(result.templates[0]?.dueSoonKmThreshold).toBe(700);
  });

  it("normalise dueSoonKmThreshold null en undefined", () => {
    const result = parseAndNormalizeAiPlan(validPlan({ dueSoonKmThreshold: null }));
    expect(result.templates[0]?.dueSoonKmThreshold).toBeUndefined();
    expect("dueSoonKmThreshold" in (result.templates[0] ?? {})).toBe(true);
  });

  it("accepte un dueSoonKmThreshold absent", () => {
    const task = validTask();
    delete task.dueSoonKmThreshold;
    const result = parseAndNormalizeAiPlan({
      profileName: "Peugeot 208",
      tasks: [task, validTask({ titre: "Freins" }), validTask({ titre: "Pneus" })]
    });
    expect(result.templates[0]?.dueSoonKmThreshold).toBeUndefined();
  });

  it("normalise dueSoonDaysThreshold null en undefined", () => {
    const result = parseAndNormalizeAiPlan(validPlan({ dueSoonDaysThreshold: null }));
    expect(result.templates[0]?.dueSoonDaysThreshold).toBeUndefined();
  });

  it("rejette un champ réellement invalide", () => {
    expect(() => parseAndNormalizeAiPlan(validPlan({ titre: "X" }))).toThrow(
      /Réponse Mistral invalide/
    );
    expect(() => parseAndNormalizeAiPlan(validPlan({ dueSoonKmThreshold: "700" }))).toThrow(
      /Réponse Mistral invalide/
    );
    expect(() => parseAndNormalizeAiPlan(validPlan({ dueSoonKmThreshold: -10 }))).toThrow(
      /Réponse Mistral invalide/
    );
  });
});
