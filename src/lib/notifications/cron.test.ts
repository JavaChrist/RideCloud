import { describe, expect, it } from "vitest";
import { processNotificationCron, type CronDependencies, type PersistedCronNotification } from "./cron";
import { buildMaintenanceDedupeKey, buildOdometerDedupeKey, shouldReopenReadNotification } from "./dedupe";
import type { NotificationAlert } from "./alerts";
import type { MaintenancePlanEntry, Vehicle } from "@/types/database";
import type { SendOutcome } from "@/lib/push/server";

const NOW = new Date("2026-08-23T08:00:00.000Z");

function vehicle(overrides: Partial<Vehicle> = {}): Vehicle & { user_id: string } {
  return {
    id: "veh-1",
    user_id: "user-a",
    category: "motos",
    marque: "Yamaha",
    modele: "MT-07",
    annee: 2022,
    kilometrage: 10000,
    date_mise_en_circulation: null,
    date_achat: null,
    carburant: null,
    immatriculation: null,
    vin: null,
    surnom: "La noire",
    photo_url: null,
    usage_profile: "often",
    avg_km_per_year: 6000,
    last_odometer_value: 10000,
    last_odometer_date: "2026-07-20",
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
    vehicle_id: "veh-1",
    titre: "Vidange",
    categorie: "moteur",
    description: null,
    interval_km: 10000,
    interval_months: null,
    first_due_km: 12000,
    first_due_date: null,
    last_done_km: null,
    last_done_date: null,
    next_due_km: 10200,
    next_due_date: null,
    due_soon_km_threshold: 500,
    due_soon_days_threshold: 30,
    priority: "normal",
    status: "due_soon",
    source: "manual",
    template_source: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides
  };
}

