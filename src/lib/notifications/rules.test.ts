import { describe, expect, it } from "vitest";
import {
  canAccessNotification,
  countUnreadNotifications,
  filterNotificationsForUser,
  isOccurrenceDismissed,
  isSameUserDedupeKey,
  isUnreadNotification
} from "./rules";

const userA = "user-a";
const userB = "user-b";

describe("isolation utilisateur", () => {
  it("l'utilisateur A ne voit que ses notifications", () => {
    const rows = [
      { id: "1", user_id: userA, title: "A1" },
      { id: "2", user_id: userB, title: "B1" },
      { id: "3", user_id: userA, title: "A2" }
    ];
    expect(filterNotificationsForUser(rows, userA).map((row) => row.id)).toEqual(["1", "3"]);
    expect(filterNotificationsForUser(rows, userB).map((row) => row.id)).toEqual(["2"]);
  });

  it("un utilisateur ne peut pas marquer la notification d'un autre", () => {
    expect(canAccessNotification(userA, userA)).toBe(true);
    expect(canAccessNotification(userA, userB)).toBe(false);
  });
});

describe("unread count", () => {
  it("ne compte que read_at IS NULL", () => {
    expect(
      countUnreadNotifications([
        { read_at: null },
        { read_at: "2026-08-23T10:00:00.000Z" },
        { read_at: null }
      ])
    ).toBe(2);
  });

  it("mark read retire la ligne du compteur, un second mark est idempotent", () => {
    const rows = [{ read_at: null as string | null }];
    expect(isUnreadNotification(rows[0].read_at)).toBe(true);
    rows[0].read_at = "2026-08-23T10:00:00.000Z";
    expect(isUnreadNotification(rows[0].read_at)).toBe(false);
    expect(countUnreadNotifications(rows)).toBe(0);
    const alreadyRead = rows[0].read_at;
    rows[0].read_at = alreadyRead;
    expect(countUnreadNotifications(rows)).toBe(0);
  });
});

describe("dedupe_key", () => {
  it("le même couple user + dedupe_key entre en conflit", () => {
    expect(
      isSameUserDedupeKey(
        { user_id: userA, dedupe_key: "odometer_refresh:veh-1" },
        { user_id: userA, dedupe_key: "odometer_refresh:veh-1" }
      )
    ).toBe(true);
  });

  it("le même dedupe_key est autorisé pour deux utilisateurs", () => {
    expect(
      isSameUserDedupeKey(
        { user_id: userA, dedupe_key: "maintenance_due:entry-1" },
        { user_id: userB, dedupe_key: "maintenance_due:entry-1" }
      )
    ).toBe(false);
  });

  it("un tombstone (user_id, dedupe_key) bloque seulement le propriétaire", () => {
    const dismissals = [{ user_id: userA, dedupe_key: "maintenance_due:entry-1:10200:none" }];
    expect(
      isOccurrenceDismissed(dismissals, {
        user_id: userA,
        dedupe_key: "maintenance_due:entry-1:10200:none"
      })
    ).toBe(true);
    expect(
      isOccurrenceDismissed(dismissals, {
        user_id: userB,
        dedupe_key: "maintenance_due:entry-1:10200:none"
      })
    ).toBe(false);
    expect(
      isOccurrenceDismissed(dismissals, {
        user_id: userA,
        dedupe_key: "maintenance_due:entry-1:21800:none"
      })
    ).toBe(false);
  });
});
