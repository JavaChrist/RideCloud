"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays, parseISO } from "date-fns";
import Link from "next/link";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
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
import { useConfirm } from "@/components/providers/confirm-provider";
import { toast } from "sonner";
import type { MaintenancePlanEntry } from "@/types/database";

type FormState = {
  date_entretien: string;
  kilometrage: string;
  cout: string;
  description: string;
};

type AlertFormState = {
  dueSoonKmThreshold: string;
  dueSoonDaysThreshold: string;
};

function getStatusBadge(status: MaintenancePlanEntry["status"]) {
  if (status === "overdue") return { label: "En retard", variant: "danger" as const };
  if (status === "due_soon") return { label: "Bientôt dû", variant: "warning" as const };
  if (status === "done") return { label: "À jour", variant: "success" as const };
  return { label: "À venir", variant: "secondary" as const };
}

const statusRank: Record<MaintenancePlanEntry["status"], number> = {
  overdue: 0,
  due_soon: 1,
  upcoming: 2,
  done: 3
};

function getMaintenanceSortScore(entry: MaintenancePlanEntry, currentKm: number, now: Date) {
  const kmDiff = entry.next_due_km != null ? entry.next_due_km - currentKm : Number.POSITIVE_INFINITY;
  const daysDiff = entry.next_due_date
    ? differenceInCalendarDays(parseISO(entry.next_due_date), now)
    : Number.POSITIVE_INFINITY;
  const kmThreshold = entry.due_soon_km_threshold || DEFAULT_DUE_SOON_KM_THRESHOLD;
  const daysThreshold = entry.due_soon_days_threshold || DEFAULT_DUE_SOON_DAYS_THRESHOLD;
  const kmEquivalentFromDays = Number.isFinite(daysDiff) ? daysDiff * (kmThreshold / daysThreshold) : Number.POSITIVE_INFINITY;
  return Math.min(kmDiff, kmEquivalentFromDays);
}

