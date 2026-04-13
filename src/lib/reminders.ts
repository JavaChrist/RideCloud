import { differenceInCalendarDays, parseISO } from "date-fns";
import type { MaintenancePlanEntry } from "@/types/database";
import type { VehicleReminderItem, VehicleReminderSummary } from "@/types/maintenance";

export function getVehicleReminderSummary(input: {
  planEntries: MaintenancePlanEntry[];
  currentKm: number;
  now?: Date;
}): VehicleReminderSummary {
  const now = input.now ?? new Date();

  const reminderItems: VehicleReminderItem[] = input.planEntries
    .filter((entry) => entry.status === "overdue" || entry.status === "due_soon")
    .map((entry) => {
      const isUrgent = entry.status === "overdue" || entry.priority === "urgent";
      const isImportant = !isUrgent && entry.priority === "important";
      const level: VehicleReminderItem["level"] = isUrgent ? "urgent" : isImportant ? "important" : "normal";
      return {
        id: entry.id,
        titre: entry.titre,
        categorie: entry.categorie,
        level,
        statusLabel: entry.status === "overdue" ? "En retard" : "Bientôt dû",
        nextDueKm: entry.next_due_km,
        nextDueDate: entry.next_due_date
      };
    })
    .sort((a, b) => {
      const rank = (item: VehicleReminderItem) => (item.level === "urgent" ? 0 : item.level === "important" ? 1 : 2);
      const rankDiff = rank(a) - rank(b);
      if (rankDiff !== 0) return rankDiff;

      const kmA = a.nextDueKm != null ? a.nextDueKm - input.currentKm : Number.POSITIVE_INFINITY;
      const kmB = b.nextDueKm != null ? b.nextDueKm - input.currentKm : Number.POSITIVE_INFINITY;
      if (kmA !== kmB) return kmA - kmB;

      const daysA = a.nextDueDate ? differenceInCalendarDays(parseISO(a.nextDueDate), now) : Number.POSITIVE_INFINITY;
      const daysB = b.nextDueDate ? differenceInCalendarDays(parseISO(b.nextDueDate), now) : Number.POSITIVE_INFINITY;
      if (daysA !== daysB) return daysA - daysB;

      return a.titre.localeCompare(b.titre, "fr");
    });

  return {
    urgentCount: reminderItems.filter((item) => item.level === "urgent").length,
    importantCount: reminderItems.filter((item) => item.level === "important").length,
    normalCount: reminderItems.filter((item) => item.level === "normal").length,
    items: reminderItems.slice(0, 6)
  };
}
