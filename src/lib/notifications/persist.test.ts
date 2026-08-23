import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, NotificationRow } from "@/types/database";
import type { NotificationAlert } from "./alerts";
import {
  buildNotificationUpsertRow,
  insertNotificationLog,
  markNotificationPushed,
  persistBusinessNotification
} from "./persist";

function alert(overrides: Partial<NotificationAlert> = {}): NotificationAlert {
  return {
    userId: "user-a",
    vehicleId: "veh-1",
    type: "maintenance_due",
    status: "due_soon",
    subjectId: "entry-1",
    title: "Vidange dans 200 km — La noire",
    body: "Pense à planifier",
    href: "/vehicule/veh-1?tab=plan-entretien",
    dedupeKey: "maintenance_due:entry-1:10200:none",
    tag: "maintenance-entry-1",
    metadata: { status: "due_soon", subjectId: "entry-1" },
    ...overrides
  };
}

function createMemoryAdmin() {
  const notifications: NotificationRow[] = [];
  const logs: Array<Record<string, unknown>> = [];

  const client = {
    from(table: string) {
      if (table === "notifications") {
        return {
          select() {
            return {
              eq(column: string, value: string) {
                return {
                  eq(column2: string, value2: string) {
                    return {
                      async maybeSingle() {
                        const row = notifications.find(
                          (item) =>
                            item[column as "user_id"] === value &&
                            item[column2 as "dedupe_key"] === value2
                        );
                        return { data: row ?? null, error: null };
                      }
                    };
                  }
                };
              }
            };
          },
          upsert(row: Record<string, unknown>) {
            return {
              select() {
                return {
                  async single() {
                    const index = notifications.findIndex(
                      (item) =>
                        item.user_id === row.user_id && item.dedupe_key === row.dedupe_key
                    );
                    if (index < 0) {
                      const created: NotificationRow = {
                        id: `n-${notifications.length + 1}`,
                        user_id: String(row.user_id),
                        vehicle_id: String(row.vehicle_id),
                        type: String(row.type),
                        title: String(row.title),
                        body: String(row.body),
                        href: String(row.href),
                        dedupe_key: String(row.dedupe_key),
                        metadata: (row.metadata as Record<string, unknown>) ?? {},
                        created_at: "2026-08-23T08:00:00.000Z",
                        read_at: (row.read_at as string | null | undefined) ?? null,
                        last_pushed_at: (row.last_pushed_at as string | null | undefined) ?? null
                      };
                      notifications.push(created);
                      return { data: created, error: null };
                    }
                    const current = notifications[index];
                    const updated: NotificationRow = {
                      ...current,
                      title: String(row.title ?? current.title),
                      body: String(row.body ?? current.body),
                      href: String(row.href ?? current.href),
                      metadata: (row.metadata as Record<string, unknown>) ?? current.metadata,
                      read_at: "read_at" in row ? (row.read_at as string | null) : current.read_at,
                      last_pushed_at:
                        "last_pushed_at" in row
                          ? (row.last_pushed_at as string | null)
                          : current.last_pushed_at
                    };
                    notifications[index] = updated;
                    return { data: updated, error: null };
                  }
                };
              }
            };
          },
          update(patch: Record<string, unknown>) {
            return {
              async eq(column: string, value: string) {
                const row = notifications.find((item) => item[column as "id"] === value);
                if (row) Object.assign(row, patch);
                return { error: null };
              }
            };
          }
        };
      }
      if (table === "notification_log") {
        return {
          async insert(row: Record<string, unknown>) {
            logs.push(row);
            return { error: null };
          }
        };
      }
      throw new Error(`unexpected table ${table}`);
    }
  } as unknown as SupabaseClient<Database>;

  return { client, notifications, logs };
}

