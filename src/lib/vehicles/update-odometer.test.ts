import { describe, expect, it, vi } from "vitest";
import { processNotificationCron, type NotificationDispatchDeps, type PersistedCronNotification } from "@/lib/notifications/cron";
import { shouldReopenReadNotification } from "@/lib/notifications/dedupe";
import type { NotificationAlert } from "@/lib/notifications/alerts";
import { updateVehicleKilometrage, type VehicleWithOwner } from "./update-odometer";
import type { MaintenancePlanEntry, Vehicle } from "@/types/database";
import type { SendOutcome } from "@/lib/push/server";

const NOW = new Date("2026-08-24T20:37:00.000Z");

function vehicle(overrides: Partial<Vehicle> = {}): VehicleWithOwner {
  return {
    id: "veh-a",
    user_id: "user-a",
    category: "voitures",
    marque: "Audi",
    modele: "A3",
    annee: 2018,
    kilometrage: 12000,
    date_mise_en_circulation: null,
    date_achat: null,
    carburant: null,
    immatriculation: null,
    vin: null,
    surnom: null,
    photo_url: null,
    usage_profile: "often",
    avg_km_per_year: 15000,
    last_odometer_value: 12000,
    last_odometer_date: "2026-08-20",
    last_estimation_reminder_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-08-20T00:00:00.000Z",
    ...overrides
  };
}

function planEntry(overrides: Partial<MaintenancePlanEntry> = {}): MaintenancePlanEntry {
  return {
    id: "entry-1",
    user_id: "user-a",
    vehicle_id: "veh-a",
    titre: "Vidange",
    categorie: "moteur",
    description: null,
    interval_km: 15000,
    interval_months: null,
    first_due_km: 15000,
    first_due_date: null,
    last_done_km: null,
    last_done_date: null,
    next_due_km: 15000,
    next_due_date: null,
    due_soon_km_threshold: 500,
    due_soon_days_threshold: 30,
    priority: "normal",
    status: "upcoming",
    source: "manual",
    template_source: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides
  };
}

function createPipeline(input: {
  pushUserIds?: string[];
  dismissedKeys?: string[];
  sendOutcome?: SendOutcome[];
}) {
  const inbox = new Map<string, PersistedCronNotification & { title: string; metadata: Record<string, unknown> }>();
  const logs: Array<Record<string, unknown>> = [];
  const pushes: Array<{ userId: string; payload: Record<string, unknown> }> = [];

  const persistAlert = async (alert: NotificationAlert) => {
    const key = `${alert.userId}::${alert.dedupeKey}`;
    if (input.dismissedKeys?.includes(key)) return null;
    const existing = inbox.get(key);
    if (!existing) {
      const created = {
        id: `n-${inbox.size + 1}`,
        lastPushedAt: null,
        readAt: null,
        dedupeKey: alert.dedupeKey,
        title: alert.title,
        metadata: alert.metadata
      };
      inbox.set(key, created);
      return created;
    }
    existing.title = alert.title;
    const existingStatus = typeof existing.metadata.status === "string" ? existing.metadata.status : null;
    if (shouldReopenReadNotification({ existingStatus, incomingStatus: alert.status })) {
      existing.readAt = null;
    }
    existing.metadata = alert.metadata;
    return existing;
  };

  const notificationDeps: NotificationDispatchDeps = {
    now: NOW,
    persistAlert,
    loadPushUserIds: async () => new Set(input.pushUserIds ?? ["user-a"]),
    sendPush: async (userId, payload) => {
      pushes.push({ userId, payload });
      return input.sendOutcome ?? [{ endpoint: "https://push.example/a", success: true, status: 201 }];
    },
    markPushed: async (notificationId, at) => {
      for (const row of inbox.values()) {
        if (row.id === notificationId) row.lastPushedAt = at.toISOString();
      }
    },
    logPushSuccess: async (row) => {
      logs.push(row);
    }
  };

  return { inbox, logs, pushes, notificationDeps, persistAlert };
}

