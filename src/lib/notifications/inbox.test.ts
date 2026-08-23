import { describe, expect, it } from "vitest";
import type { AppNotification } from "./types";
import {
  applyMarkAllRead,
  applyMarkOneRead,
  formatUnreadAriaLabel,
  formatUnreadBadge,
  isSafeInternalHref,
  sortInboxNotifications
} from "./inbox";
import { canAccessNotification } from "./rules";

function row(overrides: Partial<AppNotification> = {}): AppNotification {
  return {
    id: "n1",
    userId: "user-a",
    vehicleId: "veh-1",
    type: "maintenance_due",
    title: "Vidange",
    body: "À prévoir",
    href: "/vehicule/veh-1?tab=plan-entretien",
    dedupeKey: "k1",
    metadata: {},
    createdAt: "2026-08-23T08:00:00.000Z",
    readAt: null,
    lastPushedAt: null,
    ...overrides
  };
}

describe("formatUnreadBadge", () => {
  it("n'affiche rien pour 0", () => {
    expect(formatUnreadBadge(0)).toBeNull();
  });

  it("affiche le nombre réel entre 1 et 99", () => {
    expect(formatUnreadBadge(1)).toBe("1");
    expect(formatUnreadBadge(99)).toBe("99");
  });

  it("plafonne au-delà de 99", () => {
    expect(formatUnreadBadge(100)).toBe("99+");
    expect(formatUnreadBadge(240)).toBe("99+");
  });
});

describe("formatUnreadAriaLabel", () => {
  it("décrit le compteur pour le lecteur d'écran", () => {
    expect(formatUnreadAriaLabel(0)).toBe("Notifications, aucune non lue");
    expect(formatUnreadAriaLabel(1)).toBe("Notifications, 1 non lue");
    expect(formatUnreadAriaLabel(2)).toBe("Notifications, 2 non lues");
  });
});

describe("sortInboxNotifications", () => {
  it("place les non lues avant les lues", () => {
    const sorted = sortInboxNotifications([
      row({ id: "read", readAt: "2026-08-23T10:00:00.000Z", createdAt: "2026-08-23T12:00:00.000Z" }),
      row({ id: "unread", readAt: null, createdAt: "2026-08-20T08:00:00.000Z" })
    ]);
    expect(sorted.map((item) => item.id)).toEqual(["unread", "read"]);
  });

  it("place overdue non lu avant due_soon non lu", () => {
    const sorted = sortInboxNotifications([
      row({
        id: "soon",
        metadata: { status: "due_soon" },
        createdAt: "2026-08-23T12:00:00.000Z"
      }),
      row({
        id: "late",
        metadata: { status: "overdue" },
        createdAt: "2026-08-20T08:00:00.000Z"
      })
    ]);
    expect(sorted.map((item) => item.id)).toEqual(["late", "soon"]);
  });

  it("trie created_at DESC à priorité équivalente", () => {
    const sorted = sortInboxNotifications([
      row({ id: "old", metadata: { status: "stale" }, createdAt: "2026-08-20T08:00:00.000Z" }),
      row({ id: "new", metadata: { status: "stale" }, createdAt: "2026-08-23T08:00:00.000Z" })
    ]);
    expect(sorted.map((item) => item.id)).toEqual(["new", "old"]);
  });
});

describe("lecture et tout lu", () => {
  it("mark one diminue le compteur après succès", () => {
    const rows = [row({ id: "a" }), row({ id: "b" })];
    const next = applyMarkOneRead(rows, "a", "2026-08-23T21:00:00.000Z");
    expect(next.filter((item) => item.readAt == null)).toHaveLength(1);
    expect(next.find((item) => item.id === "a")?.readAt).toBe("2026-08-23T21:00:00.000Z");
  });

  it("une notification étrangère reste protégée", () => {
    expect(canAccessNotification("user-a", "user-b")).toBe(false);
    expect(canAccessNotification("user-a", "user-a")).toBe(true);
  });

  it("tout lu met le compteur à 0", () => {
    const rows = [row({ id: "a" }), row({ id: "b", readAt: "2026-08-22T08:00:00.000Z" })];
    const next = applyMarkAllRead(rows, "2026-08-23T21:00:00.000Z");
    expect(next.every((item) => item.readAt != null)).toBe(true);
    expect(next.filter((item) => item.readAt == null)).toHaveLength(0);
  });
});

describe("navigation href", () => {
  it("accepte uniquement les href internes RideCloud", () => {
    expect(isSafeInternalHref("/vehicule/abc")).toBe(true);
    expect(isSafeInternalHref("/vehicule/abc?tab=plan-entretien")).toBe(true);
  });

  it("refuse les href externes ou invalides", () => {
    expect(isSafeInternalHref(null)).toBe(false);
    expect(isSafeInternalHref("https://evil.example/phish")).toBe(false);
    expect(isSafeInternalHref("//evil.example")).toBe(false);
    expect(isSafeInternalHref("javascript:alert(1)")).toBe(false);
  });
});
