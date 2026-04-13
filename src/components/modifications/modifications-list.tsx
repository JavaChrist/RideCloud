 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { formatDateFr } from "@/lib/utils/date";
import { toast } from "sonner";
import type { Modification } from "@/types/database";

export function ModificationsList({ vehicleId, items }: { vehicleId: string; items: Modification[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [factureFile, setFactureFile] = useState<File | null>(null);
  const [editFactureFile, setEditFactureFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    titre: "",
    marque: "",
    modele: "",
    date_pose: "",
    cout: ""
  });
  const [editForm, setEditForm] = useState({
    titre: "",
    marque: "",
    modele: "",
    date_pose: "",
    cout: ""
  });
  const isUuidVehicle = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(vehicleId);

  const createModification = async () => {
    if (!isUuidVehicle) {
      toast.error("Ajout impossible sur véhicule démo. Créez d'abord un véhicule réel.");
      return;
    }
    if (!form.titre) return;
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      let facturePath: string | null = null;
      if (factureFile) {
        const ext = factureFile.name.split(".").pop()?.toLowerCase() ?? "pdf";
        const safeExt = ext.replace(/[^a-z0-9]/g, "") || "pdf";
        facturePath = `${user.id}/${vehicleId}/factures/${crypto.randomUUID()}.${safeExt}`;
        const { error: uploadError } = await supabase.storage.from("ridecloud-files").upload(facturePath, factureFile, {
          upsert: false
        });
        if (uploadError) {
          facturePath = null;
        }
      }

      const payload = {
        user_id: user.id,
        vehicle_id: vehicleId,
        titre: form.titre,
        marque: form.marque || null,
        modele: form.modele || null,
        date_pose: form.date_pose || null,
        cout: form.cout ? Number(form.cout) : null,
        facture_url: facturePath
      };
      const { error } = await supabase.from("modifications").insert(payload as never);
      if (error) {
        toast.error(`Erreur ajout modification: ${error.message}`);
        return;
      }

      setForm({ titre: "", marque: "", modele: "", date_pose: "", cout: "" });
      setFactureFile(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const deleteModification = async (id: string) => {
    if (!isUuidVehicle) return;
    const supabase = createClient();
    await supabase.from("modifications").delete().eq("id", id);
    router.refresh();
  };

  const startEditing = (item: Modification) => {
    setEditingId(item.id);
    setEditFactureFile(null);
    setEditForm({
      titre: item.titre,
      marque: item.marque ?? "",
      modele: item.modele ?? "",
      date_pose: item.date_pose ?? "",
      cout: item.cout != null ? String(item.cout) : ""
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFactureFile(null);
  };

  const updateModification = async (id: string) => {
    if (!isUuidVehicle) return;
    if (!editForm.titre.trim()) {
      toast.error("Le titre est requis.");
      return;
    }

    try {
      setSavingEdit(true);
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      let facturePath: string | null | undefined = undefined;
      if (editFactureFile) {
        const ext = editFactureFile.name.split(".").pop()?.toLowerCase() ?? "pdf";
        const safeExt = ext.replace(/[^a-z0-9]/g, "") || "pdf";
        facturePath = `${user.id}/${vehicleId}/factures/${crypto.randomUUID()}.${safeExt}`;
        const { error: uploadError } = await supabase.storage.from("ridecloud-files").upload(facturePath, editFactureFile, {
          upsert: false
        });
        if (uploadError) {
          toast.error(`Upload facture impossible: ${uploadError.message}`);
          return;
        }
      }

      const payload = {
        titre: editForm.titre.trim(),
        marque: editForm.marque || null,
        modele: editForm.modele || null,
        date_pose: editForm.date_pose || null,
        cout: editForm.cout ? Number(editForm.cout) : null,
        ...(facturePath !== undefined ? { facture_url: facturePath } : {})
      };

      const { error } = await supabase.from("modifications").update(payload as never).eq("id", id);
      if (error) {
        toast.error(`Erreur modification: ${error.message}`);
        return;
      }

      toast.success("Modification mise à jour.");
      cancelEditing();
      router.refresh();
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-indigo-600" />Modifications</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {!isUuidVehicle && (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800">
            Véhicule de démonstration : les actions CRUD sont désactivées.
          </p>
        )}
        <div className="space-y-2 rounded-lg border bg-white p-3">
          <Input placeholder="Titre (ex: Support téléphone)" value={form.titre} onChange={(e) => setForm((s) => ({ ...s, titre: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Marque" value={form.marque} onChange={(e) => setForm((s) => ({ ...s, marque: e.target.value }))} />
            <Input placeholder="Modèle" value={form.modele} onChange={(e) => setForm((s) => ({ ...s, modele: e.target.value }))} />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input type="date" value={form.date_pose} onChange={(e) => setForm((s) => ({ ...s, date_pose: e.target.value }))} />
            <Input type="number" placeholder="Coût" value={form.cout} onChange={(e) => setForm((s) => ({ ...s, cout: e.target.value }))} />
          </div>
          <Input type="file" onChange={(e) => setFactureFile(e.target.files?.[0] ?? null)} />
          <Button onClick={createModification} disabled={loading || !isUuidVehicle} className="w-full">{loading ? "Ajout..." : "Ajouter une modification"}</Button>
        </div>

        {items.length === 0 && <p className="text-sm text-muted-foreground">Aucune modification enregistrée.</p>}
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border p-3">
            {editingId === item.id ? (
              <div className="space-y-2">
                <Input
                  placeholder="Titre"
                  value={editForm.titre}
                  onChange={(e) => setEditForm((s) => ({ ...s, titre: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Marque"
                    value={editForm.marque}
                    onChange={(e) => setEditForm((s) => ({ ...s, marque: e.target.value }))}
                  />
                  <Input
                    placeholder="Modèle"
                    value={editForm.modele}
                    onChange={(e) => setEditForm((s) => ({ ...s, modele: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Input
                    type="date"
                    value={editForm.date_pose}
                    onChange={(e) => setEditForm((s) => ({ ...s, date_pose: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Coût"
                    value={editForm.cout}
                    onChange={(e) => setEditForm((s) => ({ ...s, cout: e.target.value }))}
                  />
                </div>
                <Input type="file" onChange={(e) => setEditFactureFile(e.target.files?.[0] ?? null)} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateModification(item.id)} disabled={savingEdit || !isUuidVehicle}>
                    {savingEdit ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="font-medium">{item.titre}</p>
                <p className="text-sm text-slate-600">Marque : {item.marque ?? "-"} - Modèle : {item.modele ?? "-"}</p>
                <p className="text-sm text-slate-600">Date de pose : {formatDateFr(item.date_pose)} - Coût : {item.cout ? `${item.cout} €` : "-"}</p>
                <p className="text-sm text-slate-600">
                  Facture :{" "}
                  {item.facture_url ? (
                    <a className="text-primary hover:underline" href={item.facture_url} target="_blank" rel="noreferrer">
                      Ouvrir
                    </a>
                  ) : (
                    "Non fournie"
                  )}
                </p>
                <div className="mt-1 flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => startEditing(item)} disabled={!isUuidVehicle}>
                    Modifier
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteModification(item.id)}>
                    Supprimer
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
