import { describe, expect, it } from "vitest";
import { isFamilyPlanActive } from "@/lib/family/household";
import {
  hasOpenPaidSubscription,
  playPurchaseBelongsToUser,
  resolvePlayEntitlement
} from "@/lib/billing/play-state";

describe("hasOpenPaidSubscription", () => {
  it("préserve un abonnement Mollie ou Play encore facturé", () => {
    expect(
      hasOpenPaidSubscription({
        plan: "premium",
        planStatus: "active",
        canceledAt: null,
        mollieSubscriptionId: "sub_mollie"
      })
    ).toBe(true);
    expect(
      hasOpenPaidSubscription({
        plan: "family",
        planStatus: "active",
        canceledAt: null,
        playPurchaseToken: "play-token"
      })
    ).toBe(true);
  });

  it("autorise un nouveau checkout après annulation, sans toucher au Free", () => {
    expect(
      hasOpenPaidSubscription({
        plan: "family",
        planStatus: "active",
        canceledAt: "2026-10-01T00:00:00.000Z",
        playPurchaseToken: "play-token"
      })
    ).toBe(false);
    expect(hasOpenPaidSubscription({ plan: "free", planStatus: "active" })).toBe(false);
  });
});

describe("resolvePlayEntitlement", () => {
  const now = new Date("2026-10-28T12:00:00.000Z");

  it("garde Family actif jusqu'à la fin de période Play, puis retire les droits foyer", () => {
    const stillPaid = resolvePlayEntitlement({
      subscriptionState: "SUBSCRIPTION_STATE_CANCELED",
      expiryTime: "2026-11-28T12:00:00.000Z",
      now
    });
    expect(stillPaid.expired).toBe(false);
    expect(stillPaid.planStatus).toBe("active");
    expect(
      isFamilyPlanActive({
        plan: "family",
        planStatus: stillPaid.planStatus,
        canceledAt: stillPaid.canceledAt,
        renewsAt: stillPaid.renewsAt
      })
    ).toBe(true);

    const expired = resolvePlayEntitlement({
      subscriptionState: "SUBSCRIPTION_STATE_EXPIRED",
      expiryTime: "2026-09-01T12:00:00.000Z",
      now
    });
    expect(expired.expired).toBe(true);
    expect(
      isFamilyPlanActive({
        plan: "family",
        planStatus: expired.planStatus,
        canceledAt: expired.canceledAt,
        renewsAt: expired.renewsAt
      })
    ).toBe(false);
  });
});

describe("playPurchaseBelongsToUser", () => {
  it("refuse un jeton lié à un autre compte", () => {
    const userId = "11111111-1111-1111-1111-111111111111";
    expect(playPurchaseBelongsToUser(userId, userId)).toBe(true);
    expect(playPurchaseBelongsToUser("other-account", userId)).toBe(false);
    expect(playPurchaseBelongsToUser(null, userId)).toBe(false);
  });
});
