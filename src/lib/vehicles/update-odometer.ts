import { collectNotificationAlerts } from "@/lib/notifications/alerts";
import {
  dispatchNotificationAlerts,
  type CronResult,
  type NotificationDispatchDeps
} from "@/lib/notifications/cron";
import type { MaintenancePlanEntry, Vehicle } from "@/types/database";

export type VehicleWithOwner = Vehicle & { user_id: string };

export type UpdateOdometerResult =
  | { ok: true; kilometrage: number; notifications: CronResult | null }
  | { ok: false; reason: "not_found" | "write_failed"; message?: string };

export interface UpdateOdometerDependencies {
  now?: Date;
  loadOwnedVehicle: (userId: string, vehicleId: string) => Promise<VehicleWithOwner | null>;
  persistKilometrage: (input: {
    userId: string;
    vehicleId: string;
    kilometrage: number;
    lastOdometerDate: string;
    updatedAt: string;
  }) => Promise<VehicleWithOwner | null>;
  loadPlanEntries: (userId: string, vehicleId: string) => Promise<MaintenancePlanEntry[]>;
  notificationDeps: NotificationDispatchDeps;
  onNotificationError?: (reason: string) => void;
}

export async function updateVehicleKilometrage(
  input: {
    userId: string;
    vehicleId: string;
    kilometrage: number;
  } & UpdateOdometerDependencies
): Promise<UpdateOdometerResult> {
  const now = input.now ?? new Date();
  const owned = await input.loadOwnedVehicle(input.userId, input.vehicleId);
  if (!owned || owned.user_id !== input.userId) {
    return { ok: false, reason: "not_found" };
  }

  let written: VehicleWithOwner | null;
  try {
    written = await input.persistKilometrage({
      userId: input.userId,
      vehicleId: input.vehicleId,
      kilometrage: input.kilometrage,
      lastOdometerDate: now.toISOString().slice(0, 10),
      updatedAt: now.toISOString()
    });
  } catch (error) {
    return {
      ok: false,
      reason: "write_failed",
      message: error instanceof Error ? error.message : "write_failed"
    };
  }

  if (!written || written.user_id !== input.userId) {
    return { ok: false, reason: "write_failed" };
  }

  try {
    const planEntries = await input.loadPlanEntries(input.userId, written.id);
    const alerts = collectNotificationAlerts({
      vehicles: [written],
      planEntries,
      now,
      trigger: "kilometrage_update"
    });
    const dispatched = await dispatchNotificationAlerts(alerts, {
      ...input.notificationDeps,
      now
    });
    return {
      ok: true,
      kilometrage: written.kilometrage,
      notifications: {
        processed: 1,
        candidates: alerts.length,
        ...dispatched
      }
    };
  } catch (error) {
    input.onNotificationError?.(error instanceof Error ? error.message : "notification_failed");
    return { ok: true, kilometrage: written.kilometrage, notifications: null };
  }
}
