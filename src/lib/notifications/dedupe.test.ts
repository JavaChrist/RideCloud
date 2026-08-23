import { describe, expect, it } from "vitest";
import { calculateNextMaintenanceDue } from "@/lib/maintenance";
import {
  MAINTENANCE_PUSH_COOLDOWN_DAYS,
  ODOMETER_PUSH_COOLDOWN_DAYS,
  buildMaintenanceDedupeKey,
  buildOdometerDedupeKey,
  normalizeOccurrenceToken,
  resolveReadAtAfterPersist,
  shouldReopenReadNotification,
  shouldSendPushForNotification
} from "./dedupe";

describe("identité d'occurrence", () => {
  it("normalise une date ISO en YYYY-MM-DD", () => {
    expect(normalizeOccurrenceToken("2026-09-01T22:15:00.000Z")).toBe("2026-09-01");
    expect(normalizeOccurrenceToken("2026-09-01")).toBe("2026-09-01");
    expect(normalizeOccurrenceToken(null)).toBe("none");
    expect(normalizeOccurrenceToken(12000)).toBe("12000");
  });

  it("identifie l'échéance courante, pas la tâche à vie", () => {
    const first = buildMaintenanceDedupeKey({
      planEntryId: "entry-1",
      nextDueKm: 12000,
      nextDueDate: "2026-09-01T00:00:00.000Z"
    });
    const sameOccurrence = buildMaintenanceDedupeKey({
      planEntryId: "entry-1",
      nextDueKm: 12000,
      nextDueDate: "2026-09-01"
    });
    expect(first).toBe("maintenance_due:entry-1:12000:2026-09-01");
    expect(sameOccurrence).toBe(first);
  });

  it("produit une nouvelle clé après réalisation / recalcul", () => {
    const before = buildMaintenanceDedupeKey({
      planEntryId: "entry-1",
      nextDueKm: 12000,
      nextDueDate: null
    });
    const next = calculateNextMaintenanceDue({
      intervalKm: 10000,
      intervalMonths: null,
      firstDueKm: 12000,
      firstDueDate: null,
      lastDoneKm: 11800,
      lastDoneDate: "2026-08-20"
    });
    const after = buildMaintenanceDedupeKey({
      planEntryId: "entry-1",
      nextDueKm: next.nextDueKm,
      nextDueDate: next.nextDueDate
    });
    expect(before).toBe("maintenance_due:entry-1:12000:none");
    expect(after).toBe("maintenance_due:entry-1:21800:none");
    expect(after).not.toBe(before);
  });

  it("distingue deux cycles compteur via last_odometer_date", () => {
    const cycle1 = buildOdometerDedupeKey({
      vehicleId: "veh-1",
      lastOdometerDate: "2026-06-01"
    });
    const cycle2 = buildOdometerDedupeKey({
      vehicleId: "veh-1",
      lastOdometerDate: "2026-08-01"
    });
    expect(cycle1).toBe("odometer_refresh:veh-1:2026-06-01");
    expect(cycle2).toBe("odometer_refresh:veh-1:2026-08-01");
    expect(cycle2).not.toBe(cycle1);
  });
});

describe("due_soon → overdue", () => {
  it("rouvre uniquement lors du passage due_soon → overdue", () => {
    expect(
      shouldReopenReadNotification({ existingStatus: "due_soon", incomingStatus: "overdue" })
    ).toBe(true);
    expect(
      shouldReopenReadNotification({ existingStatus: "overdue", incomingStatus: "overdue" })
    ).toBe(false);
    expect(
      shouldReopenReadNotification({ existingStatus: "due_soon", incomingStatus: "due_soon" })
    ).toBe(false);
  });

  it("remet read_at à null uniquement pour cette transition", () => {
    expect(
      resolveReadAtAfterPersist({
        existingReadAt: "2026-08-20T08:00:00.000Z",
        existingStatus: "due_soon",
        incomingStatus: "overdue"
      })
    ).toBeNull();
    expect(
      resolveReadAtAfterPersist({
        existingReadAt: "2026-08-20T08:00:00.000Z",
        existingStatus: "overdue",
        incomingStatus: "overdue"
      })
    ).toBe("2026-08-20T08:00:00.000Z");
  });
});

describe("cooldown Push via last_pushed_at", () => {
  const now = new Date("2026-08-23T08:00:00.000Z");

  it("n'envoie pas sans abonnement", () => {
    expect(
      shouldSendPushForNotification({
        hasPushSubscription: false,
        lastPushedAt: null,
        cooldownDays: ODOMETER_PUSH_COOLDOWN_DAYS,
        now
      })
    ).toBe(false);
  });

  it("envoie si jamais poussé", () => {
    expect(
      shouldSendPushForNotification({
        hasPushSubscription: true,
        lastPushedAt: null,
        cooldownDays: MAINTENANCE_PUSH_COOLDOWN_DAYS,
        now
      })
    ).toBe(true);
  });

  it("respecte 7 jours entretien et 25 jours compteur", () => {
    expect(
      shouldSendPushForNotification({
        hasPushSubscription: true,
        lastPushedAt: "2026-08-20T08:00:00.000Z",
        cooldownDays: MAINTENANCE_PUSH_COOLDOWN_DAYS,
        now
      })
    ).toBe(false);
    expect(
      shouldSendPushForNotification({
        hasPushSubscription: true,
        lastPushedAt: "2026-08-16T08:00:00.000Z",
        cooldownDays: MAINTENANCE_PUSH_COOLDOWN_DAYS,
        now
      })
    ).toBe(true);
    expect(
      shouldSendPushForNotification({
        hasPushSubscription: true,
        lastPushedAt: "2026-08-01T08:00:00.000Z",
        cooldownDays: ODOMETER_PUSH_COOLDOWN_DAYS,
        now
      })
    ).toBe(false);
    expect(
      shouldSendPushForNotification({
        hasPushSubscription: true,
        lastPushedAt: "2026-07-20T08:00:00.000Z",
        cooldownDays: ODOMETER_PUSH_COOLDOWN_DAYS,
        now
      })
    ).toBe(true);
  });
});