describe("buildNotificationUpsertRow", () => {
  it("insère une nouvelle occurrence non lue, sans last_pushed_at", () => {
    expect(buildNotificationUpsertRow(alert(), null)).toMatchObject({
      user_id: "user-a",
      dedupe_key: "maintenance_due:entry-1:10200:none",
      read_at: null,
      last_pushed_at: null
    });
  });

  it("ne rouvre pas une occurrence déjà lue au même statut", () => {
    const row = buildNotificationUpsertRow(alert(), {
      read_at: "2026-08-22T08:00:00.000Z",
      last_pushed_at: "2026-08-21T08:00:00.000Z",
      metadata: { status: "due_soon" }
    });
    expect(row.read_at).toBeUndefined();
    expect(row.last_pushed_at).toBeUndefined();
  });

  it("rouvre lors du passage due_soon → overdue", () => {
    const row = buildNotificationUpsertRow(
      alert({
        status: "overdue",
        title: "Vidange en retard — La noire",
        metadata: { status: "overdue" }
      }),
      {
        read_at: "2026-08-22T08:00:00.000Z",
        last_pushed_at: "2026-08-21T08:00:00.000Z",
        metadata: { status: "due_soon" }
      }
    );
    expect(row.read_at).toBeNull();
    expect(row.metadata).toMatchObject({ status: "overdue" });
    expect(row.last_pushed_at).toBeUndefined();
  });
});

describe("persistBusinessNotification", () => {
  it("déduplique deux upserts de la même occurrence", async () => {
    const { client, notifications } = createMemoryAdmin();
    const first = await persistBusinessNotification(client, alert());
    const second = await persistBusinessNotification(
      client,
      alert({ title: "Vidange dans 180 km — La noire" })
    );
    expect(notifications).toHaveLength(1);
    expect(first.id).toBe(second.id);
    expect(second.title).toBe("Vidange dans 180 km — La noire");
    expect(second.read_at).toBeNull();
  });

  it("isole deux utilisateurs qui partagent la même clé métier", async () => {
    const { client, notifications } = createMemoryAdmin();
    await persistBusinessNotification(client, alert());
    await persistBusinessNotification(client, alert({ userId: "user-b" }));
    expect(notifications).toHaveLength(2);
    expect(notifications.map((row) => row.user_id).sort()).toEqual(["user-a", "user-b"]);
    expect(new Set(notifications.map((row) => row.dedupe_key)).size).toBe(1);
  });

  it("deux persist concurrents de la même occurrence restent une seule ligne", async () => {
    const { client, notifications } = createMemoryAdmin();
    const first = persistBusinessNotification(client, alert());
    const second = persistBusinessNotification(
      client,
      alert({ title: "Vidange dans 180 km — La noire" })
    );
    const rows = await Promise.all([first, second]);
    expect(notifications).toHaveLength(1);
    expect(rows[0].id).toBe(rows[1].id);
  });

  it("n'inclut pas created_at dans le payload d'upsert due_soon → overdue", () => {
    const row = buildNotificationUpsertRow(
      alert({
        status: "overdue",
        title: "Vidange en retard — La noire",
        metadata: { status: "overdue" }
      }),
      {
        read_at: "2026-08-22T08:00:00.000Z",
        last_pushed_at: "2026-08-21T08:00:00.000Z",
        metadata: { status: "due_soon" }
      }
    );
    expect(row).not.toHaveProperty("created_at");
    expect(row.read_at).toBeNull();
  });

  it("met à jour last_pushed_at seulement via markNotificationPushed", async () => {
    const { client, notifications, logs } = createMemoryAdmin();
    const row = await persistBusinessNotification(client, alert());
    expect(row.last_pushed_at).toBeNull();
    await markNotificationPushed(client, row.id, new Date("2026-08-23T08:00:00.000Z"));
    await insertNotificationLog(client, {
      userId: "user-a",
      vehicleId: "veh-1",
      kind: "maintenance_due",
      subjectId: "entry-1",
      payload: { title: row.title }
    });
    expect(notifications[0].last_pushed_at).toBe("2026-08-23T08:00:00.000Z");
    expect(logs).toHaveLength(1);
  });
});
