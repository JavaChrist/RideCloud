import { addMonths, differenceInCalendarDays, parseISO } from "date-fns";
import type { MaintenancePlanEntry, MaintenanceStatus } from "@/types/database";
import type {
  MaintenanceDueResult,
  MaintenanceStatusInput,
  VehicleMaintenanceSummary
} from "@/types/maintenance";

export const DEFAULT_DUE_SOON_KM_THRESHOLD = 500;
export const DEFAULT_DUE_SOON_DAYS_THRESHOLD = 30;

export function calculateNextMaintenanceDue(input: {
  intervalKm: number | null;
  intervalMonths: number | null;
  firstDueKm: number | null;
  firstDueDate: string | null;
  lastDoneKm: number | null;
  lastDoneDate: string | null;
}): MaintenanceDueResult {
  let nextDueKm: number | null = null;
  if (input.intervalKm != null) {
    if (input.lastDoneKm != null) {
      nextDueKm = input.lastDoneKm + input.intervalKm;
    } else if (input.firstDueKm != null) {
      // Première échéance explicite du plan
      nextDueKm = input.firstDueKm;
    } else {
      // Fallback quand seul un intervalle existe
      nextDueKm = input.intervalKm;
    }
  } else if (input.lastDoneKm == null) {
    // Tâche unique (one-shot) pas encore réalisée : on conserve l'échéance initiale
    nextDueKm = input.firstDueKm ?? null;
  } else {
    // Tâche unique déjà réalisée : plus d'échéance kilométrique
    nextDueKm = null;
  }

  let nextDueDate: string | null = null;
  if (input.intervalMonths != null) {
    if (input.lastDoneDate) {
      nextDueDate = addMonths(parseISO(input.lastDoneDate), input.intervalMonths).toISOString();
    } else if (input.firstDueDate) {
      nextDueDate = input.firstDueDate;
    }
  } else if (!input.lastDoneDate) {
    nextDueDate = input.firstDueDate ?? null;
  } else {
    nextDueDate = null;
  }

  return { nextDueKm, nextDueDate };
}

export function getMaintenanceStatus(input: MaintenanceStatusInput): MaintenanceStatus {
  const now = input.now ?? new Date();
  const kmDiff = input.nextDueKm != null ? input.nextDueKm - input.currentKm : null;
  const daysDiff = input.nextDueDate ? differenceInCalendarDays(parseISO(input.nextDueDate), now) : null;
  const dueSoonKmThreshold = input.dueSoonKmThreshold ?? DEFAULT_DUE_SOON_KM_THRESHOLD;
  const dueSoonDaysThreshold = input.dueSoonDaysThreshold ?? DEFAULT_DUE_SOON_DAYS_THRESHOLD;

  // Tâche one-shot terminée : aucune échéance future à respecter
  const hasFutureDeadline = kmDiff != null || daysDiff != null;
  if (!hasFutureDeadline) {
    return input.lastDoneKm != null || input.lastDoneDate ? "done" : "upcoming";
  }

  const isOverdue = (kmDiff != null && kmDiff < 0) || (daysDiff != null && daysDiff < 0);
  if (isOverdue) return "overdue";

  const isDueSoon =
    (kmDiff != null && kmDiff <= dueSoonKmThreshold) ||
    (daysDiff != null && daysDiff <= dueSoonDaysThreshold);
  if (isDueSoon) return "due_soon";

  return "upcoming";
}

export function getVehicleMaintenanceSummary(input: {
  planEntries: MaintenancePlanEntry[];
  currentKm: number;
  now?: Date;
}): VehicleMaintenanceSummary {
  const now = input.now ?? new Date();
  if (input.planEntries.length === 0) {
    return {
      globalLabel: "Aucun plan d'entretien",
      nextLabel: "Ajoutez des tâches recommandées",
      overdueCount: 0,
      dueSoonCount: 0,
      totalPlanEntries: 0,
      status: "upcoming",
      dueSoonTitles: [],
      overdueTitles: []
    };
  }

  const computed = input.planEntries.map((entry) => {
    const scoreKm = entry.next_due_km != null ? entry.next_due_km - input.currentKm : Number.POSITIVE_INFINITY;
    const scoreDate = entry.next_due_date
      ? differenceInCalendarDays(parseISO(entry.next_due_date), now)
      : Number.POSITIVE_INFINITY;
    const score = Math.min(scoreKm, scoreDate);
    return { entry, score };
  });

  const overdueEntries = input.planEntries.filter((item) => item.status === "overdue");
  const dueSoonEntries = input.planEntries.filter((item) => item.status === "due_soon");
  const overdueTitles = [...new Set(overdueEntries.map((item) => `${item.categorie}:${item.titre}`))]
    .map((key) => key.split(":").slice(1).join(":"));
  const dueSoonTitles = [...new Set(dueSoonEntries.map((item) => `${item.categorie}:${item.titre}`))]
    .map((key) => key.split(":").slice(1).join(":"));
  const overdueCount = overdueTitles.length;
  const dueSoonCount = dueSoonTitles.length;
  const nextItem = [...computed].sort((a, b) => a.score - b.score)[0];

  let globalLabel = "Globalement à jour";
  let globalStatus: MaintenanceStatus = "upcoming";

  if (overdueCount > 0) {
    globalLabel = `${overdueCount} entretien(s) en retard`;
    globalStatus = "overdue";
  } else if (dueSoonCount > 0) {
    globalLabel = `${dueSoonCount} entretien(s) à prévoir bientôt`;
    globalStatus = "due_soon";
  }

  let nextLabel = "Aucune échéance définie";
  if (nextItem) {
    if (nextItem.entry.next_due_km != null) {
      const kmDiff = nextItem.entry.next_due_km - input.currentKm;
      nextLabel =
        kmDiff >= 0
          ? `Prochaine échéance : ${nextItem.entry.titre} dans ${kmDiff.toLocaleString("fr-FR")} km`
          : `Prochaine échéance : ${nextItem.entry.titre} en retard de ${Math.abs(kmDiff).toLocaleString("fr-FR")} km`;
    } else if (nextItem.entry.next_due_date) {
      const daysDiff = differenceInCalendarDays(parseISO(nextItem.entry.next_due_date), now);
      nextLabel =
        daysDiff >= 0
          ? `Prochaine échéance : ${nextItem.entry.titre} dans ${daysDiff} jour(s)`
          : `Prochaine échéance : ${nextItem.entry.titre} en retard de ${Math.abs(daysDiff)} jour(s)`;
    }
  }

  return {
    globalLabel,
    nextLabel,
    overdueCount,
    dueSoonCount,
    totalPlanEntries: input.planEntries.length,
    status: globalStatus,
    dueSoonTitles,
    overdueTitles
  };
}
