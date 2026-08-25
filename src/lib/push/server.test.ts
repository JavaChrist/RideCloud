import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendNotification = vi.fn();
const setVapidDetails = vi.fn();
const deleteEq = vi.fn().mockResolvedValue({ error: null });
const updateEq = vi.fn().mockResolvedValue({ error: null });

vi.mock("web-push", () => ({
  default: {
    setVapidDetails,
    sendNotification
  }
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table !== "push_subscriptions") {
        throw new Error(`unexpected table ${table}`);
      }
      return {
        delete: () => ({ eq: deleteEq }),
        update: () => ({ eq: updateEq }),
        select: () => ({
          eq: vi.fn(async (_column: string, userId: string) => ({
            data:
              userId === "user-empty"
                ? []
                : [
                    { id: "sub-phone", endpoint: "https://push.example/phone", p256dh: "p1", auth: "a1" },
                    { id: "sub-desktop", endpoint: "https://push.example/desktop", p256dh: "p2", auth: "a2" }
                  ],
            error: null
          }))
        })
      };
    }
  })
}));

const subscription = {
  id: "sub-1",
  endpoint: "https://push.example/phone",
  p256dh: "p1",
  auth: "a1"
};

describe("sendToSubscription 404/410", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "public";
    process.env.VAPID_PRIVATE_KEY = "private";
    process.env.VAPID_CONTACT_EMAIL = "mailto:test@example.com";
    sendNotification.mockReset();
    deleteEq.mockClear();
    updateEq.mockClear();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("purge la subscription sur 410", async () => {
    sendNotification.mockRejectedValue({ statusCode: 410, message: "Gone" });
    const { sendToSubscription } = await import("./server");
    const outcome = await sendToSubscription(subscription, { title: "t", body: "b" });
    expect(outcome).toMatchObject({
      success: false,
      status: 410,
      removed: true,
      error: "subscription_expired"
    });
    expect(deleteEq).toHaveBeenCalledWith("id", "sub-1");
    expect(updateEq).not.toHaveBeenCalled();
  });

  it("purge la subscription sur 404", async () => {
    sendNotification.mockRejectedValue({ statusCode: 404, message: "Not Found" });
    const { sendToSubscription } = await import("./server");
    const outcome = await sendToSubscription(subscription, { title: "t", body: "b" });
    expect(outcome).toMatchObject({
      success: false,
      status: 404,
      removed: true,
      error: "subscription_expired"
    });
    expect(deleteEq).toHaveBeenCalledWith("id", "sub-1");
  });

  it("n'efface pas la subscription sur une autre erreur", async () => {
    sendNotification.mockRejectedValue({ statusCode: 500, message: "upstream" });
    const { sendToSubscription } = await import("./server");
    const outcome = await sendToSubscription(subscription, { title: "t", body: "b" });
    expect(outcome).toMatchObject({ success: false, status: 500 });
    expect(deleteEq).not.toHaveBeenCalled();
    expect(updateEq).toHaveBeenCalledWith("id", "sub-1");
  });
});

describe("sendToUser multi-device", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "public";
    process.env.VAPID_PRIVATE_KEY = "private";
    process.env.VAPID_CONTACT_EMAIL = "mailto:test@example.com";
    sendNotification.mockReset();
    deleteEq.mockClear();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("envoie le même payload à toutes les subscriptions sans s'arrêter au premier succès", async () => {
    sendNotification
      .mockResolvedValueOnce({ statusCode: 201 })
      .mockResolvedValueOnce({ statusCode: 201 });
    const { sendToUser } = await import("./server");
    const outcomes = await sendToUser("user-a", { title: "t", body: "b", tag: "odometer-veh-1" }, async () => []);
    expect(outcomes).toHaveLength(2);
    expect(outcomes.every((outcome) => outcome.success)).toBe(true);
    expect(sendNotification).toHaveBeenCalledTimes(2);
  });

  it("Web seul : pas de token natif → VAPID inchangé", async () => {
    sendNotification.mockResolvedValue({ statusCode: 201 });
    const { sendToUser } = await import("./server");
    const outcomes = await sendToUser("user-a", { title: "t", body: "b" }, async () => []);
    expect(outcomes).toHaveLength(2);
    expect(outcomes.every((outcome) => outcome.success)).toBe(true);
    expect(sendNotification).toHaveBeenCalledTimes(2);
  });

  it("FCM seul : pas Web Push, token Android présent", async () => {
    const { sendToUser } = await import("./server");
    const outcomes = await sendToUser("user-empty", { title: "t", body: "b" }, async () => [
      { endpoint: "fcm:native-1", success: true }
    ]);
    expect(outcomes).toEqual([{ endpoint: "fcm:native-1", success: true }]);
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it("sendToUser orchestre Web Push + FCM", async () => {
    sendNotification.mockResolvedValue({ statusCode: 201 });
    const { sendToUser } = await import("./server");
    const outcomes = await sendToUser("user-a", { title: "t", body: "b" }, async () => [
      { endpoint: "fcm:native-1", success: true }
    ]);
    expect(outcomes).toHaveLength(3);
    expect(outcomes.filter((outcome) => outcome.success)).toHaveLength(3);
    expect(sendNotification).toHaveBeenCalledTimes(2);
  });
});
