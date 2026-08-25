import { describe, expect, it } from "vitest";
import { registerNativePushToken, unregisterNativePushToken } from "@/lib/push/native-register";
import { createNativeTokensTable } from "@/lib/push/native-table-mock";

function adminFrom(table: ReturnType<typeof createNativeTokensTable>) {
  return {
    from: (name: string) => {
      if (name !== "native_push_tokens") {
        throw new Error(`unexpected table ${name}`);
      }
      return table.from();
    }
  };
}

describe("registerNativePushToken", () => {
  it("utilisateur connecté + token → upsert OK", async () => {
    const table = createNativeTokensTable();
    const result = await registerNativePushToken({
      admin: adminFrom(table),
      sessionUserId: "user-a",
      token: "fcm-token-aaaa",
      platform: "android",
      installationId: "inst-1"
    });
    expect(result).toEqual({ ok: true });
    expect(table.rows).toHaveLength(1);
    expect(table.rows[0]).toMatchObject({
      user_id: "user-a",
      token: "fcm-token-aaaa",
      installation_id: "inst-1"
    });
  });

  it("impossible d'enregistrer pour un autre user", async () => {
    const table = createNativeTokensTable();
    const result = await registerNativePushToken({
      admin: adminFrom(table),
      sessionUserId: "user-a",
      requestedUserId: "user-b",
      token: "fcm-token-aaaa",
      platform: "android",
      installationId: "inst-1"
    });
    expect(result).toEqual({ ok: false, status: 403, reason: "forbidden" });
    expect(table.rows).toHaveLength(0);
  });

  it("même token → pas de doublon", async () => {
    const table = createNativeTokensTable([
      {
        id: "native-1",
        user_id: "user-a",
        platform: "android",
        token: "fcm-token-aaaa",
        installation_id: "inst-1"
      }
    ]);
    const result = await registerNativePushToken({
      admin: adminFrom(table),
      sessionUserId: "user-a",
      token: "fcm-token-aaaa",
      platform: "android",
      installationId: "inst-1"
    });
    expect(result).toEqual({ ok: true });
    expect(table.rows).toHaveLength(1);
    expect(table.rows[0].id).toBe("native-1");
  });

  it("2 appareils → 2 tokens possibles", async () => {
    const table = createNativeTokensTable();
    await registerNativePushToken({
      admin: adminFrom(table),
      sessionUserId: "user-a",
      token: "fcm-token-phone",
      platform: "android",
      installationId: "inst-phone"
    });
    await registerNativePushToken({
      admin: adminFrom(table),
      sessionUserId: "user-a",
      token: "fcm-token-tablet",
      platform: "android",
      installationId: "inst-tablet"
    });
    expect(table.rows).toHaveLength(2);
    expect(table.rows.map((row) => row.token).sort()).toEqual(["fcm-token-phone", "fcm-token-tablet"]);
  });
});

describe("unregisterNativePushToken", () => {
  it("logout : association token / user supprimée pour l'installation", async () => {
    const table = createNativeTokensTable([
      {
        id: "native-1",
        user_id: "user-a",
        platform: "android",
        token: "fcm-token-phone",
        installation_id: "inst-phone"
      },
      {
        id: "native-2",
        user_id: "user-a",
        platform: "android",
        token: "fcm-token-tablet",
        installation_id: "inst-tablet"
      }
    ]);
    const result = await unregisterNativePushToken({
      admin: adminFrom(table),
      sessionUserId: "user-a",
      installationId: "inst-phone"
    });
    expect(result).toEqual({ ok: true });
    expect(table.rows).toHaveLength(1);
    expect(table.rows[0].installation_id).toBe("inst-tablet");
  });
});
