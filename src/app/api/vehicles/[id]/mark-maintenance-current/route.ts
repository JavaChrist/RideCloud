import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculateNextMaintenanceDue,
  getMaintenanceStatus
} from "@/lib/maintenance";
import type { MaintenancePlanEntry, Vehicle } from "@/types/database";

export const dynamic = "force-dynamic";

/**
 * POST /api/vehicles/[id]/mark-maintenance-current
 *
 * Marque toutes les tâches d'entretien périodique d'un véhicule comme
 * réalisées à la date du jour, avec le kilométrage actuel comme référence.
 *
 * Cas d'usage principal : un utilisateur ajoute un véhicule d'occasion avec
 * X km et considère que toutes les révisions périodiques (vidange, courroie,
 * filtres, etc.) ont été faites par l'ancien propriétaire jusqu'à ce point.
 *
 * Comportement :
 *   - On ne touche QUE les tâches périodiques (interval_km > 0 OR interval_months > 0).
 *   - Les tâches one-shot (contrôles ponctuels) sont laissées telles quelles.
 *   - Si la tâche a déjà un last_done_* défini, on ne l'écrase pas si la
 *     valeur en place est plus récente / supérieure (politique conservative).
 *   - On recalcule next_due_km / next_due_date / status pour chaque tâche
 *     touchée.
 */
export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: vehicleId } = await context.params;

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: vehicleData, error: vehicleError } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", vehicleId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (vehicleError || !vehicleData) {
    return NextResponse.json({ error: "Véhicule introuvable." }, { status: 404 });
  }

  const vehicle = vehicleData as Vehicle;
  const currentKm = vehicle.kilometrage ?? 0;
  const today = new Date().toISOString().slice(0, 10);

  const { data: entriesData, error: entriesError } = await supabase
    .from("maintenance_plan_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("vehicle_id", vehicleId);

  if (entriesError) {
    return NextResponse.json(
      { error: `Impossible de lire le plan : ${entriesError.message}` },
      { status: 500 }
    );
  }

  const entries = (entriesData ?? []) as MaintenancePlanEntry[];
  if (entries.length === 0) {
    return NextResponse.json(
      {
        error:
          "Aucune tâche dans le plan. Générez d'abord un plan d'entretien pour ce véhicule."
      },
      { status: 404 }
    );
  }

  const admin = createAdminClient();
  const nowIso = new Date().toISOString();

  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const entry of entries) {
    const isPeriodic =
      (entry.interval_km != null && entry.interval_km > 0) ||
      (entry.interval_months != null && entry.interval_months > 0);

    if (!isPeriodic) {
      skipped += 1;
      continue;
    }

    // Politique conservative : si une intervention plus récente est déjà
    // enregistrée (last_done_km supérieur, ou last_done_date postérieure),
    // on ne l'écrase pas.
    const existingKm = entry.last_done_km ?? null;
    const existingDate = entry.last_done_date ?? null;
    const keepExistingKm = existingKm != null && existingKm >= currentKm;
    const keepExistingDate = existingDate != null && existingDate >= today;

    const newLastDoneKm = keepExistingKm ? existingKm : currentKm;
    const newLastDoneDate = keepExistingDate ? existingDate : today;

    if (keepExistingKm && keepExistingDate) {
      skipped += 1;
      continue;
    }

    const due = calculateNextMaintenanceDue({
      intervalKm: entry.interval_km,
      intervalMonths: entry.interval_months,
      firstDueKm: entry.first_due_km,
      firstDueDate: entry.first_due_date,
      lastDoneKm: newLastDoneKm,
      lastDoneDate: newLastDoneDate
    });
    const status = getMaintenanceStatus({
      nextDueKm: due.nextDueKm,
      nextDueDate: due.nextDueDate,
      currentKm,
      dueSoonKmThreshold: entry.due_soon_km_threshold,
      dueSoonDaysThreshold: entry.due_soon_days_threshold,
      lastDoneKm: newLastDoneKm,
      lastDoneDate: newLastDoneDate
    });

    const { error: updateError } = await admin
      .from("maintenance_plan_entries")
      .update({
        last_done_km: newLastDoneKm,
        last_done_date: newLastDoneDate,
        next_due_km: due.nextDueKm,
        next_due_date: due.nextDueDate,
        status,
        updated_at: nowIso
      } as never)
      .eq("id", entry.id);

    if (updateError) {
      console.error("[mark-maintenance-current] update failed", {
        titre: entry.titre,
        updateError
      });
      errors.push(`${entry.titre}: ${updateError.message}`);
    } else {
      updated += 1;
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    updated,
    skipped,
    referenceKm: currentKm,
    referenceDate: today,
    errors: errors.length > 0 ? errors.slice(0, 3) : undefined
  });
}
