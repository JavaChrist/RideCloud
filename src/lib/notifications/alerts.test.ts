import { describe, expect, it } from "vitest";
import { collectNotificationAlerts } from "./alerts";
import { buildMaintenanceDedupeKey, buildOdometerDedupeKey } from "./dedupe";
import type { MaintenancePlanEntry, Vehicle } from "@/types/database";

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

describe("collectNotificationAlerts", () => {
  it("émet un rappel compteur pour un véhicule stale, sans filtre Push", () => {
    const alerts = collectNotificationAlerts({
      vehicles: [vehicle({ last_odometer_date: "2026-07-20" })],
      planEntries: [],
      now: NOW
    });
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({
      userId: "user-a",
      type: "odometer_refresh",
      status: "stale",
      dedupeKey: buildOdometerDedupeKey({
        vehicleId: "veh-1",
        lastOdometerDate: "2026-07-20"
      })
    });
  });

  it("émet une alerte entretien due_soon puis overdue avec la même clé", () => {
    const soon = collectNotificationAlerts({
      vehicles: [vehicle()],
      planEntries: [planEntry()],
      now: NOW
    });
    const overdue = collectNotificationAlerts({
      vehicles: [vehicle({ kilometrage: 10300, last_odometer_value: 10300 })],
      planEntries: [planEntry()],
      now: NOW
    });
    expect(soon[0].status).toBe("due_soon");
    expect(overdue[0].status).toBe("overdue");
    expect(soon[0].dedupeKey).toBe(overdue[0].dedupeKey);
    expect(soon[0].dedupeKey).toBe(
      buildMaintenanceDedupeKey({
        planEntryId: "entry-1",
        nextDueKm: 10200,
        nextDueDate: null
      })
    );
  });

  it("n'émet plus l'ancienne échéance après recalcul, et permet une future occurrence", () => {
    const resolved = collectNotificationAlerts({
      vehicles: [vehicle({ kilometrage: 11800, last_odometer_value: 11800 })],
      planEntries: [
        planEntry({
          last_done_km: 11800,
          last_done_date: "2026-08-20",
          next_due_km: 21800,
          next_due_date: null,
          status: "upcoming"
        })
      ],
      now: NOW
    });
    expect(resolved).toHaveLength(0);

    const nextOccurrence = collectNotificationAlerts({
      vehicles: [vehicle({ kilometrage: 21600, last_odometer_value: 21600 })],
      planEntries: [
        planEntry({
          last_done_km: 11800,
          last_done_date: "2026-08-20",
          next_due_km: 21800,
          next_due_date: null
        })
      ],
      now: NOW
    });
    expect(nextOccurrence).toHaveLength(1);
    expect(nextOccurrence[0].dedupeKey).toBe(
      buildMaintenanceDedupeKey({
        planEntryId: "entry-1",
        nextDueKm: 21800,
        nextDueDate: null
      })
    );
    expect(nextOccurrence[0].dedupeKey).not.toBe(
      buildMaintenanceDedupeKey({
        planEntryId: "entry-1",
        nextDueKm: 10200,
        nextDueDate: null
      })
    );
  });
});
