"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { calculateNextMaintenanceDue, getMaintenanceStatus } from "@/lib/maintenance";
import { formatDateFr } from "@/lib/utils/date";
import { toast } from "sonner";
import type { MaintenancePlanEntry } from "@/types/database";

type FormState = {
  date_entretien: string;
  kilometrage: string;
  cout: string;
  description: string;
};

function getStatusBadge(status: MaintenancePlanEntry["status"]) {
  if (status === "overdue") return { label: "En retard", variant: "danger" as const };
  if (status === "due_soon") return { label: "Bientôt dû", variant: "warning" as const };
  if (status === "done") return { label: "À jour", variant: "success" as const };
  return { label: "À venir", variant: "secondary" as const };
}

export function MaintenancePlanList({
  vehicleId,
  currentKm,
  items
}: {
  vehicleId: string;
  currentKm: number;
  items: MaintenancePlanEntry[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    date_entretien: new Date().toISOString().slice(0, 10),
    kilometrage: currentKm.toString(),
    cout: "",
    description: ""
  });

  const submitDone = async (entry: MaintenancePlanEntry) => {
    if (!form.date_entretien || !form.kilometrage) {
      toast.error("Date et kilométrage sont obligatoires.");
      return;
    }

    try {
      setLoading(true);
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      const doneKm = Number(form.kilometrage);
      const doneDate = form.date_entretien;

      const { error: insertError } = await supabase.from("maintenance_entries").insert({
        user_id: user.id,
        vehicle_id: vehicleId,
        titre: entry.titre,
        date_entretien: doneDate,
        kilometrage: doneKm,
        cout: form.cout ? Number(form.cout) : null,
        description: form.description || null,
        maintenance_plan_entry_id: entry.id
      } as never);
      if (insertError) {
        toast.error(`Erreur insertion historique : ${insertError.message}`);
        return;
      }

      const due = calculateNextMaintenanceDue({
        intervalKm: entry.interval_km,
        intervalMonths: entry.interval_months,
        firstDueKm: entry.first_due_km,
        firstDueDate: entry.first_due_date,
        lastDoneKm: doneKm,
        lastDoneDate: doneDate
      });
      const status = getMaintenanceStatus({
        nextDueKm: due.nextDueKm,
        nextDueDate: due.nextDueDate,
        currentKm
      });

      const { error: updateError } = await supabase
        .from("maintenance_plan_entries")
        .update({
          last_done_km: doneKm,
          last_done_date: doneDate,
          next_due_km: due.nextDueKm,
          next_due_date: due.nextDueDate,
          status
        } as never)
        .eq("id", entry.id);

      if (updateError) {
        toast.error(`Historique ajouté, mais plan non mis à jour : ${updateError.message}`);
      } else {
        toast.success("Intervention enregistrée et plan mis à jour.");
      }

      setActiveEntryId(null);
      setForm({
        date_entretien: new Date().toISOString().slice(0, 10),
        kilometrage: currentKm.toString(),
        cout: "",
        description: ""
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-sky-200 bg-sky-50/40">
      <CardHeader>
        <CardTitle className="text-sky-700">Plan d&apos;entretien</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <p className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-600">
            Aucun plan disponible pour ce véhicule.
          </p>
        )}
        {items.map((item) => {
          const statusBadge = getStatusBadge(item.status);
          return (
            <div key={item.id} className="rounded-lg border border-sky-200 bg-white p-3">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="font-medium">{item.titre}</p>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                <Badge variant={item.source === "template" ? "secondary" : "outline"}>
                  {item.source === "template" ? "Template" : "Manuel"}
                </Badge>
                <Badge variant="outline">
                  {item.priority === "urgent" ? "Urgent" : item.priority === "important" ? "Important" : "Normal"}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">Catégorie : {item.categorie}</p>
              <p className="text-sm text-slate-600">
                Prochaine échéance km :{" "}
                {item.next_due_km != null ? `${item.next_due_km.toLocaleString("fr-FR")} km` : "non définie"}
              </p>
              <p className="text-sm text-slate-600">
                Prochaine échéance date : {item.next_due_date ? formatDateFr(item.next_due_date) : "non définie"}
              </p>
              {item.description && <p className="mt-1 text-sm text-slate-600">{item.description}</p>}

              <div className="mt-2">
                {activeEntryId === item.id ? (
                  <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Input
                        type="date"
                        value={form.date_entretien}
                        onChange={(e) => setForm((state) => ({ ...state, date_entretien: e.target.value }))}
                      />
                      <Input
                        type="number"
                        placeholder="Kilométrage"
                        value={form.kilometrage}
                        onChange={(e) => setForm((state) => ({ ...state, kilometrage: e.target.value }))}
                      />
                    </div>
                    <Input
                      type="number"
                      placeholder="Coût (optionnel)"
                      value={form.cout}
                      onChange={(e) => setForm((state) => ({ ...state, cout: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Note (optionnel)"
                      value={form.description}
                      onChange={(e) => setForm((state) => ({ ...state, description: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <Button disabled={loading} onClick={() => submitDone(item)}>
                        {loading ? "Enregistrement..." : "Valider l'intervention"}
                      </Button>
                      <Button variant="ghost" onClick={() => setActiveEntryId(null)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setActiveEntryId(item.id)}>
                    Marquer comme effectué
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
