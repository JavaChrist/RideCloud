import { manufacturerMaintenanceTemplateRules } from "@/lib/data/maintenance-manufacturer-templates";
import { maintenanceTemplates } from "@/lib/data/maintenance-templates";
import { findCachedMaintenanceTemplates } from "@/lib/data/maintenance-template-cache";
import type { MaintenanceTemplateSource, Vehicle } from "@/types/database";
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

export interface ResolvedMaintenanceTemplates {
  profileName: string;
  templates: MaintenanceTemplateEntry[];
  templateSource: MaintenanceTemplateSource;
  hasManufacturerRule: boolean;
}

/**
 * Résolution synchrone : règles hardcoded (constructeur) avec fallback générique.
 * Ne consulte pas le cache LLM (utiliser la version async pour cela).
 */
export function resolveMaintenanceTemplatesForVehicle(vehicle: Vehicle): ResolvedMaintenanceTemplates {
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
    templates,
    templateSource: "hardcoded",
    hasManufacturerRule: Boolean(selectedRule)
  };
}

/**
 * Résolution complète : hardcoded en priorité, puis cache LLM si pas de
 * profil constructeur. Si le cache contient un plan IA pour ce modèle, il est
 * utilisé en remplacement des templates génériques.
 *
 * À appeler côté serveur uniquement (utilise le client admin Supabase).
 */
export async function resolveMaintenanceTemplatesAsync(
  vehicle: Vehicle
): Promise<ResolvedMaintenanceTemplates> {
  const sync = resolveMaintenanceTemplatesForVehicle(vehicle);

  // Si on a déjà une règle constructeur explicite, on garde la priorité hardcoded
  if (sync.hasManufacturerRule) {
    return sync;
  }

  try {
    const cached = await findCachedMaintenanceTemplates({
      category: vehicle.category,
      marque: vehicle.marque,
      modele: vehicle.modele
    });

    if (cached && cached.templates.length > 0) {
      // Cache hit : on utilise le plan IA (qui inclut déjà tout ce qui est nécessaire)
      const templateSource: MaintenanceTemplateSource =
        cached.source === "approved" ? "approved" : cached.source === "community" ? "community" : "ai";

      return {
        profileName: cached.profileName,
        templates: cached.templates,
        templateSource,
        hasManufacturerRule: false
      };
    }
  } catch (error) {
    // En cas d'erreur de lookup cache, on retombe gracieusement sur le générique
    console.error("[maintenance-resolver] cache lookup failed", error);
  }

  return sync;
}
