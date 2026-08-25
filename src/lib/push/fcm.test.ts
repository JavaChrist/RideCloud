import { describe, expect, it } from "vitest";
import { buildFcmMessage, isFirebaseAdminConfigured, sendFcmToToken } from "@/lib/push/fcm";

describe("buildFcmMessage", () => {
  it("envoie notification + data.url pour affichage système hors process JS", () => {
    const message = buildFcmMessage("token-1", {
      title: "Pneus en retard",
      body: "Ouvre l'app pour planifier.",
      url: "/vehicule/abc?tab=plan-entretien",
      tag: "maintenance-1",
      notificationId: "notif-1",
      type: "maintenance_due"
    });
    expect(message.notification).toEqual({
      title: "Pneus en retard",
      body: "Ouvre l'app pour planifier."
    });
    expect(message.data).toMatchObject({
      url: "/vehicule/abc?tab=plan-entretien",
      notificationId: "notif-1",
      type: "maintenance_due"
    });
    expect(message.android?.notification?.channelId).toBe("ridecloud-default");
  });
});

describe("isFirebaseAdminConfigured", () => {
  it("exige les trois variables serveur", () => {
    expect(
      isFirebaseAdminConfigured({
        FIREBASE_PROJECT_ID: "proj",
        FIREBASE_CLIENT_EMAIL: "svc@proj.iam.gserviceaccount.com",
        FIREBASE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n"
      })
    ).toBe(true);
    expect(isFirebaseAdminConfigured({ FIREBASE_PROJECT_ID: "proj" })).toBe(false);
  });
});

describe("sendFcmToToken", () => {
  it("marque un token invalide sans le confondre avec une erreur temporaire", async () => {
    const invalid = await sendFcmToToken("dead-token", { title: "t", body: "b" }, {
      send: async () => {
        throw { code: "messaging/registration-token-not-registered", message: "unregistered" };
      }
    });
    expect(invalid).toMatchObject({ success: false, invalidToken: true });

    const unavailable = await sendFcmToToken("live-token", { title: "t", body: "b" }, {
      send: async () => {
        throw { code: "unavailable", message: "timeout" };
      }
    });
    expect(unavailable).toMatchObject({ success: false, invalidToken: false });
  });
});
