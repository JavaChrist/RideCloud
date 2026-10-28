import { describe, expect, it } from "vitest";
import { PLANS } from "@/lib/billing/plans";
import {
  getPlayCatalogEntry,
  listPlayProductIds,
  resolvePlayCatalog
} from "@/lib/billing/play-products";

describe("catalogue Google Play", () => {
  it("sélectionne explicitement productId + basePlanId pour chaque formule", () => {
    const cases = [
      ["premium", "monthly", "ridecloud_premium", "premium-monthly"] as const,
      ["premium", "yearly", "ridecloud_premium", "premium-yearly"] as const,
      ["family", "monthly", "ridecloud_family", "family-monthly"] as const,
      ["family", "yearly", "ridecloud_family", "family-yearly"] as const
    ];

    for (const [plan, interval, productId, basePlanId] of cases) {
      const entry = getPlayCatalogEntry(plan, interval);
      expect(entry).toMatchObject({
        productId,
        basePlanId,
        plan,
        interval,
        priceEuros: interval === "monthly" ? PLANS[plan].price.monthly : PLANS[plan].price.yearly
      });
      expect(resolvePlayCatalog(productId, basePlanId)).toEqual(entry);
    }
  });

  it("n'expose que deux abonnements, sans essai", () => {
    expect(listPlayProductIds()).toEqual(["ridecloud_premium", "ridecloud_family"]);
    expect(resolvePlayCatalog("ridecloud_premium")).toBeNull();
  });

  it("lit les anciens identifiants à 4 produits uniquement en secours", () => {
    expect(resolvePlayCatalog("ridecloud_premium_monthly")).toMatchObject({
      productId: "ridecloud_premium",
      basePlanId: "premium-monthly"
    });
    expect(resolvePlayCatalog("unknown", "premium-monthly")).toBeNull();
  });
});
