import { differenceInCalendarDays, parseISO } from "date-fns";
import type { MaintenancePlanEntry } from "@/types/database";
import type { VehicleReminderItem, VehicleReminderSummary } from "@/types/maintenance";
import { estimateCurrentOdometer, projectDateForOdometer } from "@/lib/odometer-estimate";

export function getVehicleReminderSummary(input: {
  planEntries: MaintenancePlanEntry[];
  currentKm: number;
  /** Si fournis, l'app trie aussi par échéance km projetée (premier des 2 seuils). */
  avgKmPerYear?: number | null;
  lastOdometerValue?: number | null;
  lastOdometerDate?: string | null;
  now?: Date;
}): VehicleReminderSummary {
  const now = input.now ?? new Date();

  const hasEstimation =
    input.avgKmPerYear != null &&
    input.avgKmPerYear > 0 &&
    input.lastOdometerValue != null &&
    input.lastOdometerDate != null;

  const estimatedCurrentKm = hasEstimation
    ? estimateCurrentOdometer({
        lastOdometerValue: input.lastOdometerValue as number,
        lastOdometerDate: input.lastOdometerDate as string,
        avgKmPerYear: input.avgKmPerYear as number,
        now
      })
    : input.currentKm;

  // Pré-calcul de la date effective (min(date, km projeté en date))
  // pour pouvoir trier les rappels par urgence réelle.
  const itemsWithScore: Array<{ item: VehicleReminderItem; effectiveDays: number }> =
    input.planEntries
      .filter((entry) => entry.status === "overdue" || entry.status === "due_soon")
      .map((entry) => {
        const isUrgent = entry.status === "overdue" || entry.priority === "urgent";
        const isImportant = !isUrgent && entry.priority === "important";
        const level: VehicleReminderItem["level"] = isUrgent ? "urgent" : isImportant ? "important" : "normal";

        const dateDays = entry.next_due_date
          ? differenceInCalendarDays(parseISO(entry.next_due_date), now)
          : Number.POSITIVE_INFINITY;

        let kmDays = Number.POSITIVE_INFINITY;
        if (hasEstimation && entry.next_due_km != null) {
          const projected = projectDateForOdometer({
            targetKm: entry.next_due_km,
            lastOdometerValue: input.lastOdometerValue as number,
            lastOdometerDate: input.lastOdometerDate as string,
            avgKmPerYear: input.avgKmPerYear as number
          });
          if (projected) kmDays = differenceInCalendarDays(projected, now);
        }

        return {
          item: {
            id: entry.id,
            titre: entry.titre,
            categorie: entry.categorie,
            level,
            statusLabel: entry.status === "overdue" ? "En retard" : "Bientôt dû",
            nextDueKm: entry.next_due_km,
            nextDueDate: entry.next_due_date
          },
          effectiveDays: Math.min(dateDays, kmDays)
        };
      });

  const sorted = itemsWithScore.sort((a, b) => {
    const rank = (level: VehicleReminderItem["level"]) =>
      level === "urgent" ? 0 : level === "important" ? 1 : 2;
    const rankDiff = rank(a.item.level) - rank(b.item.level);
    if (rankDiff !== 0) return rankDiff;

    // Tri principal : par échéance effective la plus proche
    if (a.effectiveDays !== b.effectiveDays) return a.effectiveDays - b.effectiveDays;

    // Fallback : par titre alphabétique
    return a.item.titre.localeCompare(b.item.titre, "fr");
  });

  const reminderItems = sorted.map((row) => row.item);
  // estimatedCurrentKm est calculé pour cohérence avec le summary, même si
  // pas encore exposé : l'UI consommatrice peut s'appuyer sur le tri.
  void estimatedCurrentKm;

  return {
    urgentCount: reminderItems.filter((item) => item.level === "urgent").length,
    importantCount: reminderItems.filter((item) => item.level === "important").length,
    normalCount: reminderItems.filter((item) => item.level === "normal").length,
    items: reminderItems.slice(0, 6)
  };
}
