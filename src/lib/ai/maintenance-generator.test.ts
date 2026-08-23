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

function planOmitting(keys: string[]) {
  const task = validTask() as Record<string, unknown>;
  for (const key of keys) {
    delete task[key];
  }
  return {
    profileName: "Peugeot 208",
    tasks: [task, validTask({ titre: "Freins" }), validTask({ titre: "Pneus" })]
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
  });

  it("accepte un dueSoonKmThreshold absent", () => {
    const result = parseAndNormalizeAiPlan(planOmitting(["dueSoonKmThreshold"]));
    expect(result.templates[0]?.dueSoonKmThreshold).toBeUndefined();
  });

  it("normalise dueSoonDaysThreshold null en undefined", () => {
    const result = parseAndNormalizeAiPlan(validPlan({ dueSoonDaysThreshold: null }));
    expect(result.templates[0]?.dueSoonDaysThreshold).toBeUndefined();
  });

  it("accepte un dueSoonDaysThreshold absent", () => {
    const result = parseAndNormalizeAiPlan(planOmitting(["dueSoonDaysThreshold"]));
    expect(result.templates[0]?.dueSoonDaysThreshold).toBeUndefined();
  });

  it("accepte firstDueKm absent et le normalise en null", () => {
    const result = parseAndNormalizeAiPlan(planOmitting(["firstDueKm"]));
    expect(result.templates[0]?.firstDueKm).toBeNull();
  });

  it("accepte firstDueKm null", () => {
    const result = parseAndNormalizeAiPlan(validPlan({ firstDueKm: null }));
    expect(result.templates[0]?.firstDueKm).toBeNull();
  });

  it("accepte intervalKm absent et le normalise en null", () => {
    const result = parseAndNormalizeAiPlan(planOmitting(["intervalKm"]));
    expect(result.templates[0]?.intervalKm).toBeNull();
  });

  it("accepte intervalMonths absent et le normalise en null", () => {
    const result = parseAndNormalizeAiPlan(planOmitting(["intervalMonths"]));
    expect(result.templates[0]?.intervalMonths).toBeNull();
  });

  it("accepte firstDueDate absent et le normalise en null", () => {
    const result = parseAndNormalizeAiPlan(planOmitting(["firstDueDate"]));
    expect(result.templates[0]?.firstDueDate).toBeNull();
  });

  it("rejette un nombre ou une string invalide", () => {
    expect(() => parseAndNormalizeAiPlan(validPlan({ dueSoonKmThreshold: "700" }))).toThrow(
      /Réponse Mistral invalide/
    );
    expect(() => parseAndNormalizeAiPlan(validPlan({ dueSoonKmThreshold: -10 }))).toThrow(
      /Réponse Mistral invalide/
    );
    expect(() => parseAndNormalizeAiPlan(validPlan({ firstDueKm: "10000" }))).toThrow(
      /Réponse Mistral invalide/
    );
    expect(() => parseAndNormalizeAiPlan(validPlan({ intervalKm: -5 }))).toThrow(
      /Réponse Mistral invalide/
    );
  });

  it("rejette un champ obligatoire absent", () => {
    expect(() => parseAndNormalizeAiPlan(planOmitting(["titre"]))).toThrow(/Réponse Mistral invalide/);
    expect(() => parseAndNormalizeAiPlan(planOmitting(["categorie"]))).toThrow(/Réponse Mistral invalide/);
    expect(() => parseAndNormalizeAiPlan(planOmitting(["description"]))).toThrow(
      /Réponse Mistral invalide/
    );
    expect(() => parseAndNormalizeAiPlan(planOmitting(["priority"]))).toThrow(/Réponse Mistral invalide/);
    expect(() => parseAndNormalizeAiPlan(validPlan({ titre: "X" }))).toThrow(/Réponse Mistral invalide/);
  });
});