function createHarness(input: {
  vehicles: Array<Vehicle & { user_id: string }>;
  planEntries?: MaintenancePlanEntry[];
  pushUserIds?: string[];
  sendOutcome?: SendOutcome[];
  dismissedKeys?: string[];
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
    const existingStatus =
      typeof existing.metadata.status === "string" ? existing.metadata.status : null;
    if (shouldReopenReadNotification({ existingStatus, incomingStatus: alert.status })) {
      existing.readAt = null;
    }
    existing.metadata = alert.metadata;
    return existing;
  };

  const deps: CronDependencies = {
    now: NOW,
    loadVehicles: async () => input.vehicles,
    loadPlanEntries: async () => input.planEntries ?? [],
    loadPushUserIds: async () => new Set(input.pushUserIds ?? []),
    persistAlert,
    sendPush: async (userId, payload) => {
      pushes.push({ userId, payload });
      return (
        input.sendOutcome ?? [
          { endpoint: "https://push.example/a", success: true, status: 201 }
        ]
      );
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

  return { deps, inbox, logs, pushes };
}

describe("processNotificationCron", () => {
  it("persiste une inbox sans Push pour un utilisateur sans abonnement", async () => {
    const { deps, inbox, logs, pushes } = createHarness({
      vehicles: [vehicle()],
      pushUserIds: []
    });
    const result = await processNotificationCron(deps);
    expect(result.persisted).toBe(1);
    expect(result.sent).toBe(0);
    expect(pushes).toHaveLength(0);
    expect(logs).toHaveLength(0);
    const row = [...inbox.values()][0];
    expect(row.lastPushedAt).toBeNull();
    expect(row.readAt).toBeNull();
    expect(row.dedupeKey).toBe(
      buildOdometerDedupeKey({ vehicleId: "veh-1", lastOdometerDate: "2026-07-20" })
    );
  });

  it("persiste, pousse et journalise pour un utilisateur abonné", async () => {
    const { deps, inbox, logs, pushes } = createHarness({
      vehicles: [vehicle()],
      pushUserIds: ["user-a"]
    });
    const result = await processNotificationCron(deps);
    expect(result.persisted).toBe(1);
    expect(result.sent).toBe(1);
    expect(pushes).toHaveLength(1);
    expect(pushes[0].payload).toMatchObject({
      title: expect.stringContaining("compteur"),
      tag: "odometer-veh-1"
    });
    expect([...inbox.values()][0].lastPushedAt).toBe(NOW.toISOString());
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      kind: "odometer_refresh",
      userId: "user-a"
    });
  });

  it("déduplique un double cron sur la même occurrence", async () => {
    const harness = createHarness({
      vehicles: [vehicle()],
      pushUserIds: []
    });
    await processNotificationCron(harness.deps);
    const second = await processNotificationCron(harness.deps);
    expect(harness.inbox.size).toBe(1);
    expect(second.persisted).toBe(1);
    expect(second.sent).toBe(0);
  });

  it("le cooldown Push n'empêche pas l'inbox", async () => {
    const harness = createHarness({
      vehicles: [vehicle()],
      pushUserIds: ["user-a"]
    });
    await processNotificationCron(harness.deps);
    expect(harness.pushes).toHaveLength(1);
    const again = await processNotificationCron(harness.deps);
    expect(harness.inbox.size).toBe(1);
    expect(again.persisted).toBe(1);
    expect(again.sent).toBe(0);
    expect(harness.pushes).toHaveLength(1);
    expect(harness.logs).toHaveLength(1);
  });

  it("utilise notification_log comme filet si last_pushed_at est encore null", async () => {
    const harness = createHarness({
      vehicles: [vehicle()],
      pushUserIds: ["user-a"]
    });
    harness.deps.latestLogSentAt = async () => "2026-08-20T08:00:00.000Z";
    const result = await processNotificationCron(harness.deps);
    expect(result.persisted).toBe(1);
    expect(result.sent).toBe(0);
    expect(harness.pushes).toHaveLength(0);
    expect(harness.logs).toHaveLength(0);
    expect([...harness.inbox.values()][0].lastPushedAt).toBeNull();
  });

  it("conserve la notification et n'avance pas last_pushed_at si le Push échoue", async () => {
    const { deps, inbox, logs, pushes } = createHarness({
      vehicles: [vehicle()],
      pushUserIds: ["user-a"],
      sendOutcome: [{ endpoint: "https://push.example/a", success: false, status: 500, error: "upstream" }]
    });
    const result = await processNotificationCron(deps);
    expect(result.persisted).toBe(1);
    expect(result.sent).toBe(0);
    expect(pushes).toHaveLength(1);
    expect(logs).toHaveLength(0);
    expect([...inbox.values()][0].lastPushedAt).toBeNull();
    expect([...inbox.values()][0].readAt).toBeNull();
  });

  it("envoie le même événement à plusieurs subscriptions dans le même run", async () => {
    const harness = createHarness({
      vehicles: [vehicle()],
      pushUserIds: ["user-a"],
      sendOutcome: [
        { endpoint: "https://push.example/phone", success: true, status: 201 },
        { endpoint: "https://push.example/desktop", success: true, status: 201 }
      ]
    });
    const result = await processNotificationCron(harness.deps);
    expect(harness.pushes).toHaveLength(1);
    expect(result.sent).toBe(1);
    expect([...harness.inbox.values()][0].lastPushedAt).toBe(NOW.toISOString());
    expect(harness.logs).toHaveLength(1);
  });

  it("avance last_pushed_at si au moins un Push réussit parmi plusieurs devices", async () => {
    const harness = createHarness({
      vehicles: [vehicle()],
      pushUserIds: ["user-a"],
      sendOutcome: [
        { endpoint: "https://push.example/phone", success: false, status: 500, error: "upstream" },
        { endpoint: "https://push.example/desktop", success: true, status: 201 }
      ]
    });
    const result = await processNotificationCron(harness.deps);
    expect(result.sent).toBe(1);
    expect([...harness.inbox.values()][0].lastPushedAt).toBe(NOW.toISOString());
    expect(harness.logs).toHaveLength(1);
  });

  it("n'avance pas last_pushed_at si tous les Push multi-device échouent", async () => {
    const harness = createHarness({
      vehicles: [vehicle()],
      pushUserIds: ["user-a"],
      sendOutcome: [
        { endpoint: "https://push.example/phone", success: false, status: 500, error: "upstream" },
        { endpoint: "https://push.example/desktop", success: false, status: 503, error: "unavailable" }
      ]
    });
    const result = await processNotificationCron(harness.deps);
    expect(result.sent).toBe(0);
    expect([...harness.inbox.values()][0].lastPushedAt).toBeNull();
    expect(harness.logs).toHaveLength(0);
  });

  it("deux crons concurrents ne créent qu'une notification pour la même occurrence", async () => {
    const harness = createHarness({
      vehicles: [vehicle()],
      pushUserIds: []
    });
    await Promise.all([processNotificationCron(harness.deps), processNotificationCron(harness.deps)]);
    expect(harness.inbox.size).toBe(1);
  });

  it("due_soon → overdue met à jour la même ligne et rouvre si déjà lue", async () => {
    const harness = createHarness({
      vehicles: [vehicle({ last_odometer_date: "2026-08-20" })],
      planEntries: [planEntry()],
      pushUserIds: []
    });
    await processNotificationCron(harness.deps);
    const key = `user-a::${buildMaintenanceDedupeKey({
      planEntryId: "entry-1",
      nextDueKm: 10200,
      nextDueDate: null
    })}`;
    const row = harness.inbox.get(key);
    expect(row?.metadata.status).toBe("due_soon");
    row!.readAt = "2026-08-22T10:00:00.000Z";

    harness.deps.loadVehicles = async () => [
      vehicle({ last_odometer_date: "2026-08-20", kilometrage: 10300, last_odometer_value: 10300 })
    ];
    await processNotificationCron(harness.deps);
    expect(harness.inbox.size).toBe(1);
    expect(row?.metadata.status).toBe("overdue");
    expect(row?.title).toContain("en retard");
    expect(row?.readAt).toBeNull();
  });

  it("une future échéance après résolution crée une nouvelle notification", async () => {
    const harness = createHarness({
      vehicles: [vehicle({ last_odometer_date: "2026-08-20" })],
      planEntries: [planEntry()],
      pushUserIds: []
    });
    await processNotificationCron(harness.deps);
    expect(harness.inbox.size).toBe(1);

    harness.deps.loadVehicles = async () => [
      vehicle({
        last_odometer_date: "2026-08-20",
        kilometrage: 21600,
        last_odometer_value: 21600
      })
    ];
    harness.deps.loadPlanEntries = async () => [
      planEntry({
        last_done_km: 11800,
        last_done_date: "2026-08-20",
        next_due_km: 21800,
        status: "due_soon"
      })
    ];
    await processNotificationCron(harness.deps);
    expect(harness.inbox.size).toBe(2);
    expect(
      [...harness.inbox.values()].map((row) => row.dedupeKey).sort()
    ).toEqual([
      "maintenance_due:entry-1:10200:none",
      "maintenance_due:entry-1:21800:none"
    ]);
  });

  it("ne rouvre pas une notification déjà lue si le statut est inchangé", async () => {
    const harness = createHarness({
      vehicles: [vehicle({ last_odometer_date: "2026-08-20" })],
      planEntries: [planEntry()],
      pushUserIds: []
    });
    await processNotificationCron(harness.deps);
    const row = [...harness.inbox.values()][0];
    row.readAt = "2026-08-22T10:00:00.000Z";
    await processNotificationCron(harness.deps);
    expect(harness.inbox.size).toBe(1);
    expect(row.readAt).toBe("2026-08-22T10:00:00.000Z");
    expect(row.metadata.status).toBe("due_soon");
  });

  it("ne recrée pas une occurrence dismissée et n'envoie pas de Push", async () => {
    const dismissedKey = `user-a::${buildOdometerDedupeKey({
      vehicleId: "veh-1",
      lastOdometerDate: "2026-07-20"
    })}`;
    const { deps, inbox, logs, pushes } = createHarness({
      vehicles: [vehicle()],
      pushUserIds: ["user-a"],
      dismissedKeys: [dismissedKey]
    });
    const result = await processNotificationCron(deps);
    expect(result.persisted).toBe(0);
    expect(result.dismissed).toBe(1);
    expect(result.sent).toBe(0);
    expect(inbox.size).toBe(0);
    expect(pushes).toHaveLength(0);
    expect(logs).toHaveLength(0);
  });

  it("n'entre pas en collision entre deux utilisateurs", async () => {
    const harness = createHarness({
      vehicles: [
        vehicle(),
        vehicle({ id: "veh-2", user_id: "user-b", last_odometer_date: "2026-07-20" })
      ],
      pushUserIds: []
    });
    await processNotificationCron(harness.deps);
    expect(harness.inbox.size).toBe(2);
    const keys = [...harness.inbox.keys()].sort();
    expect(keys[0].startsWith("user-a::")).toBe(true);
    expect(keys[1].startsWith("user-b::")).toBe(true);
  });
});
