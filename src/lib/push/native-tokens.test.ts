import { describe, expect, it } from "vitest";
import {
  assertNativeTokenOwner,
  collectPushRecipientIds,
  isInvalidFcmError,
  planNativeTokenUpsert
} from "@/lib/push/native-tokens";

describe("assertNativeTokenOwner", () => {
  it("refuse d'enregistrer pour un autre user", () => {
    expect(
      assertNativeTokenOwner({
        sessionUserId: "user-a",
        requestedUserId: "user-b"
      })
    ).toBe(false);
  });

  it("accepte si aucun user_id client n'est fourni", () => {
    expect(assertNativeTokenOwner({ sessionUserId: "user-a" })).toBe(true);
  });
});

describe("collectPushRecipientIds", () => {
  it("unionne Web Push et tokens natifs sans doublon", () => {
    expect([...collectPushRecipientIds(["user-a"], ["user-a", "user-b"])].sort()).toEqual([
      "user-a",
      "user-b"
    ]);
  });
});

describe("isInvalidFcmError", () => {
  it("détecte un token FCM invalide", () => {
    expect(isInvalidFcmError("messaging/registration-token-not-registered")).toBe(true);
    expect(isInvalidFcmError("messaging/invalid-registration-token")).toBe(true);
    expect(isInvalidFcmError("unavailable")).toBe(false);
  });
});

describe("planNativeTokenUpsert", () => {
  it("met à jour le même token sans insert", () => {
    const plan = planNativeTokenUpsert({
      sessionUserId: "user-a",
      platform: "android",
      token: "tok-1",
      installationId: "inst-1",
      existingByToken: {
        id: "row-1",
        user_id: "user-a",
        platform: "android",
        token: "tok-1",
        installation_id: "inst-1"
      },
      existingByInstallation: null
    });
    expect(plan).toEqual({ action: "update", targetId: "row-1", userId: "user-a" });
  });

  it("remplace le token de la même installation", () => {
    const plan = planNativeTokenUpsert({
      sessionUserId: "user-a",
      platform: "android",
      token: "tok-2",
      installationId: "inst-1",
      existingByToken: null,
      existingByInstallation: {
        id: "row-1",
        user_id: "user-a",
        platform: "android",
        token: "tok-1",
        installation_id: "inst-1"
      }
    });
    expect(plan).toEqual({ action: "update", targetId: "row-1", userId: "user-a" });
  });

  it("insère un second appareil", () => {
    const plan = planNativeTokenUpsert({
      sessionUserId: "user-a",
      platform: "android",
      token: "tok-b",
      installationId: "inst-2",
      existingByToken: null,
      existingByInstallation: null
    });
    expect(plan).toEqual({ action: "insert", userId: "user-a" });
  });
});
