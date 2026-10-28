import { describe, expect, it } from "vitest";
import { isFamilyPlanActive } from "@/lib/family/household";
import {
  founderPlanAfterFamilyExpiry,
  hasPaidPeriodRemaining,
  playPurchaseBelongsToUser,
  playReplacementParams,
  resolvePlayEntitlement,
  resolvePlayPurchaseOwner,
  shouldApplyPlayPlanToProfile
} from "@/lib/billing/play-state";

const now = new Date("2026-10-28T12:00:00.000Z");

describe("hasPaidPeriodRemaining", () => {
  it("bloque un second prestataire tant que la période payée subsiste", () => {
    expect(
      hasPaidPeriodRemaining({
        plan: "premium",
        planStatus: "active",
        canceledAt: null,
        renewsAt: "2026-11-28T12:00:00.000Z",
        mollieSubscriptionId: "sub_mollie",
        now
      })
    ).toBe(true);
    expect(
      hasPaidPeriodRemaining({
        plan: "family",
        planStatus: "active",
        canceledAt: "2026-10-01T00:00:00.000Z",
        renewsAt: "2026-11-28T12:00:00.000Z",
        playPurchaseToken: "play-token",
        now
      })
    ).toBe(true);
    expect(hasPaidPeriodRemaining({ plan: "free", planStatus: "active", now })).toBe(false);
    expect(
      hasPaidPeriodRemaining({
        plan: "premium",
        planStatus: "canceled",
        canceledAt: "2026-09-01T00:00:00.000Z",
        renewsAt: "2026-09-30T00:00:00.000Z",
        playPurchaseToken: "play-token",
        now
      })
    ).toBe(false);
  });
});

describe("resolvePlayEntitlement", () => {
  it("conserve les droits Family pendant la période de grâce", () => {
    const grace = resolvePlayEntitlement({
      subscriptionState: "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
      expiryTime: "2026-11-04T12:00:00.000Z",
      now
    });
    expect(grace.access).toBe("entitled");
    expect(grace.planStatus).toBe("active");
    expect(
      isFamilyPlanActive({
        plan: "family",
        planStatus: grace.planStatus,
        canceledAt: grace.canceledAt,
        renewsAt: grace.renewsAt
      })
    ).toBe(true);
  });

  it("garde les droits d'une résiliation encore payée jusqu'à expiration", () => {
    const stillPaid = resolvePlayEntitlement({
      subscriptionState: "SUBSCRIPTION_STATE_CANCELED",
      expiryTime: "2026-11-28T12:00:00.000Z",
      now
    });
    expect(stillPaid.access).toBe("entitled");
    expect(stillPaid.expired).toBe(false);
    expect(
      isFamilyPlanActive({
        plan: "family",
        planStatus: stillPaid.planStatus,
        canceledAt: stillPaid.canceledAt,
        renewsAt: stillPaid.renewsAt
      })
    ).toBe(true);
  });

  it("ne crée pas de nouveau droit en pending et n'écrase pas un droit existant", () => {
    const pending = resolvePlayEntitlement({
      subscriptionState: "SUBSCRIPTION_STATE_PENDING",
      expiryTime: null,
      now
    });
    expect(pending.access).toBe("pending");
    expect(
      shouldApplyPlayPlanToProfile({
        access: pending.access,
        existingHasPaidRights: true
      })
    ).toBe("keep-existing");
    expect(
      shouldApplyPlayPlanToProfile({
        access: pending.access,
        existingHasPaidRights: false
      })
    ).toBe("apply");
  });

  it("applique l'état Google courant, y compris expiration ou révocation", () => {
    expect(
      shouldApplyPlayPlanToProfile({
        access: "none",
        existingHasPaidRights: true
      })
    ).toBe("apply");
    expect(
      shouldApplyPlayPlanToProfile({
        access: "restricted",
        existingHasPaidRights: true
      })
    ).toBe("apply");
    expect(
      resolvePlayEntitlement({
        subscriptionState: "SUBSCRIPTION_STATE_EXPIRED",
        expiryTime: "2026-09-01T12:00:00.000Z",
        now
      }).access
    ).toBe("none");
  });

  it("restreint hold et pause, puis retire les droits à l'expiration", () => {
    expect(
      resolvePlayEntitlement({
        subscriptionState: "SUBSCRIPTION_STATE_ON_HOLD",
        now
      }).access
    ).toBe("restricted");
    expect(
      resolvePlayEntitlement({
        subscriptionState: "SUBSCRIPTION_STATE_PAUSED",
        now
      }).planStatus
    ).toBe("past_due");
    expect(
      isFamilyPlanActive({
        plan: "family",
        planStatus: "past_due",
        canceledAt: null,
        renewsAt: "2026-11-28T12:00:00.000Z"
      })
    ).toBe(false);
    expect(
      resolvePlayEntitlement({
        subscriptionState: "SUBSCRIPTION_STATE_EXPIRED",
        expiryTime: "2026-09-01T12:00:00.000Z",
        now
      }).expired
    ).toBe(true);
  });
});

describe("changements de formule", () => {
  it("prépare un remplacement Play plutôt qu'un second abonnement", () => {
    expect(
      playReplacementParams({
        paidRemaining: true,
        playProductId: "ridecloud_premium",
        playPurchaseToken: "old-token"
      })
    ).toEqual({
      oldProductId: "ridecloud_premium",
      oldPurchaseToken: "old-token"
    });
    expect(
      playReplacementParams({
        paidRemaining: false,
        playProductId: "ridecloud_premium",
        playPurchaseToken: "old-token"
      })
    ).toBeNull();
  });

  it("préserve le Premium fondateur après expiration Family", () => {
    expect(founderPlanAfterFamilyExpiry(true)).toBe("premium");
    expect(founderPlanAfterFamilyExpiry(false)).toBe("free");
  });
});

describe("propriété des jetons", () => {
  const userId = "11111111-1111-1111-1111-111111111111";

  it("refuse un identifiant Play absent, différent, ou déjà attribué", () => {
    expect(playPurchaseBelongsToUser(userId, userId)).toBe(true);
    expect(playPurchaseBelongsToUser(null, userId)).toBe(false);
    expect(
      resolvePlayPurchaseOwner({
        requestedUserId: userId,
        obfuscatedAccountId: null,
        requireObfuscated: true
      })
    ).toEqual({ ok: false, reason: "obfuscated_mismatch" });
    expect(
      resolvePlayPurchaseOwner({
        requestedUserId: userId,
        existingUserId: "22222222-2222-2222-2222-222222222222",
        obfuscatedAccountId: userId,
        requireObfuscated: true
      })
    ).toEqual({ ok: false, reason: "already_bound" });
  });

  it("conserve un RTDN avant verify sans l'attribuer au hasard", () => {
    expect(
      resolvePlayPurchaseOwner({
        requestedUserId: null,
        existingUserId: null,
        linkedUserId: null,
        obfuscatedAccountId: userId,
        requireObfuscated: false
      })
    ).toEqual({ ok: true, userId: null });
    expect(
      resolvePlayPurchaseOwner({
        requestedUserId: null,
        existingUserId: null,
        linkedUserId: userId,
        obfuscatedAccountId: null,
        requireObfuscated: false
      })
    ).toEqual({ ok: true, userId });
  });
});
