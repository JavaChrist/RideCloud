"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_DUE_SOON_DAYS_THRESHOLD,
  DEFAULT_DUE_SOON_KM_THRESHOLD,
  calculateNextMaintenanceDue,
  getMaintenanceStatus
} from "@/lib/maintenance";
import { formatDateFr } from "@/lib/utils/date";
import { toast } from "sonner";
import type { MaintenanceEntry, MaintenancePlanEntry, UpcomingMaintenance } from "@/types/database";

function normalizeTitle(value: string) {
  return value.trim().toLowerCase();
}

export function HistorySections({
  vehicleId,
  completed,
  upcoming,
  planEntries,
  currentKm
}: {
  vehicleId: string;
  completed: MaintenanceEntry[];
  upcoming: UpcomingMaintenance[];
  planEntries: MaintenancePlanEntry[];
  currentKm: number;
}) {
  const router = useRouter();
  const [loadingDone, setLoadingDone] = useState(false);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [doneForm, setDoneForm] = useState({
    titre: "",
    date_entretien: "",
    kilometrage: "",
    cout: "",
    description: "",
    maintenance_plan_entry_id: ""
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

      let planEntryId: string | null = doneForm.maintenance_plan_entry_id || null;
      let autoLinked = false;
      if (!planEntryId && doneForm.titre.trim()) {
        const normalized = normalizeTitle(doneForm.titre);
        const matched = planEntries.find((entry) => normalizeTitle(entry.titre) === normalized);
        if (matched) {
          planEntryId = matched.id;
          autoLinked = true;
        }
      }

      const payload = {
        user_id: user.id,
        vehicle_id: vehicleId,
        titre: doneForm.titre,
        date_entretien: doneForm.date_entretien,
        kilometrage: Number(doneForm.kilometrage),
        cout: doneForm.cout ? Number(doneForm.cout) : null,
        description: doneForm.description || null,
        maintenance_plan_entry_id: planEntryId
      };
      const { error } = await supabase.from("maintenance_entries").insert(payload as never);
      if (error) {
        toast.error(`Erreur ajout historique: ${error.message}`);
        return;
      }

      if (!error && planEntryId) {
        const selectedPlan = planEntries.find((entry) => entry.id === planEntryId);
        if (selectedPlan) {
          const due = calculateNextMaintenanceDue({
            intervalKm: selectedPlan.interval_km,
            intervalMonths: selectedPlan.interval_months,
            firstDueKm: selectedPlan.first_due_km,
            firstDueDate: selectedPlan.first_due_date,
            lastDoneKm: Number(doneForm.kilometrage),
            lastDoneDate: doneForm.date_entretien
          });
          const status = getMaintenanceStatus({
            nextDueKm: due.nextDueKm,
            nextDueDate: due.nextDueDate,
            currentKm,
            dueSoonKmThreshold: selectedPlan.due_soon_km_threshold,
            dueSoonDaysThreshold: selectedPlan.due_soon_days_threshold,
            lastDoneKm: Number(doneForm.kilometrage),
            lastDoneDate: doneForm.date_entretien
          });
          await supabase
            .from("maintenance_plan_entries")
            .update({
              last_done_km: Number(doneForm.kilometrage),
              last_done_date: doneForm.date_entretien,
              next_due_km: due.nextDueKm,
              next_due_date: due.nextDueDate,
              status
            } as never)
            .eq("id", selectedPlan.id);

          if (autoLinked) {
            toast.success(
              `Entretien ajouté et lié automatiquement à "${selectedPlan.titre}" du plan.`
            );
          } else {
            toast.success("Entretien ajouté et plan mis à jour.");
          }
        }
      } else if (!error) {
        toast.success("Entretien ajouté dans l'historique.");
      }

      setDoneForm({
        titre: "",
        date_entretien: "",
        kilometrage: "",
        cout: "",
        description: "",
        maintenance_plan_entry_id: ""
      });
      router.refresh();
    } finally {
      setLoadingDone(false);
    }
  };

  const resyncPlanFromHistory = async () => {
    if (!isUuidVehicle) {
      toast.error("Synchronisation indisponible sur véhicule démo.");
      return;
    }
    if (planEntries.length === 0) {
      toast.info("Aucun plan d'entretien à synchroniser.");
      return;
    }
    if (completed.length === 0) {
      toast.info("Aucun entretien dans l'historique pour synchroniser.");
      return;
    }

    setSyncing(true);
    try {
      const supabase = createClient();
      let syncedPlans = 0;
      let relinkedEntries = 0;

      for (const plan of planEntries) {
        const normalized = normalizeTitle(plan.titre);
        const matches = completed.filter(
          (entry) =>
            entry.maintenance_plan_entry_id === plan.id ||
            normalizeTitle(entry.titre) === normalized
        );
        if (matches.length === 0) continue;

        const latest = [...matches].sort((a, b) => {
          const dateA = new Date(a.date_entretien).getTime();
          const dateB = new Date(b.date_entretien).getTime();
          if (dateB !== dateA) return dateB - dateA;
          return (b.kilometrage ?? 0) - (a.kilometrage ?? 0);
        })[0];

        const due = calculateNextMaintenanceDue({
          intervalKm: plan.interval_km,
          intervalMonths: plan.interval_months,
          firstDueKm: plan.first_due_km,
          firstDueDate: plan.first_due_date,
          lastDoneKm: latest.kilometrage,
          lastDoneDate: latest.date_entretien
        });
        const status = getMaintenanceStatus({
          nextDueKm: due.nextDueKm,
          nextDueDate: due.nextDueDate,
          currentKm,
          dueSoonKmThreshold: plan.due_soon_km_threshold,
          dueSoonDaysThreshold: plan.due_soon_days_threshold,
          lastDoneKm: latest.kilometrage,
          lastDoneDate: latest.date_entretien
        });

        const { error: planError } = await supabase
          .from("maintenance_plan_entries")
          .update({
            last_done_km: latest.kilometrage,
            last_done_date: latest.date_entretien,
            next_due_km: due.nextDueKm,
            next_due_date: due.nextDueDate,
            status,
            updated_at: new Date().toISOString()
          } as never)
          .eq("id", plan.id);

        if (planError) {
          console.error("[resync] plan update error", planError);
          continue;
        }
        syncedPlans += 1;

        const unlinkedIds = matches
          .filter((entry) => !entry.maintenance_plan_entry_id)
          .map((entry) => entry.id);
        if (unlinkedIds.length > 0) {
          const { error: relinkError } = await supabase
            .from("maintenance_entries")
            .update({ maintenance_plan_entry_id: plan.id } as never)
            .in("id", unlinkedIds);
          if (!relinkError) {
            relinkedEntries += unlinkedIds.length;
          }
        }
      }

      if (syncedPlans > 0) {
        toast.success(
          `${syncedPlans} tâche(s) du plan synchronisée(s)${
            relinkedEntries > 0 ? ` · ${relinkedEntries} entrée(s) rattachée(s)` : ""
          }.`
        );
        router.refresh();
      } else {
        toast.info(
          "Aucune correspondance trouvée. Vérifiez que les titres de l'historique correspondent à ceux du plan."
        );
      }
    } catch (err) {
      console.error("[resync] failure", err);
      toast.error("Erreur lors de la synchronisation.");
    } finally {
      setSyncing(false);
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
        description: upcomingForm.description || null,
        source: "manual" as const
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

  const generatedUpcoming = planEntries
    .filter((entry) => entry.status !== "done")
    .map((entry) => ({
      id: `plan-${entry.id}`,
      titre: entry.titre,
      categorie: entry.categorie,
      due_date: entry.next_due_date,
      due_km: entry.next_due_km,
      due_soon_km_threshold: entry.due_soon_km_threshold,
      due_soon_days_threshold: entry.due_soon_days_threshold,
      niveau_urgence: entry.priority === "urgent" ? "urgent" : "normal",
      description: entry.description,
      source: "template" as const
    }));

  const unifiedUpcoming = useMemo(() => {
    const rawItems = [
      ...upcoming.map((item) => ({
        ...item,
        source: item.source ?? "manual",
        categorie: "",
        due_soon_km_threshold: DEFAULT_DUE_SOON_KM_THRESHOLD,
        due_soon_days_threshold: DEFAULT_DUE_SOON_DAYS_THRESHOLD
      })),
      ...generatedUpcoming
    ];

    const deduped = new Map<string, (typeof rawItems)[number]>();
    for (const item of rawItems) {
      const key = `${item.source}::${item.categorie}::${item.titre}`.toLowerCase();
      if (!deduped.has(key)) {
        deduped.set(key, item);
      }
    }

    const statusRank = (item: (typeof rawItems)[number]) => {
      const kmDiff = item.due_km != null ? item.due_km - currentKm : Number.POSITIVE_INFINITY;
      const dayDiff = item.due_date ? differenceInCalendarDays(parseISO(item.due_date), new Date()) : Number.POSITIVE_INFINITY;
      const dueSoonKmThreshold = item.due_soon_km_threshold ?? DEFAULT_DUE_SOON_KM_THRESHOLD;
      const dueSoonDaysThreshold = item.due_soon_days_threshold ?? DEFAULT_DUE_SOON_DAYS_THRESHOLD;
      if (kmDiff < 0 || dayDiff < 0) return 0;
      if (kmDiff <= dueSoonKmThreshold || dayDiff <= dueSoonDaysThreshold) return 1;
      return 2;
    };

    return Array.from(deduped.values()).sort((a, b) => {
      const rankDiff = statusRank(a) - statusRank(b);
      if (rankDiff !== 0) return rankDiff;
      const kmA = a.due_km != null ? a.due_km - currentKm : Number.POSITIVE_INFINITY;
      const kmB = b.due_km != null ? b.due_km - currentKm : Number.POSITIVE_INFINITY;
      if (kmA !== kmB) return kmA - kmB;
      const dayA = a.due_date ? differenceInCalendarDays(parseISO(a.due_date), new Date()) : Number.POSITIVE_INFINITY;
      const dayB = b.due_date ? differenceInCalendarDays(parseISO(b.due_date), new Date()) : Number.POSITIVE_INFINITY;
      if (dayA !== dayB) return dayA - dayB;
      return a.titre.localeCompare(b.titre, "fr");
    });
  }, [upcoming, generatedUpcoming, currentKm]);

  const hasUnlinkedHistory =
    isUuidVehicle &&
    planEntries.length > 0 &&
    completed.some(
      (entry) =>
        !entry.maintenance_plan_entry_id &&
        planEntries.some((plan) => normalizeTitle(plan.titre) === normalizeTitle(entry.titre))
    );

  return (
    <div className="space-y-4">
      {hasUnlinkedHistory && (
        <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 p-4 shadow-ride-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
              <RefreshCw className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                Des entretiens passés ne sont pas liés au plan
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Synchronisez votre historique pour mettre à jour les rappels et les prochaines échéances.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={resyncPlanFromHistory}
            disabled={syncing}
            className="gap-2 bg-blue-700 text-white hover:bg-blue-800"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} strokeWidth={2.25} />
            {syncing ? "Synchronisation…" : "Synchroniser le plan"}
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/40">
        <CardHeader><CardTitle className="text-emerald-700 dark:text-emerald-300">Déjà effectué</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {!isUuidVehicle && (
            <p className="rounded-md border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-2 text-sm text-amber-800 dark:text-amber-300">
              Véhicule de démonstration : les actions CRUD sont désactivées. Créez un véhicule réel pour modifier les données.
            </p>
          )}
          <div className="space-y-2 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 p-3">
            <Input placeholder="Titre (ex: Vidange moteur)" value={doneForm.titre} onChange={(e) => setDoneForm((s) => ({ ...s, titre: e.target.value }))} />
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={doneForm.maintenance_plan_entry_id}
              onChange={(e) => setDoneForm((s) => ({ ...s, maintenance_plan_entry_id: e.target.value }))}
            >
              <option value="">Auto · détection par titre (recommandé)</option>
              {planEntries.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.titre}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input type="date" value={doneForm.date_entretien} onChange={(e) => setDoneForm((s) => ({ ...s, date_entretien: e.target.value }))} />
              <Input type="number" placeholder="Kilométrage" value={doneForm.kilometrage} onChange={(e) => setDoneForm((s) => ({ ...s, kilometrage: e.target.value }))} />
            </div>
            <Input type="number" placeholder="Coût (optionnel)" value={doneForm.cout} onChange={(e) => setDoneForm((s) => ({ ...s, cout: e.target.value }))} />
            <Textarea placeholder="Description (optionnel)" value={doneForm.description} onChange={(e) => setDoneForm((s) => ({ ...s, description: e.target.value }))} />
            <Button onClick={createCompleted} disabled={loadingDone || !isUuidVehicle} className="w-full">{loadingDone ? "Ajout..." : "Ajouter dans déjà effectué"}</Button>
          </div>

          {completed.length === 0 && <p className="text-sm text-muted-foreground">Aucune opération enregistrée.</p>}
          {completed.map((item) => (
            <div key={item.id} className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 p-3">
              <p className="font-medium">{item.titre}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Date : {formatDateFr(item.date_entretien)} - {item.kilometrage.toLocaleString("fr-FR")} km</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Coût : {item.cout ? `${item.cout} €` : "Non renseigné"}</p>
              {item.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>}
              <Button variant="ghost" size="sm" className="mt-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" onClick={() => deleteCompleted(item.id)}>
                Supprimer
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/40">
        <CardHeader><CardTitle className="text-amber-700 dark:text-amber-300">À prévoir</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 rounded-lg border border-amber-200 dark:border-amber-900 bg-white dark:bg-slate-900 p-3">
            <Input placeholder="Titre (ex: Contrôle pneus)" value={upcomingForm.titre} onChange={(e) => setUpcomingForm((s) => ({ ...s, titre: e.target.value }))} />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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

          {unifiedUpcoming.length === 0 && <p className="text-sm text-muted-foreground">Aucune échéance à prévoir.</p>}
          {unifiedUpcoming.map((item) => (
            <div key={item.id} className="rounded-lg border border-amber-200 dark:border-amber-900 bg-white dark:bg-slate-900 p-3">
              <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
                <p className="min-w-0 flex-1 font-medium leading-tight">{item.titre}</p>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge
                    variant={item.niveau_urgence === "urgent" ? "danger" : "warning"}
                    className="whitespace-nowrap"
                  >
                    {item.niveau_urgence === "urgent" ? "Urgent" : "À anticiper"}
                  </Badge>
                  <Badge
                    variant={item.source === "template" ? "secondary" : "outline"}
                    className="whitespace-nowrap"
                  >
                    {item.source === "template" ? "Automatique" : "Manuel"}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{item.due_km ? `Échéance à ${item.due_km.toLocaleString("fr-FR")} km` : "Kilométrage non défini"}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{item.due_date ? `Date cible : ${formatDateFr(item.due_date)}` : "Date non définie"}</p>
              {item.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>}
              {item.source !== "template" && (
                <Button variant="ghost" size="sm" className="mt-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" onClick={() => deleteUpcoming(item.id)}>
                  Supprimer
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
