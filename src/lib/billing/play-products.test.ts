import { describe, expect, it } from "vitest";
import { PLANS } from "@/lib/billing/plans";
import {
  getPlayProduct,
  getPlayProductId,
  listPlayProductIds
} from "@/lib/billing/play-products";

describe("catalogue Google Play", () => {
  it("aligne chaque produit Play sur le même plan, intervalle et prix que le web", () => {
    const cases = [
      ["premium", "monthly"] as const,
      ["premium", "yearly"] as const,
      ["family", "monthly"] as const,
      ["family", "yearly"] as const
    ];

    for (const [plan, interval] of cases) {
      const product = getPlayProduct(getPlayProductId(plan, interval));
      expect(product).toMatchObject({
        plan,
        interval,
        priceEuros: interval === "monthly" ? PLANS[plan].price.monthly : PLANS[plan].price.yearly
      });
      expect(product?.priceEuros).toBeGreaterThan(0);
    }
  });

  it("n'expose aucun produit d'essai gratuit", () => {
    for (const productId of listPlayProductIds()) {
      const product = getPlayProduct(productId);
      expect(product?.priceEuros).not.toBe(0);
      expect(productId).not.toMatch(/trial|essai/i);
    }
  });
});
