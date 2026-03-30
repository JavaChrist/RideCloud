 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { formatDateFr } from "@/lib/utils/date";
import { toast } from "sonner";
import type { MaintenanceEntry, UpcomingMaintenance } from "@/types/database";

export function HistorySections({
  vehicleId,
  completed,
  upcoming
}: {
  vehicleId: string;
  completed: MaintenanceEntry[];
  upcoming: UpcomingMaintenance[];
}) {
  const router = useRouter();
  const [loadingDone, setLoadingDone] = useState(false);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);

  const [doneForm, setDoneForm] = useState({
    titre: "",
    date_entretien: "",
    kilometrage: "",
    cout: "",
    description: ""
  });
  const [upcomingForm, setUpcomingForm] = useState({
    titre: "",
    due_date: "",
    due_km: "",
    niveau_urgence: "normal",
    description: ""
  });
  const isUuidVehicle = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(vehicleId);

  const createCompleted = async () => {
    if (!isUuidVehicle) {
      toast.error("Ajout impossible sur véhicule démo. Créez d'abord un véhicule réel.");
      return;
    }
    if (!doneForm.titre || !doneForm.date_entretien || !doneForm.kilometrage) return;
    try {
      setLoadingDone(true);
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      const payload = {
        user_id: user.id,
        vehicle_id: vehicleId,
        titre: doneForm.titre,
        date_entretien: doneForm.date_entretien,
        kilometrage: Number(doneForm.kilometrage),
        cout: doneForm.cout ? Number(doneForm.cout) : null,
        description: doneForm.description || null
      };
      const { error } = await supabase.from("maintenance_entries").insert(payload as never);
      if (error) {
        toast.error(`Erreur ajout historique: ${error.message}`);
        return;
      }

      setDoneForm({ titre: "", date_entretien: "", kilometrage: "", cout: "", description: "" });
      router.refresh();
    } finally {
      setLoadingDone(false);
    }
  };

  const createUpcoming = async () => {
    if (!isUuidVehicle) {
      toast.error("Ajout impossible sur véhicule démo. Créez d'abord un véhicule réel.");
      return;
    }
    if (!upcomingForm.titre) return;
    try {
      setLoadingUpcoming(true);
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      const payload = {
        user_id: user.id,
        vehicle_id: vehicleId,
        titre: upcomingForm.titre,
        due_date: upcomingForm.due_date || null,
        due_km: upcomingForm.due_km ? Number(upcomingForm.due_km) : null,
        niveau_urgence: upcomingForm.niveau_urgence as "normal" | "urgent",
        description: upcomingForm.description || null
      };
      const { error } = await supabase.from("upcoming_maintenance").insert(payload as never);
      if (error) {
        toast.error(`Erreur ajout échéance: ${error.message}`);
        return;
      }

      setUpcomingForm({ titre: "", due_date: "", due_km: "", niveau_urgence: "normal", description: "" });
      router.refresh();
    } finally {
      setLoadingUpcoming(false);
    }
  };

  const deleteCompleted = async (id: string) => {
    if (!isUuidVehicle) return;
    const supabase = createClient();
    await supabase.from("maintenance_entries").delete().eq("id", id);
    router.refresh();
  };

  const deleteUpcoming = async (id: string) => {
    if (!isUuidVehicle) return;
    const supabase = createClient();
    await supabase.from("upcoming_maintenance").delete().eq("id", id);
    router.refresh();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-emerald-200 bg-emerald-50/40">
        <CardHeader><CardTitle className="text-emerald-700">Déjà effectué</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {!isUuidVehicle && (
            <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800">
              Véhicule de démonstration : les actions CRUD sont désactivées. Créez un véhicule réel pour modifier les données.
            </p>
          )}
          <div className="space-y-2 rounded-lg border border-emerald-200 bg-white p-3">
            <Input placeholder="Titre (ex: Vidange moteur)" value={doneForm.titre} onChange={(e) => setDoneForm((s) => ({ ...s, titre: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={doneForm.date_entretien} onChange={(e) => setDoneForm((s) => ({ ...s, date_entretien: e.target.value }))} />
              <Input type="number" placeholder="Kilométrage" value={doneForm.kilometrage} onChange={(e) => setDoneForm((s) => ({ ...s, kilometrage: e.target.value }))} />
            </div>
            <Input type="number" placeholder="Coût (optionnel)" value={doneForm.cout} onChange={(e) => setDoneForm((s) => ({ ...s, cout: e.target.value }))} />
            <Textarea placeholder="Description (optionnel)" value={doneForm.description} onChange={(e) => setDoneForm((s) => ({ ...s, description: e.target.value }))} />
            <Button onClick={createCompleted} disabled={loadingDone || !isUuidVehicle} className="w-full">{loadingDone ? "Ajout..." : "Ajouter dans déjà effectué"}</Button>
          </div>

          {completed.length === 0 && <p className="text-sm text-muted-foreground">Aucune opération enregistrée.</p>}
          {completed.map((item) => (
            <div key={item.id} className="rounded-lg border border-emerald-200 bg-white p-3">
              <p className="font-medium">{item.titre}</p>
              <p className="text-sm text-slate-600">Date : {formatDateFr(item.date_entretien)} - {item.kilometrage.toLocaleString("fr-FR")} km</p>
              <p className="text-sm text-slate-600">Coût : {item.cout ? `${item.cout} €` : "Non renseigné"}</p>
              {item.description && <p className="mt-1 text-sm text-slate-600">{item.description}</p>}
              <Button variant="ghost" size="sm" className="mt-1 text-red-600 hover:text-red-700" onClick={() => deleteCompleted(item.id)}>
                Supprimer
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/40">
        <CardHeader><CardTitle className="text-amber-700">À prévoir</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 rounded-lg border border-amber-200 bg-white p-3">
            <Input placeholder="Titre (ex: Contrôle pneus)" value={upcomingForm.titre} onChange={(e) => setUpcomingForm((s) => ({ ...s, titre: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={upcomingForm.due_date} onChange={(e) => setUpcomingForm((s) => ({ ...s, due_date: e.target.value }))} />
              <Input type="number" placeholder="Échéance km" value={upcomingForm.due_km} onChange={(e) => setUpcomingForm((s) => ({ ...s, due_km: e.target.value }))} />
            </div>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={upcomingForm.niveau_urgence}
              onChange={(e) => setUpcomingForm((s) => ({ ...s, niveau_urgence: e.target.value }))}
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
            <Textarea placeholder="Description (optionnel)" value={upcomingForm.description} onChange={(e) => setUpcomingForm((s) => ({ ...s, description: e.target.value }))} />
            <Button onClick={createUpcoming} disabled={loadingUpcoming || !isUuidVehicle} className="w-full">{loadingUpcoming ? "Ajout..." : "Ajouter dans à prévoir"}</Button>
          </div>

          {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Aucune échéance à prévoir.</p>}
          {upcoming.map((item) => (
            <div key={item.id} className="rounded-lg border border-amber-200 bg-white p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="font-medium">{item.titre}</p>
                <Badge variant={item.niveau_urgence === "urgent" ? "danger" : "warning"}>{item.niveau_urgence === "urgent" ? "Urgent" : "À anticiper"}</Badge>
              </div>
              <p className="text-sm text-slate-600">{item.due_km ? `Échéance à ${item.due_km.toLocaleString("fr-FR")} km` : "Kilométrage non défini"}</p>
              <p className="text-sm text-slate-600">{item.due_date ? `Date cible : ${formatDateFr(item.due_date)}` : "Date non définie"}</p>
              {item.description && <p className="mt-1 text-sm text-slate-600">{item.description}</p>}
              <Button variant="ghost" size="sm" className="mt-1 text-red-600 hover:text-red-700" onClick={() => deleteUpcoming(item.id)}>
                Supprimer
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
