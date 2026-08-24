import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAdminNotificationDeps } from "@/lib/notifications/admin-deps";
import { updateVehicleKilometrage } from "@/lib/vehicles/update-odometer";
import type { MaintenancePlanEntry, Vehicle } from "@/types/database";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  kilometrage: z.coerce.number().int().min(0)
});

/**
 * POST /api/vehicles/[id]/odometer
 * Enregistre le kilométrage (RLS utilisateur) puis déclenche N2
 * uniquement pour ce véhicule / cet utilisateur.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: vehicleId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Kilométrage invalide." }, { status: 400 });
  }

  const admin = createAdminClient();
  const result = await updateVehicleKilometrage({
    userId: user.id,
    vehicleId,
    kilometrage: parsed.data.kilometrage,
    loadOwnedVehicle: async (userId, id) => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle();
      if (error || !data) return null;
      return data as Vehicle;
    },
    persistKilometrage: async (input) => {
      const { data, error } = await supabase
        .from("vehicles")
        .update({
          kilometrage: input.kilometrage,
          last_odometer_value: input.kilometrage,
          last_odometer_date: input.lastOdometerDate,
          updated_at: input.updatedAt
        } as never)
        .eq("id", input.vehicleId)
        .eq("user_id", input.userId)
        .select("*")
        .maybeSingle();
      if (error) {
        throw new Error(error.message);
      }
      return (data as Vehicle | null) ?? null;
    },
    loadPlanEntries: async (userId, id) => {
      const { data, error } = await supabase
        .from("maintenance_plan_entries")
        .select("*")
        .eq("vehicle_id", id)
        .eq("user_id", userId);
      if (error) {
        throw new Error(error.message);
      }
      return (data ?? []) as MaintenancePlanEntry[];
    },
    notificationDeps: createAdminNotificationDeps(admin, { pushUserId: user.id }),
    onNotificationError: (reason) => {
      console.error("[odometer] notification pipeline failed", { vehicleId, reason });
    }
  });

  if (!result.ok) {
    const status = result.reason === "not_found" ? 404 : 500;
    return NextResponse.json(
      {
        ok: false,
        error: result.reason === "not_found" ? "Véhicule introuvable." : "Mise à jour impossible."
      },
      { status }
    );
  }

  return NextResponse.json({
    ok: true,
    kilometrage: result.kilometrage
  });
}
