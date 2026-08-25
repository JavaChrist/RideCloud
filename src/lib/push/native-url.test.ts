import { describe, expect, it } from "vitest";
import { extractPushNotificationHref, resolveRideCloudPushHref } from "@/lib/push/native-url";

describe("resolveRideCloudPushHref", () => {
  it("accepte un chemin RideCloud interne", () => {
    expect(resolveRideCloudPushHref("/vehicule/abc-1?tab=plan-entretien")).toBe(
      "/vehicule/abc-1?tab=plan-entretien"
    );
  });

  it("rejette une URL externe ou protocol-relative", () => {
    expect(resolveRideCloudPushHref("https://evil.test/phish")).toBe("/categories");
    expect(resolveRideCloudPushHref("//evil.test/phish")).toBe("/categories");
    expect(resolveRideCloudPushHref("javascript:alert(1)")).toBe("/categories");
  });
});

describe("extractPushNotificationHref", () => {
  it("navigue vers payload.url RideCloud valide", () => {
    expect(
      extractPushNotificationHref({
        data: { url: "/vehicule/18910c21-1a1d-4021-8a71-08b04ae87d69?tab=plan-entretien" }
      })
    ).toBe("/vehicule/18910c21-1a1d-4021-8a71-08b04ae87d69?tab=plan-entretien");
  });

  it("retombe sur /categories si la destination est absente ou externe", () => {
    expect(extractPushNotificationHref({ data: {} })).toBe("/categories");
    expect(extractPushNotificationHref({ data: { url: "https://example.com" } })).toBe("/categories");
  });
});
