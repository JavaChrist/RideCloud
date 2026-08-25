import { beforeEach, describe, expect, it } from "vitest";
import { sendNativePushToUser } from "@/lib/push/native-send";
import { createNativeTokensTable } from "@/lib/push/native-table-mock";

describe("sendNativePushToUser", () => {
  const table = createNativeTokensTable();
  const admin = {
    from: (name: string) => {
      if (name !== "native_push_tokens") {
        throw new Error(`unexpected table ${name}`);
      }
      return table.from();
    }
  };

  beforeEach(() => {
    table.rows.splice(0, table.rows.length);
    table.rows.push({
      id: "native-1",
      user_id: "user-a",
      platform: "android",
      token: "fcm-live",
      installation_id: "inst-1"
    });
  });

  it("purge uniquement un token FCM invalide", async () => {
    const outcomes = await sendNativePushToUser(
      "user-a",
      { title: "t", body: "b" },
      async () => ({
        success: false,
        invalidToken: true,
        error: "unregistered"
      }),
      admin as never
    );
    expect(outcomes[0]).toMatchObject({ success: false, removed: true, error: "token_invalid" });
    expect(table.rows).toHaveLength(0);
  });

  it("ne supprime pas un token valide si le provider est indisponible", async () => {
    const outcomes = await sendNativePushToUser(
      "user-a",
      { title: "t", body: "b" },
      async () => ({
        success: false,
        invalidToken: false,
        error: "unavailable"
      }),
      admin as never
    );
    expect(outcomes[0]).toMatchObject({ success: false, error: "unavailable" });
    expect(table.rows).toHaveLength(1);
  });
});
