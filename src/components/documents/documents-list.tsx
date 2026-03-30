 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { formatDateFr } from "@/lib/utils/date";
import { toast } from "sonner";
import type { DocumentItem } from "@/types/database";

export function DocumentsList({ vehicleId, items }: { vehicleId: string; items: DocumentItem[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const isUuidVehicle = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(vehicleId);

  const uploadDocument = async () => {
    if (!isUuidVehicle) {
      toast.error("Ajout impossible sur véhicule démo. Créez d'abord un véhicule réel.");
      return;
    }
    if (!selectedFile) return;
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      const extension = selectedFile.name.split(".").pop()?.toLowerCase() ?? "bin";
      const safeExt = extension.replace(/[^a-z0-9]/g, "") || "bin";
      const storagePath = `${user.id}/${vehicleId}/documents/${crypto.randomUUID()}.${safeExt}`;

      const { error: uploadError } = await supabase.storage.from("ridecloud-files").upload(storagePath, selectedFile, {
        upsert: false
      });
      if (uploadError) {
        toast.error(`Erreur upload document: ${uploadError.message}`);
        return;
      }

      const payload = {
        user_id: user.id,
        vehicle_id: vehicleId,
        nom_fichier: selectedFile.name,
        type_fichier: selectedFile.type || safeExt.toUpperCase(),
        url: storagePath,
        taille: selectedFile.size
      };
      const { error } = await supabase.from("documents").insert(payload as never);
      if (error) {
        toast.error(`Erreur ajout document: ${error.message}`);
        return;
      }

      setSelectedFile(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    if (!isUuidVehicle) return;
    const supabase = createClient();
    const { data: row } = await supabase.from("documents").select("url").eq("id", id).maybeSingle();
    const documentRow = row as { url: string } | null;
    if (documentRow?.url && !documentRow.url.startsWith("http")) {
      await supabase.storage.from("ridecloud-files").remove([documentRow.url]);
    }

    await supabase.from("documents").delete().eq("id", id);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {!isUuidVehicle && (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800">
            Véhicule de démonstration : les actions CRUD sont désactivées.
          </p>
        )}
        <div className="space-y-2 rounded-lg border bg-white p-3">
          <Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
          <Button onClick={uploadDocument} disabled={loading || !selectedFile || !isUuidVehicle} className="w-full">
            {loading ? "Envoi..." : "Ajouter un document"}
          </Button>
        </div>

        {items.length === 0 && <p className="text-sm text-muted-foreground">Aucun document disponible.</p>}
        {items.map((doc) => (
          <div key={doc.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2"><FileText className="h-5 w-5 text-slate-600" /></div>
              <div>
                <p className="font-medium">{doc.nom_fichier}</p>
                <p className="text-sm text-slate-600">Type : {doc.type_fichier} - Ajouté le {formatDateFr(doc.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={doc.url} target="_blank" rel="noreferrer"><Download className="mr-2 h-4 w-4" />Ouvrir</a>
              </Button>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteDocument(doc.id)}>
                Supprimer
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
