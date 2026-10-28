import { describe, expect, it } from "vitest";
import { isPlayPluginMissing } from "@/lib/billing/play-billing-bridge";

describe("pont Google Play Billing", () => {
  it("détecte un APK sans plugin natif", () => {
    expect(isPlayPluginMissing(new Error("PlayBilling.purchase() is not implemented on android"))).toBe(
      true
    );
    expect(isPlayPluginMissing(new Error("UNIMPLEMENTED"))).toBe(true);
    expect(isPlayPluginMissing(new Error("Achat annulé."))).toBe(false);
  });
});