function createUpdateHarness(input: {
  current: VehicleWithOwner;
  planEntries?: MaintenancePlanEntry[];
  pushUserIds?: string[];
  dismissedKeys?: string[];
  writeFails?: boolean;
  notificationThrows?: boolean;
}) {
  const pipeline = createPipeline({
    pushUserIds: input.pushUserIds,
    dismissedKeys: input.dismissedKeys
  });
  const persistKilometrage = vi.fn(async ({ kilometrage, lastOdometerDate, updatedAt }) => {
    if (input.writeFails) throw new Error("db_write");
    return {
      ...input.current,
      kilometrage,
      last_odometer_value: kilometrage,
      last_odometer_date: lastOdometerDate,
      updated_at: updatedAt
    };
  });
  const loadPlanEntries = vi.fn(async () => input.planEntries ?? []);
  const onNotificationError = vi.fn();

  const run = (kilometrage: number) =>
    updateVehicleKilometrage({
      userId: "user-a",
      vehicleId: "veh-a",
      kilometrage,
      now: NOW,
      loadOwnedVehicle: async () => input.current,
      persistKilometrage,
      loadPlanEntries: input.notificationThrows
        ? async () => {
            throw new Error("notify_down");
          }
        : loadPlanEntries,
      notificationDeps: pipeline.notificationDeps,
      onNotificationError
    });

  return { ...pipeline, persistKilometrage, loadPlanEntries, onNotificationError, run };
}

