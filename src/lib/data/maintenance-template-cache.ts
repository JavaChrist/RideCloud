import { createAdminClient } from "@/lib/supabase/admin";
import type { VehicleCategory, MaintenanceTemplateCacheRow } from "@/types/database";
import type { MaintenanceTemplateEntry } from "@/types/maintenance";

export function normalizeForCache(input: string | null | undefined): string {
  return (input ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export interface CachedMaintenanceTemplates {
  profileName: string;
  templates: MaintenanceTemplateEntry[];
  source: "ai" | "approved" | "community";
  llmModel: string | null;
  generatedAt: string;
  validatedAt: string | null;
}

export interface CacheLookupInput {
  category: VehicleCategory;
  marque: string;
  modele: string;
}

export interface CacheWriteInput extends CacheLookupInput {
  annee: number | null;
  profileName: string;
  templates: MaintenanceTemplateEntry[];
  source: "ai" | "approved" | "community";
  llmModel: string | null;
  promptVersion: string;
}

export async function findCachedMaintenanceTemplates(
  input: CacheLookupInput
): Promise<CachedMaintenanceTemplates | null> {
  const admin = createAdminClient();
  const marqueNormalized = normalizeForCache(input.marque);
  const modeleNormalized = normalizeForCache(input.modele);

  if (!marqueNormalized || !modeleNormalized) return null;

  const { data, error } = await admin
    .from("maintenance_template_cache")
    .select("*")
    .eq("category", input.category)
    .eq("marque_normalized", marqueNormalized)
    .eq("modele_normalized", modeleNormalized)
    .maybeSingle();

  if (error) {
    console.error("[template-cache] lookup error", error.message);
    return null;
  }

  if (!data) return null;

  const row = data as MaintenanceTemplateCacheRow;
  const templates = row.templates as MaintenanceTemplateEntry[] | null;
  if (!Array.isArray(templates) || templates.length === 0) return null;

  return {
    profileName: row.profile_name,
    templates,
    source: row.source,
    llmModel: row.llm_model,
    generatedAt: row.generated_at,
    validatedAt: row.validated_at
  };
}

export async function writeCachedMaintenanceTemplates(
  input: CacheWriteInput
): Promise<void> {
  const admin = createAdminClient();
  const marqueNormalized = normalizeForCache(input.marque);
  const modeleNormalized = normalizeForCache(input.modele);

  if (!marqueNormalized || !modeleNormalized) {
    throw new Error("Marque ou modèle vide après normalisation.");
  }
  if (input.templates.length === 0) {
    throw new Error("Aucun template à enregistrer en cache.");
  }

  const payload = {
    category: input.category,
    marque_normalized: marqueNormalized,
    modele_normalized: modeleNormalized,
    annee: input.annee,
    profile_name: input.profileName,
    templates: input.templates,
    source: input.source,
    llm_model: input.llmModel,
    prompt_version: input.promptVersion,
    generated_at: new Date().toISOString()
  } as never;

  const { error } = await admin
    .from("maintenance_template_cache")
    .upsert(payload, {
      onConflict: "category,marque_normalized,modele_normalized",
      ignoreDuplicates: false
    });

  if (error) {
    throw new Error(`Cache write error: ${error.message}`);
  }
}