export function MaintenancePlanList({
  vehicleId,
  currentKm,
  items,
  maintenanceProfileName,
  canUseAi = false,
  userPlan = "free"
}: {
  vehicleId: string;
  currentKm: number;
  items: MaintenancePlanEntry[];
  maintenanceProfileName: string;
  canUseAi?: boolean;
  userPlan?: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const confirm = useConfirm();
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [activeAlertEntryId, setActiveAlertEntryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingAlert, setSavingAlert] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [markingCurrent, setMarkingCurrent] = useState(false);

  const isUuidVehicle = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    vehicleId
  );

  const hasAnyAiTemplate = items.some(
    (item) => item.template_source === "ai" || item.template_source === "approved"
  );
  const hasHardcodedTemplate = items.some((item) => item.template_source === "hardcoded");

  const generateWithAi = async (force = false) => {
    if (!canUseAi) {
      toast.error("Réservé aux abonnés Premium ou Family.");
      return;
    }
    if (!isUuidVehicle) {
      toast.error("Indisponible sur le véhicule de démonstration.");
      return;
    }

    const ok = await confirm({
      title: force ? "Régénérer le plan d'entretien ?" : "Générer un plan personnalisé ?",
      description: force
        ? "Les seuils et descriptions seront mis à jour via l'IA. Votre historique d'entretiens déjà effectués reste intact."
        : "L'IA va analyser votre véhicule et générer un plan d'entretien préventif personnalisé basé sur les recommandations constructeur.",
      confirmText: force ? "Régénérer" : "Générer le plan",
      cancelText: "Annuler",
      variant: "ai"
    });
    if (!ok) return;

    setGeneratingAi(true);
    try {
      const response = await fetch("/api/maintenance/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId, force })
      });
      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        details?: string[];
        upgradeUrl?: string;
        profileName?: string;
        templateCount?: number;
        inserted?: number;
        updated?: number;
        errors?: string[];
        aiCallMade?: boolean;
      };

      if (response.status === 402) {
        toast.error(result.error ?? "Abonnement requis.");
        return;
      }
      if (response.status === 409) {
        toast.info(result.error ?? "Plan constructeur déjà disponible.");
        return;
      }
      if (!response.ok || !result.ok) {
        const detail = result.details?.[0];
        toast.error(
          detail
            ? `${result.error ?? "Génération IA échouée"} · ${detail}`
            : result.error ?? "Génération IA échouée."
        );
        return;
      }

      const persisted = (result.inserted ?? 0) + (result.updated ?? 0);
      if (persisted === 0 && (result.templateCount ?? 0) > 0) {
        toast.error(
          "Génération réussie côté IA mais aucune tâche enregistrée en base. Vérifiez la migration template_source."
        );
        return;
      }

      toast.success(
        `${persisted} tâche(s) enregistrée(s) pour ${
          result.profileName ?? "ce véhicule"
        }${result.aiCallMade ? " (nouveau plan IA)" : " (depuis le cache)"}.`
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur réseau pendant la génération IA.");
    } finally {
      setGeneratingAi(false);
    }
  };

  const markAllAsCurrent = async () => {
    if (!isUuidVehicle) {
      toast.error("Indisponible sur le véhicule de démonstration.");
      return;
    }
    if (items.length === 0) {
      toast.info("Générez d'abord un plan d'entretien pour ce véhicule.");
      return;
    }

    const ok = await confirm({
      title: "Marquer toutes les révisions comme à jour ?",
      description: `Toutes les tâches récurrentes (vidange, filtres, courroies, etc.) seront enregistrées comme effectuées aujourd'hui au kilométrage actuel (${currentKm.toLocaleString(
        "fr-FR"
      )} km).\n\nUtile à l'ajout d'un véhicule d'occasion entretenu. Cette action n'écrase pas les entretiens déjà déclarés plus récents.`,
      confirmText: "Marquer comme à jour",
      cancelText: "Annuler",
      variant: "success"
    });
    if (!ok) return;

    setMarkingCurrent(true);
    try {
      const response = await fetch(
        `/api/vehicles/${vehicleId}/mark-maintenance-current`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        }
      );
      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        updated?: number;
        skipped?: number;
        referenceKm?: number;
        errors?: string[];
      };

      if (!response.ok || !result.ok) {
        const detail = result.errors?.[0];
        toast.error(
          detail
            ? `${result.error ?? "Mise à jour échouée"} · ${detail}`
            : result.error ?? "Mise à jour échouée."
        );
        return;
      }

      toast.success(
        `${result.updated ?? 0} tâche(s) marquée(s) à jour à ${
          result.referenceKm?.toLocaleString("fr-FR") ?? currentKm
        } km. ${result.skipped ?? 0} ignorée(s) (non périodiques ou déjà plus récentes).`
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur réseau pendant la mise à jour.");
    } finally {
      setMarkingCurrent(false);
    }
  };

  const [form, setForm] = useState<FormState>({
    date_entretien: new Date().toISOString().slice(0, 10),
    kilometrage: currentKm.toString(),
    cout: "",
    description: ""
  });
  const [alertForm, setAlertForm] = useState<AlertFormState>({
    dueSoonKmThreshold: String(DEFAULT_DUE_SOON_KM_THRESHOLD),
    dueSoonDaysThreshold: String(DEFAULT_DUE_SOON_DAYS_THRESHOLD)
  });
  const sortedItems = useMemo(() => {
    const now = new Date();
    return [...items].sort((a, b) => {
      const rankDiff = statusRank[a.status] - statusRank[b.status];
      if (rankDiff !== 0) return rankDiff;

      const scoreDiff = getMaintenanceSortScore(a, currentKm, now) - getMaintenanceSortScore(b, currentKm, now);
      if (scoreDiff !== 0) return scoreDiff;

      return a.titre.localeCompare(b.titre, "fr");
    });
  }, [items, currentKm]);

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
        currentKm,
        dueSoonKmThreshold: entry.due_soon_km_threshold,
        dueSoonDaysThreshold: entry.due_soon_days_threshold,
        lastDoneKm: doneKm,
        lastDoneDate: doneDate
      });

      const { error: updateError } = await supabase
        .from("maintenance_plan_entries")
        .update({
          last_done_km: doneKm,
          last_done_date: doneDate,
          next_due_km: due.nextDueKm,
          next_due_date: due.nextDueDate,
          status,
          updated_at: new Date().toISOString()
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

  const startAlertEdition = (entry: MaintenancePlanEntry) => {
    setActiveAlertEntryId(entry.id);
    setAlertForm({
      dueSoonKmThreshold: String(entry.due_soon_km_threshold ?? DEFAULT_DUE_SOON_KM_THRESHOLD),
      dueSoonDaysThreshold: String(entry.due_soon_days_threshold ?? DEFAULT_DUE_SOON_DAYS_THRESHOLD)
    });
  };

  const saveAlertRules = async (entry: MaintenancePlanEntry) => {
    const kmThreshold = Number(alertForm.dueSoonKmThreshold);
    const daysThreshold = Number(alertForm.dueSoonDaysThreshold);
    if (!Number.isFinite(kmThreshold) || kmThreshold < 0 || !Number.isFinite(daysThreshold) || daysThreshold <= 0) {
      toast.error("Seuils invalides. Vérifiez km et jours.");
      return;
    }

    try {
      setSavingAlert(true);
      const status = getMaintenanceStatus({
        nextDueKm: entry.next_due_km,
        nextDueDate: entry.next_due_date,
        currentKm,
        dueSoonKmThreshold: kmThreshold,
        dueSoonDaysThreshold: daysThreshold,
        lastDoneKm: entry.last_done_km,
        lastDoneDate: entry.last_done_date
      });
      const { error } = await supabase
        .from("maintenance_plan_entries")
        .update({
          due_soon_km_threshold: kmThreshold,
          due_soon_days_threshold: daysThreshold,
          status,
          updated_at: new Date().toISOString()
        } as never)
        .eq("id", entry.id);
      if (error) {
        toast.error(`Impossible d'enregistrer les seuils : ${error.message}`);
        return;
      }
      toast.success("Règles d'alerte mises à jour.");
      setActiveAlertEntryId(null);
      router.refresh();
    } finally {
      setSavingAlert(false);
    }
  };

  return (
    <Card className="border-sky-200 dark:border-sky-900 bg-sky-50/40 dark:bg-sky-950/40">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-sky-700 dark:text-sky-300">Plan d&apos;entretien</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Profil actif : {maintenanceProfileName}
            {hasAnyAiTemplate && !hasHardcodedTemplate && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:text-violet-300">
                <Sparkles className="h-3 w-3" strokeWidth={2.25} aria-hidden />
                Plan généré par IA
              </span>
            )}
          </p>
        </div>
        {isUuidVehicle && (
          <div className="flex flex-wrap items-center gap-2">
            {items.length > 0 && (
              <Button
                type="button"
                onClick={markAllAsCurrent}
                disabled={markingCurrent}
                variant="outline"
                className="gap-2 border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                title="Marquer toutes les révisions périodiques comme effectuées aujourd'hui (utile pour un véhicule d'occasion entretenu)."
              >
                {markingCurrent ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Mise à jour…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                    Marquer comme à jour
                  </>
                )}
              </Button>
            )}
            {canUseAi ? (
              <Button
                type="button"
                onClick={() => generateWithAi(hasAnyAiTemplate)}
                disabled={generatingAi}
                className="gap-2 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-[0_4px_14px_-4px_rgba(124,58,237,0.55)] transition hover:from-violet-700 hover:to-indigo-700"
              >
                {generatingAi ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Génération…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                    {hasAnyAiTemplate ? "Régénérer avec l'IA" : "Générer un plan personnalisé (IA)"}
                  </>
                )}
              </Button>
            ) : (
              <Button asChild variant="outline" className="gap-2 border-violet-200 dark:border-violet-900 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40">
                <Link href="/tarifs">
                  <Sparkles className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                  IA : passer Premium
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <p className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-sm text-slate-600 dark:text-slate-300">
            Aucun plan disponible pour ce véhicule.
          </p>
        )}
        {sortedItems.map((item) => {
          const statusBadge = getStatusBadge(item.status);
          const isAi = item.template_source === "ai" || item.template_source === "approved";
          return (
            <div key={item.id} className="rounded-lg border border-sky-200 dark:border-sky-900 bg-white dark:bg-slate-900 p-3">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="font-medium leading-tight">{item.titre}</p>
                <Badge variant={statusBadge.variant} className="whitespace-nowrap">
                  {statusBadge.label}
                </Badge>
                <Badge
                  variant={item.source === "template" ? "secondary" : "outline"}
                  className="whitespace-nowrap"
                >
                  {item.source === "template" ? "Template" : "Manuel"}
                </Badge>
                {isAi && (
                  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:text-violet-300">
                    <Sparkles className="h-3 w-3" strokeWidth={2.25} aria-hidden />
                    IA
                  </span>
                )}
                <Badge variant="outline" className="whitespace-nowrap">
                  {item.priority === "urgent" ? "Urgent" : item.priority === "important" ? "Important" : "Normal"}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Catégorie : {item.categorie}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Prochaine échéance km :{" "}
                {item.next_due_km != null ? `${item.next_due_km.toLocaleString("fr-FR")} km` : "non définie"}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Prochaine échéance date : {item.next_due_date ? formatDateFr(item.next_due_date) : "non définie"}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Alerte bientôt due : ≤ {item.due_soon_km_threshold} km ou ≤ {item.due_soon_days_threshold} jours
              </p>
              {item.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>}

              <div className="mt-2">
                {activeEntryId === item.id ? (
                  <div className="space-y-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
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
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setActiveEntryId(item.id)}>
                      Marquer comme effectué
                    </Button>
                    <Button variant="ghost" onClick={() => startAlertEdition(item)}>
                      Régler alerte
                    </Button>
                  </div>
                )}
              </div>
              {activeAlertEntryId === item.id && (
                <div className="mt-2 space-y-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Règles d&apos;alerte personnalisées</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Seuil km"
                      value={alertForm.dueSoonKmThreshold}
                      onChange={(e) => setAlertForm((state) => ({ ...state, dueSoonKmThreshold: e.target.value }))}
                    />
                    <Input
                      type="number"
                      min={1}
                      placeholder="Seuil jours"
                      value={alertForm.dueSoonDaysThreshold}
                      onChange={(e) => setAlertForm((state) => ({ ...state, dueSoonDaysThreshold: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveAlertRules(item)} disabled={savingAlert}>
                      {savingAlert ? "Enregistrement..." : "Sauvegarder"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setActiveAlertEntryId(null)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
