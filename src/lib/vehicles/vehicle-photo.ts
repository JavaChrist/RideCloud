import type { SupabaseClient } from "@supabase/supabase-js";

export const VEHICLE_PHOTO_BUCKET = "ridecloud-files";
export const VEHICLE_PHOTO_MAX_BYTES = 8 * 1024 * 1024;

export function validateVehiclePhotoFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Le fichier doit être une image valide.";
  }
  if (file.size > VEHICLE_PHOTO_MAX_BYTES) {
    return "La photo est trop lourde (max 8 Mo).";
  }
  return null;
}

export function buildVehiclePhotoPath(userId: string, vehicleId: string, file: File): string {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
  return `${userId}/${vehicleId}.${safeExtension}`;
}

export type VehiclePhotoUploadResult =
  | { ok: true; photoPath: string }
  | { ok: false; error: string; stage: "validation" | "upload" | "update" };

export async function uploadVehiclePhoto(input: {
  supabase: SupabaseClient;
  userId: string;
  vehicleId: string;
  file: File;
}): Promise<VehiclePhotoUploadResult> {
  const validationError = validateVehiclePhotoFile(input.file);
  if (validationError) {
    return { ok: false, error: validationError, stage: "validation" };
  }

  const photoPath = buildVehiclePhotoPath(input.userId, input.vehicleId, input.file);
  const { error: uploadError } = await input.supabase.storage
    .from(VEHICLE_PHOTO_BUCKET)
    .upload(photoPath, input.file, { upsert: true });

  if (uploadError) {
    return { ok: false, error: uploadError.message, stage: "upload" };
  }

  const { error: updateError } = await input.supabase
    .from("vehicles")
    .update({ photo_url: photoPath } as never)
    .eq("id", input.vehicleId)
    .eq("user_id", input.userId);

  if (updateError) {
    return { ok: false, error: "Photo envoyée, mais lien non enregistré sur le véhicule.", stage: "update" };
  }

  return { ok: true, photoPath };
}
