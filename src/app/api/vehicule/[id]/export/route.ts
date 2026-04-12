import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function normalizeStoragePath(input: string | null) {
  if (!input) return null;
  if (!input.startsWith("http")) return input;

  const marker = "/storage/v1/object/ridecloud-files/";
  const index = input.indexOf(marker);
  if (index === -1) return null;

  const pathWithQuery = input.slice(index + marker.length);
  return pathWithQuery.split("?")[0] ?? null;
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (vehicleError || !vehicle) {
    return NextResponse.json({ error: "Véhicule introuvable" }, { status: 404 });
  }
  const vehicleRow = vehicle as {
    id: string;
    [key: string]: unknown;
  };

  const [maintenanceRes, upcomingRes, modificationsRes, documentsRes] = await Promise.all([
    supabase
      .from("maintenance_entries")
      .select("*")
      .eq("vehicle_id", id)
      .eq("user_id", user.id)
      .order("date_entretien", { ascending: false }),
    supabase
      .from("upcoming_maintenance")
      .select("*")
      .eq("vehicle_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("modifications")
      .select("*")
      .eq("vehicle_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("documents")
      .select("*")
      .eq("vehicle_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
  ]);
  const documentsRows = (documentsRes.data ?? []) as Array<{
    id: string;
    nom_fichier: string;
    type_fichier: string;
    url: string;
    taille: number | null;
  }>;

  const documentsFiles = await Promise.all(
    documentsRows.map(async (document) => {
      const storagePath = normalizeStoragePath(document.url);
      if (!storagePath || storagePath === "#") {
        return null;
      }

      const { data, error } = await supabase.storage.from("ridecloud-files").download(storagePath);
      if (error || !data) {
        return null;
      }

      const arrayBuffer = await data.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i += 1) {
        binary += String.fromCharCode(bytes[i]);
      }

      return {
        source_document_id: document.id,
        file_name: document.nom_fichier,
        mime_type: data.type || document.type_fichier || "application/octet-stream",
        size: data.size || document.taille || bytes.byteLength,
        base64: btoa(binary)
      };
    })
  );

  const payload = {
    app: "RideCloud",
    format_version: 1,
    exported_at: new Date().toISOString(),
    vehicle: vehicleRow,
    maintenance_entries: maintenanceRes.data ?? [],
    upcoming_maintenance: upcomingRes.data ?? [],
    modifications: modificationsRes.data ?? [],
    documents: documentsRows,
    documents_files: documentsFiles.filter(Boolean)
  };

  const fileName = `ridecloud-vehicule-${vehicleRow.id}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`
    }
  });
}
