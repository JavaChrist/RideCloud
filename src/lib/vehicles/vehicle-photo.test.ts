import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import {
  VEHICLE_PHOTO_BUCKET,
  VEHICLE_PHOTO_MAX_BYTES,
  buildVehiclePhotoPath,
  uploadVehiclePhoto,
  validateVehiclePhotoFile
} from "./vehicle-photo";

function fakeFile(name: string, type: string, size = 1024): File {
  const bytes = new Uint8Array(size);
  return new File([bytes], name, { type });
}

describe("validateVehiclePhotoFile", () => {
  it("accepte une image valide", () => {
    expect(validateVehiclePhotoFile(fakeFile("moto.jpg", "image/jpeg"))).toBeNull();
  });

  it("rejette un fichier non image", () => {
    expect(validateVehiclePhotoFile(fakeFile("dossier.json", "application/json"))).toBe(
      "Le fichier doit être une image valide."
    );
  });

  it("rejette une photo trop lourde", () => {
    expect(
      validateVehiclePhotoFile(fakeFile("grosse.png", "image/png", VEHICLE_PHOTO_MAX_BYTES + 1))
    ).toBe("La photo est trop lourde (max 8 Mo).");
  });
});

describe("buildVehiclePhotoPath", () => {
  it("suit la convention userId/vehicleId.ext dans le bucket RideCloud", () => {
    expect(VEHICLE_PHOTO_BUCKET).toBe("ridecloud-files");
    expect(
      buildVehiclePhotoPath("user-1", "veh-9", fakeFile("photo.WEBP", "image/webp"))
    ).toBe("user-1/veh-9.webp");
  });

  it("neutralise une extension non alphanumérique", () => {
    expect(buildVehiclePhotoPath("u", "v", fakeFile("x.", "image/jpeg"))).toBe("u/v.jpg");
  });
});

function mockSupabase(options: {
  uploadError?: { message: string } | null;
  updateError?: { message: string } | null;
}) {
  const upload = vi.fn().mockResolvedValue({ error: options.uploadError ?? null });
  const eqUser = vi.fn().mockResolvedValue({ error: options.updateError ?? null });
  const eqId = vi.fn().mockReturnValue({ eq: eqUser });
  const update = vi.fn().mockReturnValue({ eq: eqId });
  const fromTable = vi.fn().mockReturnValue({ update });
  const fromStorage = vi.fn().mockReturnValue({ upload });

  const supabase = {
    storage: { from: fromStorage },
    from: fromTable
  } as unknown as SupabaseClient;

  return { supabase, upload, fromStorage, fromTable, update };
}

describe("uploadVehiclePhoto", () => {
  it("bloque avant Storage si le fichier n'est pas une image", async () => {
    const { supabase, upload } = mockSupabase({});
    const result = await uploadVehiclePhoto({
      supabase,
      userId: "user-1",
      vehicleId: "veh-1",
      file: fakeFile("notes.json", "application/json")
    });
    expect(result).toEqual({
      ok: false,
      error: "Le fichier doit être une image valide.",
      stage: "validation"
    });
    expect(upload).not.toHaveBeenCalled();
  });

  it("uploade avec upsert puis met à jour photo_url", async () => {
    const { supabase, upload, fromStorage, fromTable, update } = mockSupabase({});
    const file = fakeFile("moto.jpg", "image/jpeg");
    const result = await uploadVehiclePhoto({
      supabase,
      userId: "user-1",
      vehicleId: "veh-9",
      file
    });

    expect(result).toEqual({ ok: true, photoPath: "user-1/veh-9.jpg" });
    expect(fromStorage).toHaveBeenCalledWith("ridecloud-files");
    expect(upload).toHaveBeenCalledWith("user-1/veh-9.jpg", file, { upsert: true });
    expect(fromTable).toHaveBeenCalledWith("vehicles");
    expect(update).toHaveBeenCalledWith({ photo_url: "user-1/veh-9.jpg" });
  });

  it("signale une erreur d'upload sans tenter l'update", async () => {
    const { supabase, fromTable } = mockSupabase({ uploadError: { message: "quota" } });
    const result = await uploadVehiclePhoto({
      supabase,
      userId: "user-1",
      vehicleId: "veh-9",
      file: fakeFile("moto.jpg", "image/jpeg")
    });
    expect(result).toEqual({ ok: false, error: "quota", stage: "upload" });
    expect(fromTable).not.toHaveBeenCalled();
  });

  it("signale une erreur d'update si Storage a réussi", async () => {
    const { supabase } = mockSupabase({ updateError: { message: "rls" } });
    const result = await uploadVehiclePhoto({
      supabase,
      userId: "user-1",
      vehicleId: "veh-9",
      file: fakeFile("moto.jpg", "image/jpeg")
    });
    expect(result).toEqual({
      ok: false,
      error: "Photo envoyée, mais lien non enregistré sur le véhicule.",
      stage: "update"
    });
  });
});