describe("updateVehicleKilometrage", () => {
  it("A — aucun entretien éligible : 0 notification, 0 Push", async () => {
    const harness = createUpdateHarness({
      current: vehicle(),
      planEntries: [planEntry({ next_due_km: 30000 })]
    });
    const result = await harness.run(12500);
    expect(result).toMatchObject({ ok: true, kilometrage: 12500 });
    if (result.ok) {
      expect(result.notifications).toMatchObject({ candidates: 0, persisted: 0, sent: 0 });
    }
    expect(harness.inbox.size).toBe(0);
    expect(harness.pushes).toHaveLength(0);
    expect(harness.persistKilometrage).toHaveBeenCalledTimes(1);
  });

  it("B — un entretien devient en retard : inbox + Push", async () => {
    const harness = createUpdateHarness({
      current: vehicle(),
      planEntries: [planEntry({ next_due_km: 15000 })]
    });
    const result = await harness.run(17280);
    expect(result.ok).toBe(true);
    expect(harness.inbox.size).toBe(1);
    expect(harness.pushes).toHaveLength(1);
    expect(harness.logs).toHaveLength(1);
    expect([...harness.inbox.values()][0].dedupeKey).toBe("maintenance_due:entry-1:15000:none");
    expect(harness.pushes[0].payload).toMatchObject({ tag: "maintenance-entry-1" });
  });

  it("C — trois entretiens éligibles : 3 clés distinctes", async () => {
    const harness = createUpdateHarness({
      current: vehicle(),
      planEntries: [
        planEntry({ id: "pneus", titre: "Pneus", next_due_km: 13512 }),
        planEntry({ id: "pneus-2", titre: "Pneus usure", next_due_km: 13512 }),
        planEntry({ id: "filtre", titre: "Filtre habitacle", next_due_km: 15000 })
      ]
    });
    await harness.run(17280);
    expect(harness.inbox.size).toBe(3);
    expect([...harness.inbox.values()].map((row) => row.dedupeKey).sort()).toEqual([
      "maintenance_due:filtre:15000:none",
      "maintenance_due:pneus-2:13512:none",
      "maintenance_due:pneus:13512:none"
    ]);
    expect(harness.pushes).toHaveLength(3);
  });

  it("D — même dedupe_key : pas de doublon, pas de second Push", async () => {
    const harness = createUpdateHarness({
      current: vehicle(),
      planEntries: [planEntry({ next_due_km: 15000 })]
    });
    await harness.run(17280);
    expect(harness.pushes).toHaveLength(1);
    const again = await harness.run(17300);
    expect(again.ok).toBe(true);
    expect(harness.inbox.size).toBe(1);
    expect(harness.pushes).toHaveLength(1);
    expect(harness.logs).toHaveLength(1);
  });

  it("E — tombstone : aucune recréation, aucun Push", async () => {
    const harness = createUpdateHarness({
      current: vehicle(),
      planEntries: [planEntry({ next_due_km: 15000 })],
      dismissedKeys: ["user-a::maintenance_due:entry-1:15000:none"]
    });
    const result = await harness.run(17280);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.notifications).toMatchObject({ persisted: 0, dismissed: 1, sent: 0 });
    }
    expect(harness.inbox.size).toBe(0);
    expect(harness.pushes).toHaveLength(0);
  });

  it("F — nouvelle échéance / nouvelle dedupe_key : notification autorisée", async () => {
    const harness = createUpdateHarness({
      current: vehicle({ kilometrage: 21600, last_odometer_value: 21600 }),
      planEntries: [planEntry({ last_done_km: 11800, next_due_km: 21800 })]
    });
    await harness.run(21850);
    expect(harness.inbox.size).toBe(1);
    expect([...harness.inbox.values()][0].dedupeKey).toBe("maintenance_due:entry-1:21800:none");
  });

  it("G — échec écriture km : pipeline notification jamais lancé", async () => {
    const harness = createUpdateHarness({
      current: vehicle(),
      planEntries: [planEntry({ next_due_km: 15000 })],
      writeFails: true
    });
    const result = await harness.run(17280);
    expect(result).toMatchObject({ ok: false, reason: "write_failed" });
    expect(harness.loadPlanEntries).not.toHaveBeenCalled();
    expect(harness.inbox.size).toBe(0);
    expect(harness.pushes).toHaveLength(0);
  });

  it("H — échec notification après succès km : km conservé, cron pourra rattraper", async () => {
    const harness = createUpdateHarness({
      current: vehicle(),
      planEntries: [planEntry({ next_due_km: 15000 })],
      notificationThrows: true
    });
    const result = await harness.run(17280);
    expect(result).toEqual({ ok: true, kilometrage: 17280, notifications: null });
    expect(harness.persistKilometrage).toHaveBeenCalledTimes(1);
    expect(harness.onNotificationError).toHaveBeenCalledWith("notify_down");
    expect(harness.inbox.size).toBe(0);
  });

  it("I — cron du lendemain : aucune duplication, aucun Push bis", async () => {
    const harness = createUpdateHarness({
      current: vehicle(),
      planEntries: [planEntry({ next_due_km: 15000 })]
    });
    await harness.run(17280);
    expect(harness.inbox.size).toBe(1);
    expect(harness.pushes).toHaveLength(1);

    const updated = {
      ...vehicle(),
      kilometrage: 17280,
      last_odometer_value: 17280,
      last_odometer_date: "2026-08-24"
    };
    const cron = await processNotificationCron({
      now: new Date("2026-08-25T08:00:00.000Z"),
      loadVehicles: async () => [updated],
      loadPlanEntries: async () => [planEntry({ next_due_km: 15000 })],
      persistAlert: harness.notificationDeps.persistAlert,
      loadPushUserIds: harness.notificationDeps.loadPushUserIds,
      sendPush: harness.notificationDeps.sendPush,
      markPushed: harness.notificationDeps.markPushed!,
      logPushSuccess: harness.notificationDeps.logPushSuccess
    });
    expect(cron.candidates).toBe(1);
    expect(harness.inbox.size).toBe(1);
    expect(harness.pushes).toHaveLength(1);
    expect(harness.logs).toHaveLength(1);
    expect(cron.sent).toBe(0);
  });

  it("refuse un véhicule qui n'appartient pas à l'utilisateur", async () => {
    const persistKilometrage = vi.fn();
    const result = await updateVehicleKilometrage({
      userId: "user-a",
      vehicleId: "veh-b",
      kilometrage: 17280,
      now: NOW,
      loadOwnedVehicle: async () => null,
      persistKilometrage,
      loadPlanEntries: async () => [],
      notificationDeps: createPipeline({}).notificationDeps
    });
    expect(result).toEqual({ ok: false, reason: "not_found" });
    expect(persistKilometrage).not.toHaveBeenCalled();
  });
});
