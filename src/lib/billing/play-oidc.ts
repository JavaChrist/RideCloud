export const GOOGLE_OIDC_ISSUERS = ["accounts.google.com", "https://accounts.google.com"] as const;

export interface PubSubOidcClaims {
  iss?: string;
  aud?: string | string[];
  email?: string;
  email_verified?: boolean | string;
  exp?: number;
}

export interface PubSubOidcExpected {
  audience: string;
  serviceAccount: string;
}

export function getPubSubOidcExpected(): PubSubOidcExpected | null {
  const audience = process.env.GOOGLE_PLAY_RTDN_AUDIENCE?.trim();
  const serviceAccount = process.env.GOOGLE_PLAY_RTDN_SERVICE_ACCOUNT?.trim();
  if (!audience || !serviceAccount) return null;
  return { audience, serviceAccount };
}

export function evaluatePubSubOidcClaims(
  claims: PubSubOidcClaims,
  expected: PubSubOidcExpected,
  now = new Date()
): { ok: true } | { ok: false; error: string } {
  if (!claims.iss || !GOOGLE_OIDC_ISSUERS.includes(claims.iss as (typeof GOOGLE_OIDC_ISSUERS)[number])) {
    return { ok: false, error: "issuer" };
  }
  const audiences = Array.isArray(claims.aud) ? claims.aud : claims.aud ? [claims.aud] : [];
  if (!audiences.includes(expected.audience)) {
    return { ok: false, error: "audience" };
  }
  if (claims.email !== expected.serviceAccount) {
    return { ok: false, error: "email" };
  }
  if (claims.email_verified !== true && claims.email_verified !== "true") {
    return { ok: false, error: "email_verified" };
  }
  if (typeof claims.exp === "number" && claims.exp * 1000 < now.getTime()) {
    return { ok: false, error: "expired" };
  }
  return { ok: true };
}

export function readBearerToken(authorization: string | null | undefined): string | null {
  if (!authorization) return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function verifyPubSubOidcToken(
  authorization: string | null | undefined,
  verifySignature: (token: string, audience: string) => Promise<PubSubOidcClaims>
): Promise<{ ok: true; email: string } | { ok: false; error: string; status: number }> {
  const expected = getPubSubOidcExpected();
  if (!expected) {
    return { ok: false, error: "rtdn_auth_unconfigured", status: 503 };
  }
  const token = readBearerToken(authorization);
  if (!token) {
    return { ok: false, error: "missing_bearer", status: 401 };
  }
  let claims: PubSubOidcClaims;
  try {
    claims = await verifySignature(token, expected.audience);
  } catch {
    return { ok: false, error: "invalid_signature", status: 401 };
  }
  const evaluated = evaluatePubSubOidcClaims(claims, expected);
  if (!evaluated.ok) {
    return { ok: false, error: evaluated.error, status: 401 };
  }
  return { ok: true, email: expected.serviceAccount };
}

export async function verifyGoogleIdTokenSignature(
  token: string,
  audience: string
): Promise<PubSubOidcClaims> {
  const { OAuth2Client } = await import("google-auth-library");
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({ idToken: token, audience });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("empty_payload");
  }
  return {
    iss: payload.iss,
    aud: payload.aud,
    email: payload.email,
    email_verified: payload.email_verified,
    exp: payload.exp
  };
}
