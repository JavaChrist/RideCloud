import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserPlanState } from "@/lib/billing/limits";
import { isPaidPlan } from "@/lib/billing/plans";
import { resolveMaintenanceTemplatesForVehicle } from "@/lib/data/maintenance-template-resolver";
import {
  findCachedMaintenanceTemplates,
  writeCachedMaintenanceTemplates
} from "@/lib/data/maintenance-template-cache";
import { generateMaintenancePlanWithAi } from "@/lib/ai/maintenance-generator";
import {
  DEFAULT_DUE_SOON_DAYS_THRESHOLD,
  DEFAULT_DUE_SOON_KM_THRESHOLD,
  calculateNextMaintenanceDue,
  getMaintenanceStatus
} from "@/lib/maintenance";
import type { Vehicle } from "@/types/database";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RequestSchema = z.object({
  vehicleId: z.string().uuid(),
  force: z.boolean().optional().default(false)
});

/**
 * POST /api/maintenance/generate-plan
 *
 * Génère un plan d'entretien personnalisé pour un véhicule via Mistral AI.
 *
 * Réservé aux plans Premium et Family.
 *
 * Comportement :
 *   1. Vérifie l'auth + plan payant + ownership du véhicule
 *   2. Si un profil constructeur hardcoded existe → 409 (pas besoin d'IA)
 *   3. Sinon, cherche en cache partagé (cache hit = utilisé tel quel)
 *   4. Cache miss : appelle Mistral, valide, écrit en cache
 *   5. Régénère les plan_entries du véhicule à partir des nouveaux templates
 *   6. Si `force=true`, force un nouvel appel LLM même en cas de cache hit
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // ----- Body -----
  let body: { vehicleId: string; force: boolean };
  try {
    const json = await request.json();
    const parsed = RequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Paramètres invalides : vehicleId requis (UUID)." },
        { status: 400 }
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "Body JSON invalide." }, { status: 400 });
  }

  // ----- Plan check : Premium ou Family uniquement -----
  const planState = await getUserPlanState(user.id);
  if (!isPaidPlan(planState.plan) || planState.planStatus !== "active") {
    return NextResponse.json(
      {
        error: "Fonctionnalité réservée aux abonnés Premium ou Family.",
        upgradeUrl: "/tarifs"
      },
      { status: 402 }
    );
  }

  // ----- Vehicle check : ownership -----
  const { data: vehicleData, error: vehicleError } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", body.vehicleId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (vehicleError || !vehicleData) {
    return NextResponse.json({ error: "Véhicule introuvable." }, { status: 404 });
  }

  const vehicle = vehicleData as Vehicle;

  // ----- Skip if a manufacturer rule already exists in code -----
  const syncResolved = resolveMaintenanceTemplatesForVehicle(vehicle);
  if (syncResolved.hasManufacturerRule) {
    return NextResponse.json(
      {
        error:
          "Ce modèle dispose déjà d'un plan constructeur dans RideCloud. Aucune génération IA nécessaire.",
        profileName: syncResolved.profileName
      },
      { status: 409 }
    );
  }

  // ----- Cache lookup -----
  let cached = body.force
    ? null
    : await findCachedMaintenanceTemplates({
        category: vehicle.category,
        marque: vehicle.marque,
        modele: vehicle.modele
      });

  let llmModel: string | null = cached?.llmModel ?? null;
  let profileName = cached?.profileName ?? "";
  let templates = cached?.templates ?? [];
  let source: "ai" | "approved" | "community" = cached?.source ?? "ai";
  let aiCallMade = false;

  // ----- LLM call si cache miss ou force -----
  if (!cached) {
    try {
      const aiResult = await generateMaintenancePlanWithAi({
        category: vehicle.category,
        marque: vehicle.marque,
        modele: vehicle.modele,
        annee: vehicle.annee,
        carburant: vehicle.carburant
      });
      templates = aiResult.templates;
      profileName = aiResult.profileName;
      llmModel = aiResult.llmModel;
      source = "ai";
      aiCallMade = true;

      await writeCachedMaintenanceTemplates({
        category: vehicle.category,
        marque: vehicle.marque,
        modele: vehicle.modele,
        annee: vehicle.annee,
        profileName,
        templates,
        source: "ai",
        llmModel,
        promptVersion: aiResult.promptVersion
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur génération IA.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  if (templates.length === 0) {
    return NextResponse.json(
      { error: "Aucun template généré." },
      { status: 500 }
    );
  }

  // ----- Régénérer les plan_entries pour ce véhicule -----
  // On supprime UNIQUEMENT les entrées issues d'un template (hardcoded/ai/community),
  // jamais les entrées manuelles. Sauf si l'utilisateur a déjà fait des entretiens
  // sur des entrées hardcoded : on les conserve pour ne pas perdre l'historique
  // de last_done_*. Le mieux est d'upserter par (categorie, titre).
  const admin = createAdminClient();

  // Suppression des entries template non liées à de l'historique
  const { data: existingEntries } = await admin
    .from("maintenance_plan_entries")
    .select("id, source, last_done_km, last_done_date, categorie, titre")
    .eq("user_id", user.id)
    .eq("vehicle_id", vehicle.id);

  const existingMap = new Map<string, { id: string; hasHistory: boolean }>();
  for (const entry of (existingEntries ?? []) as Array<{
    id: string;
    source: string;
    last_done_km: number | null;
    last_done_date: string | null;
    categorie: string;
    titre: string;
  }>) {
    if (entry.source !== "template") continue;
    const key = `${entry.categorie}::${entry.titre}`.toLowerCase();
    existingMap.set(key, {
      id: entry.id,
      hasHistory: Boolean(entry.last_done_km != null || entry.last_done_date)
    });
  }

  const templateSource = source === "approved" ? "approved" : source === "community" ? "community" : "ai";
  const nowIso = new Date().toISOString();
  const todayIso = nowIso.slice(0, 10);

  // Pour un véhicule d'occasion (km > 0) sans historique enregistré,
  // on initialise last_done_km/date au kilométrage actuel afin que le plan
  // ne parte pas de 0 et n'affiche pas tout comme "en retard".
  const initialLastDoneKm = (vehicle.kilometrage ?? 0) > 0 ? vehicle.kilometrage : null;
  const initialLastDoneDate = (vehicle.kilometrage ?? 0) > 0 ? todayIso : null;

  let inserted = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const template of templates) {
    const key = `${template.categorie}::${template.titre}`.toLowerCase();
    const existing = existingMap.get(key);

    // Pour un insert (nouveau véhicule), on part du km actuel comme référence.
    // Pour un update (plan existant avec historique), on ne touche pas last_done_*.
    const entryLastDoneKm = existing?.hasHistory ? undefined : initialLastDoneKm;
    const entryLastDoneDate = existing?.hasHistory ? undefined : initialLastDoneDate;

    const due = calculateNextMaintenanceDue({
      intervalKm: template.intervalKm,
      intervalMonths: template.intervalMonths,
      firstDueKm: template.firstDueKm,
      firstDueDate: template.firstDueDate,
      lastDoneKm: entryLastDoneKm ?? null,
      lastDoneDate: entryLastDoneDate ?? null
    });
    const status = getMaintenanceStatus({
      nextDueKm: due.nextDueKm,
      nextDueDate: due.nextDueDate,
      currentKm: vehicle.kilometrage,
      dueSoonKmThreshold: template.dueSoonKmThreshold ?? DEFAULT_DUE_SOON_KM_THRESHOLD,
      dueSoonDaysThreshold: template.dueSoonDaysThreshold ?? DEFAULT_DUE_SOON_DAYS_THRESHOLD
    });

    if (existing) {
      const { error: updateError } = await admin
        .from("maintenance_plan_entries")
        .update({
          description: template.description,
          interval_km: template.intervalKm,
          interval_months: template.intervalMonths,
          first_due_km: template.firstDueKm,
          first_due_date: template.firstDueDate,
          due_soon_km_threshold: template.dueSoonKmThreshold ?? DEFAULT_DUE_SOON_KM_THRESHOLD,
          due_soon_days_threshold: template.dueSoonDaysThreshold ?? DEFAULT_DUE_SOON_DAYS_THRESHOLD,
          priority: template.priority,
          template_source: templateSource,
          updated_at: nowIso
        } as never)
        .eq("id", existing.id);
      if (updateError) {
        console.error("[generate-plan] update failed", { titre: template.titre, updateError });
        errors.push(`${template.titre}: ${updateError.message}`);
      } else {
        updated += 1;
      }
      existingMap.delete(key);
    } else {
      const { error: insertError } = await admin
        .from("maintenance_plan_entries")
        .insert({
          user_id: user.id,
          vehicle_id: vehicle.id,
          titre: template.titre,
          categorie: template.categorie,
          description: template.description,
          interval_km: template.intervalKm,
          interval_months: template.intervalMonths,
          first_due_km: template.firstDueKm,
          first_due_date: template.firstDueDate,
          last_done_km: initialLastDoneKm,
          last_done_date: initialLastDoneDate,
          next_due_km: due.nextDueKm,
          next_due_date: due.nextDueDate,
          due_soon_km_threshold: template.dueSoonKmThreshold ?? DEFAULT_DUE_SOON_KM_THRESHOLD,
          due_soon_days_threshold: template.dueSoonDaysThreshold ?? DEFAULT_DUE_SOON_DAYS_THRESHOLD,
          priority: template.priority,
          status,
          source: "template",
          template_source: templateSource,
          created_at: nowIso,
          updated_at: nowIso
        } as never);
      if (insertError) {
        console.error("[generate-plan] insert failed", { titre: template.titre, insertError });
        errors.push(`${template.titre}: ${insertError.message}`);
      } else {
        inserted += 1;
      }
    }
  }

  for (const [, entry] of existingMap.entries()) {
    if (entry.hasHistory) continue;
    await admin.from("maintenance_plan_entries").delete().eq("id", entry.id);
  }

  // Si TOUS les inserts/updates ont échoué, on remonte une erreur claire.
  // Cause la plus probable : la migration 2026-05-17_ai_maintenance_plan.sql
  // qui ajoute la colonne `template_source` n'a pas été exécutée sur la DB.
  if (inserted + updated === 0 && errors.length > 0) {
    return NextResponse.json(
      {
        error:
          "Aucune tâche n'a pu être enregistrée. Vérifiez que la migration 'template_source' a été exécutée dans Supabase.",
        details: errors.slice(0, 3)
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    profileName,
    templateCount: templates.length,
    inserted,
    updated,
    errors: errors.length > 0 ? errors.slice(0, 3) : undefined,
    aiCallMade,
    source,
    llmModel
  });
}
