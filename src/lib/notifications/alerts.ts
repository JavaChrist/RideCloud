import { differenceInCalendarDays, parseISO } from "date-fns";
import { getMaintenanceStatus } from "@/lib/maintenance";
import { daysSinceOdometerRefresh } from "@/lib/odometer-estimate";
import {
  ODOMETER_REMIND_AFTER_DAYS,
  buildMaintenanceDedupeKey,
  buildOdometerDedupeKey
} from "@/lib/notifications/dedupe";
import type { MaintenancePlanEntry, Vehicle } from "@/types/database";

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

export function collectNotificationAlerts(input: {
  vehicles: Array<Vehicle & { user_id: string }>;
  planEntries: MaintenancePlanEntry[];
  now?: Date;
}): NotificationAlert[] {
  const now = input.now ?? new Date();
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
    if (daysSinceRefresh != null && daysSinceRefresh > ODOMETER_REMIND_AFTER_DAYS) {
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
