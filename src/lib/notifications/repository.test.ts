import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead
} from "./repository";

function notificationRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "n1",
    user_id: "user-a",
    vehicle_id: "veh-1",
    type: "maintenance_due",
    title: "Vidange",
    body: "À prévoir",
    href: "/vehicule/veh-1?tab=plan-entretien",
    dedupe_key: "maintenance_due:entry-1",
    metadata: {},
    created_at: "2026-08-23T08:00:00.000Z",
    read_at: null,
    last_pushed_at: null,
    ...overrides
  };
}

function mockSupabase(handlers: {
  selectResult?: { data: unknown; error: { message: string } | null; count?: number | null };
  rpcError?: { message: string } | null;
}) {
  const limit = vi.fn().mockResolvedValue(handlers.selectResult ?? { data: [], error: null });
  const order = vi.fn().mockReturnValue({ limit });
  const is = vi.fn().mockResolvedValue(handlers.selectResult ?? { data: null, error: null, count: 0 });
  const select = vi.fn().mockReturnValue({ order, is });
  const rpc = vi.fn().mockResolvedValue({ error: handlers.rpcError ?? null });

  const supabase = {
    from: vi.fn().mockReturnValue({ select }),
    rpc
  } as unknown as SupabaseClient<Database>;

  return { supabase, from: supabase.from as ReturnType<typeof vi.fn>, select, order, limit, is, rpc };
}

describe("repository notifications", () => {
  it("liste les notifications par created_at DESC avec une limite", async () => {
    const { supabase, from, select, order, limit } = mockSupabase({
      selectResult: { data: [notificationRow()], error: null }
    });

    const rows = await getNotifications(supabase, { limit: 20 });
    expect(from).toHaveBeenCalledWith("notifications");
    expect(select).toHaveBeenCalledWith("*");
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(limit).toHaveBeenCalledWith(20);
    expect(rows).toEqual([
      {
        id: "n1",
        userId: "user-a",
        vehicleId: "veh-1",
        type: "maintenance_due",
        title: "Vidange",
        body: "À prévoir",
        href: "/vehicule/veh-1?tab=plan-entretien",
        dedupeKey: "maintenance_due:entry-1",
        metadata: {},
        createdAt: "2026-08-23T08:00:00.000Z",
        readAt: null,
        lastPushedAt: null
      }
    ]);
  });

  it("compte les non-lus en base sans télécharger les lignes", async () => {
    const { supabase, select, is } = mockSupabase({
      selectResult: { data: null, error: null, count: 4 }
    });

    await expect(getUnreadNotificationCount(supabase)).resolves.toBe(4);
    expect(select).toHaveBeenCalledWith("id", { count: "exact", head: true });
    expect(is).toHaveBeenCalledWith("read_at", null);
  });

  it("markNotificationRead appelle la RPC sans user_id fourni par le client", async () => {
    const { supabase, rpc } = mockSupabase({});
    await markNotificationRead(supabase, "n1");
    expect(rpc).toHaveBeenCalledWith("mark_notification_read", { notification_id: "n1" });
  });

  it("markAllNotificationsRead n'accepte pas d'user_id cible", async () => {
    const { supabase, rpc } = mockSupabase({});
    await markAllNotificationsRead(supabase);
    expect(rpc).toHaveBeenCalledWith("mark_all_notifications_read");
    expect(rpc.mock.calls[0][1]).toBeUndefined();
  });
});
