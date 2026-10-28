import { afterEach, describe, expect, it } from "vitest";
import {
  evaluatePubSubOidcClaims,
  verifyPubSubOidcToken
} from "@/lib/billing/play-oidc";

const expected = {
  audience: "https://ridecloud.app/api/billing/play/rtdn",
  serviceAccount: "rtdn-push@example.iam.gserviceaccount.com"
};

describe("OIDC Pub/Sub RTDN", () => {
  afterEach(() => {
    delete process.env.GOOGLE_PLAY_RTDN_AUDIENCE;
    delete process.env.GOOGLE_PLAY_RTDN_SERVICE_ACCOUNT;
  });

  it("refuse un jeton dont issuer, audience ou compte de service est invalide", () => {
    const valid = {
      iss: "https://accounts.google.com",
      aud: expected.audience,
      email: expected.serviceAccount,
      email_verified: true,
      exp: 4102444800
    };
    expect(evaluatePubSubOidcClaims(valid, expected)).toEqual({ ok: true });
    expect(evaluatePubSubOidcClaims({ ...valid, iss: "https://evil.example" }, expected)).toEqual({
      ok: false,
      error: "issuer"
    });
    expect(evaluatePubSubOidcClaims({ ...valid, aud: "https://other.app" }, expected)).toEqual({
      ok: false,
      error: "audience"
    });
    expect(evaluatePubSubOidcClaims({ ...valid, email: "other@example.com" }, expected)).toEqual({
      ok: false,
      error: "email"
    });
    expect(evaluatePubSubOidcClaims({ ...valid, email_verified: false }, expected)).toEqual({
      ok: false,
      error: "email_verified"
    });
  });

  it("échoue fermé sans configuration et sans Bearer", async () => {
    const unconfigured = await verifyPubSubOidcToken("Bearer token", async () => ({}));
    expect(unconfigured).toMatchObject({ ok: false, status: 503 });

    process.env.GOOGLE_PLAY_RTDN_AUDIENCE = expected.audience;
    process.env.GOOGLE_PLAY_RTDN_SERVICE_ACCOUNT = expected.serviceAccount;
    const missing = await verifyPubSubOidcToken(null, async () => ({}));
    expect(missing).toMatchObject({ ok: false, error: "missing_bearer", status: 401 });

    const badSig = await verifyPubSubOidcToken("Bearer tok", async () => {
      throw new Error("bad signature");
    });
    expect(badSig).toMatchObject({ ok: false, error: "invalid_signature", status: 401 });
  });
});
