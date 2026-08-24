import { differenceInCalendarDays, parseISO } from "date-fns";
import { DEFAULT_DUE_SOON_DAYS_THRESHOLD, DEFAULT_DUE_SOON_KM_THRESHOLD, getMaintenanceStatus } from "@/lib/maintenance";
import { daysSinceOdometerRefresh, projectDateForOdometer } from "@/lib/odometer-estimate";
import {
  ODOMETER_REMIND_AFTER_DAYS,
  buildMaintenanceDedupeKey,
  buildOdometerDedupeKey
} from "@/lib/notifications/dedupe";
import type { MaintenancePlanEntry, Vehicle } from "@/types/database";

export type NotificationAlertTrigger = "cron" | "kilometrage_update";

export type NotificationAlertStatus = "due_soon" | "overdue" | "stale";

export interface NotificationAlert {
  userId: string;
  vehicleId: string;
  type: "odometer_refresh" | "maintenance_due";
  status: NotificationAlertStatus;
  subjectId: string | null;
  title: string;
  body: string;
  href: string;
  dedupeKey: string;
  tag: string;
  metadata: Record<string, unknown>;
}

/** Éligibilité due au km (ou projection km→date), pas à une échéance calendaire seule. */
export function isKilometrageDrivenMaintenance(input: {
  nextDueKm: number | null;
  currentKm: number;
  dueSoonKmThreshold?: number | null;
  dueSoonDaysThreshold?: number | null;
  avgKmPerYear?: number | null;
  lastOdometerValue?: number | null;
  lastOdometerDate?: string | null;
  now?: Date;
}): boolean {
  if (input.nextDueKm == null) return false;
  const now = input.now ?? new Date();
  const kmDiff = input.nextDueKm - input.currentKm;
  const dueSoonKmThreshold = input.dueSoonKmThreshold ?? DEFAULT_DUE_SOON_KM_THRESHOLD;
  if (kmDiff < 0) return true;
  if (kmDiff <= dueSoonKmThreshold) return true;

  if (
    input.avgKmPerYear != null &&
    input.avgKmPerYear > 0 &&
    input.lastOdometerValue != null &&
    input.lastOdometerDate
  ) {
    const projectedDate = projectDateForOdometer({
      targetKm: input.nextDueKm,
      lastOdometerValue: input.lastOdometerValue,
      lastOdometerDate: input.lastOdometerDate,
      avgKmPerYear: input.avgKmPerYear
    });
    if (projectedDate) {
      const projectedDays = differenceInCalendarDays(projectedDate, now);
      const dueSoonDaysThreshold = input.dueSoonDaysThreshold ?? DEFAULT_DUE_SOON_DAYS_THRESHOLD;
      if (projectedDays < 0 || projectedDays <= dueSoonDaysThreshold) return true;
    }
  }

  return false;
}

export function collectNotificationAlerts(input: {
  vehicles: Array<Vehicle & { user_id: string }>;
  planEntries: MaintenancePlanEntry[];
  now?: Date;
  trigger?: NotificationAlertTrigger;
}): NotificationAlert[] {
  const now = input.now ?? new Date();
  const trigger = input.trigger ?? "cron";
  const planByVehicle = new Map<string, MaintenancePlanEntry[]>();
  for (const entry of input.planEntries) {
    const list = planByVehicle.get(entry.vehicle_id) ?? [];
    list.push(entry);
    planByVehicle.set(entry.vehicle_id, list);
  }

  const alerts: NotificationAlert[] = [];
  for (const vehicle of input.vehicles) {
    const labelVehicule = vehicle.surnom?.trim() || `${vehicle.marque} ${vehicle.modele}`.trim();
    const detailUrl = `/vehicule/${vehicle.id}`;

    const daysSinceRefresh = daysSinceOdometerRefresh({
      lastOdometerDate: vehicle.last_odometer_date,
      now
    });
    if (
      trigger !== "kilometrage_update" &&
      daysSinceRefresh != null &&
      daysSinceRefresh > ODOMETER_REMIND_AFTER_DAYS
    ) {
      alerts.push({
        userId: vehicle.user_id,
        vehicleId: vehicle.id,
        type: "odometer_refresh",
        status: "stale",
        subjectId: null,
        title: `Mets à jour le compteur de ${labelVehicule}`,
        body: `Dernière saisie il y a ${daysSinceRefresh} jours. Tes alertes d'entretien gagneront en précision.`,
        href: detailUrl,
        dedupeKey: buildOdometerDedupeKey({
          vehicleId: vehicle.id,
          lastOdometerDate: vehicle.last_odometer_date
        }),
        tag: `odometer-${vehicle.id}`,
        metadata: {
          status: "stale",
          daysSinceRefresh
        }
      });
    }

    for (const entry of planByVehicle.get(vehicle.id) ?? []) {
      const status = getMaintenanceStatus({
        nextDueKm: entry.next_due_km,
        nextDueDate: entry.next_due_date,
        currentKm: vehicle.kilometrage,
        dueSoonKmThreshold: entry.due_soon_km_threshold,
        dueSoonDaysThreshold: entry.due_soon_days_threshold,
        lastDoneKm: entry.last_done_km,
        lastDoneDate: entry.last_done_date,
        avgKmPerYear: vehicle.avg_km_per_year,
        lastOdometerValue: vehicle.last_odometer_value,
        lastOdometerDate: vehicle.last_odometer_date,
        now
      });
      if (status !== "overdue" && status !== "due_soon") continue;
      if (
        trigger === "kilometrage_update" &&
        !isKilometrageDrivenMaintenance({
          nextDueKm: entry.next_due_km,
          currentKm: vehicle.kilometrage,
          dueSoonKmThreshold: entry.due_soon_km_threshold,
          dueSoonDaysThreshold: entry.due_soon_days_threshold,
          avgKmPerYear: vehicle.avg_km_per_year,
          lastOdometerValue: vehicle.last_odometer_value,
          lastOdometerDate: vehicle.last_odometer_date,
          now
        })
      ) {
        continue;
      }

      let detail = "à prévoir bientôt";
      if (status === "overdue") {
        detail = "en retard";
      } else if (entry.next_due_date) {
        const days = differenceInCalendarDays(parseISO(entry.next_due_date), now);
        if (days >= 0) detail = `dans ${days} jour${days > 1 ? "s" : ""}`;
      } else if (entry.next_due_km != null) {
        const km = entry.next_due_km - vehicle.kilometrage;
        if (km >= 0) detail = `dans ${km.toLocaleString("fr-FR")} km`;
      }

      alerts.push({
        userId: vehicle.user_id,
        vehicleId: vehicle.id,
        type: "maintenance_due",
        status,
        subjectId: entry.id,
        title:
          status === "overdue"
            ? `${entry.titre} en retard — ${labelVehicule}`
            : `${entry.titre} ${detail} — ${labelVehicule}`,
        body:
          status === "overdue"
            ? `Cet entretien est ${detail} sur ${labelVehicule}. Ouvre l'app pour planifier.`
            : `Pense à planifier "${entry.titre}" ${detail} sur ${labelVehicule}.`,
        href: `${detailUrl}?tab=plan-entretien`,
        dedupeKey: buildMaintenanceDedupeKey({
          planEntryId: entry.id,
          nextDueKm: entry.next_due_km,
          nextDueDate: entry.next_due_date
        }),
        tag: `maintenance-${entry.id}`,
        metadata: {
          status,
          subjectId: entry.id,
          nextDueKm: entry.next_due_km,
          nextDueDate: entry.next_due_date
        }
      });
    }
  }
  return alerts;
}
