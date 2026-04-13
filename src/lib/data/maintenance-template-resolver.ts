import { manufacturerMaintenanceTemplateRules } from "@/lib/data/maintenance-manufacturer-templates";
import { maintenanceTemplates } from "@/lib/data/maintenance-templates";
import type { Vehicle } from "@/types/database";
import type { MaintenanceTemplateEntry } from "@/types/maintenance";

function normalize(input: string | null | undefined) {
  return (input ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function mergeTemplates(baseTemplates: MaintenanceTemplateEntry[], overrideTemplates: MaintenanceTemplateEntry[]) {
  const map = new Map<string, MaintenanceTemplateEntry>();
  for (const template of baseTemplates) {
    map.set(`${template.categorie}::${template.titre}`.toLowerCase(), template);
  }
  for (const template of overrideTemplates) {
    map.set(`${template.categorie}::${template.titre}`.toLowerCase(), template);
  }
  return Array.from(map.values());
}

export function resolveMaintenanceTemplatesForVehicle(vehicle: Vehicle) {
  const categoryTemplates = maintenanceTemplates[vehicle.category] ?? [];
  const marque = normalize(vehicle.marque);
  const modele = normalize(vehicle.modele);

  const matchingRules = manufacturerMaintenanceTemplateRules
    .filter((rule) => {
      if (rule.category !== vehicle.category) return false;
      if (normalize(rule.marque) !== marque) return false;
      if (!rule.modeleContains) return true;
      return modele.includes(normalize(rule.modeleContains));
    })
    .sort((a, b) => {
      const aScore = a.modeleContains ? 2 : 1;
      const bScore = b.modeleContains ? 2 : 1;
      return bScore - aScore;
    });

  const selectedRule = matchingRules[0] ?? null;
  const templates = selectedRule
    ? mergeTemplates(categoryTemplates, selectedRule.templates)
    : categoryTemplates;

  return {
    profileName: selectedRule?.profileName ?? `${vehicle.category} - générique`,
    templates
  };
}
