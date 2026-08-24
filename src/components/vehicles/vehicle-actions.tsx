"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Download, FileJson, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/providers/confirm-provider";
import { createClient } from "@/lib/supabase/client";
import { handleVehicleExportClick } from "@/lib/export/distribute-file";
import { isCapacitorNative } from "@/lib/pwa/environment";

interface VehicleActionsProps {
  vehicleId: string;
  vehicleName: string;
}

function normalizeStoragePath(input: string | null) {
  if (!input) return null;
  if (!input.startsWith("http")) return input;
  const marker = "/storage/v1/object/ridecloud-files/";
  const index = input.indexOf(marker);
  if (index === -1) return null;
  const pathWithQuery = input.slice(index + marker.length);
  return pathWithQuery.split("?")[0] ?? null;
}

export function VehicleActions({ vehicleId, vehicleName }: VehicleActionsProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const [exporting, setExporting] = useState<"json" | "zip" | null>(null);

  const onExportClick = async (
    event: React.MouseEvent<HTMLAnchorElement>,
    kind: "json" | "zip",
    href: string,
    fallbackFileName: string
  ) => {
    if (exporting) {
      event.preventDefault();
      return;
    }

    const native = isCapacitorNative();
    if (native) {
      event.preventDefault();
      setExporting(kind);
    }

    try {
      await handleVehicleExportClick({
        event,
        href,
        fallbackFileName,
        isNative: native
      });
    } catch {
      toast.error("Impossible d'exporter le fichier.");
    } finally {
      if (native) setExporting(null);
    }
  };

  const deleteVehicle = async () => {
    const confirmed = await confirm({
      title: `Supprimer ${vehicleName} ?`,
      description:
        "Cette action est irréversible. Le véhicule, son historique d'entretien, ses modifications, ses documents et ses photos seront définitivement effacés.",
      confirmText: "Supprimer définitivement",
      cancelText: "Annuler",
      variant: "danger"
    });
    if (!confirmed) return;

    try {
      const supabase = createClient();
      const [
        { data: vehicleRow },
        { data: documentsRows }
      ] = await Promise.all([
        supabase.from("vehicles").select("photo_url").eq("id", vehicleId).maybeSingle(),
        supabase.from("documents").select("url").eq("vehicle_id", vehicleId)
      ]);

      const filePaths = [
        normalizeStoragePath((vehicleRow as { photo_url?: string | null } | null)?.photo_url ?? null),
        ...((documentsRows as Array<{ url: string }> | null) ?? []).map((document) => normalizeStoragePath(document.url))
      ].filter((path): path is string => Boolean(path && path !== "#"));

      if (filePaths.length > 0) {
        await supabase.storage.from("ridecloud-files").remove(filePaths);
      }

      const { error } = await supabase.from("vehicles").delete().eq("id", vehicleId);
      if (error) {
        toast.error(`Erreur suppression: ${error.message}`);
        return;
      }

      toast.success("Véhicule supprimé avec succès.");
      router.push("/categories");
      router.refresh();
    } catch {
      toast.error("Impossible de supprimer le véhicule.");
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <Button asChild variant="outline">
        <a
          href={`/api/vehicule/${vehicleId}/export`}
          aria-busy={exporting === "json"}
          onClick={(event) =>
            void onExportClick(
              event,
              "json",
              `/api/vehicule/${vehicleId}/export`,
              `ridecloud-vehicule-${vehicleId}.json`
            )
          }
        >
          <FileJson className="mr-2 h-4 w-4" />
          Exporter JSON
        </a>
      </Button>
      <Button asChild>
        <a
          href={`/api/vehicule/${vehicleId}/export-zip`}
          aria-busy={exporting === "zip"}
          onClick={(event) =>
            void onExportClick(
              event,
              "zip",
              `/api/vehicule/${vehicleId}/export-zip`,
              `ridecloud-dossier-${vehicleId}.zip`
            )
          }
        >
          <Archive className="mr-2 h-4 w-4" />
          Export ZIP complet
        </a>
      </Button>
      <Button asChild variant="outline">
        <Link href={`/vehicule/${vehicleId}/export`}>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Link>
      </Button>
      <Button variant="destructive" onClick={deleteVehicle}>
        <Trash2 className="mr-2 h-4 w-4" />
        Supprimer le véhicule
      </Button>
    </div>
  );
}
