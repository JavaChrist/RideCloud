import { GoogleAuth, type JWTInput } from "google-auth-library";
import { getPlayPackageName } from "@/lib/billing/play-products";

const ANDROID_PUBLISHER_SCOPE = "https://www.googleapis.com/auth/androidpublisher";

export function hasPlayBillingEnv(): boolean {
  if (process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON?.trim()) return true;
  return Boolean(
    process.env.GOOGLE_PLAY_CLIENT_EMAIL?.trim() && process.env.GOOGLE_PLAY_PRIVATE_KEY?.trim()
  );
}

function parseServiceAccountJson(raw: string): JWTInput {
  const trimmed = raw.trim();
  const json = trimmed.startsWith("{")
    ? trimmed
    : Buffer.from(trimmed, "base64").toString("utf8");
  return JSON.parse(json) as JWTInput;
}

function loadCredentials(): JWTInput {
  const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  if (raw?.trim()) {
    return parseServiceAccountJson(raw);
  }
  const clientEmail = process.env.GOOGLE_PLAY_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PLAY_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) {
    throw new Error(
      "Identifiants Google Play absents. Configurez GOOGLE_PLAY_SERVICE_ACCOUNT_JSON ou GOOGLE_PLAY_CLIENT_EMAIL + GOOGLE_PLAY_PRIVATE_KEY."
    );
  }
  return { client_email: clientEmail, private_key: privateKey };
}

let cachedAuth: GoogleAuth | null = null;

function getPlayAuth(): GoogleAuth {
  if (!cachedAuth) {
    cachedAuth = new GoogleAuth({
      credentials: loadCredentials(),
      scopes: [ANDROID_PUBLISHER_SCOPE]
    });
  }
  return cachedAuth;
}

async function playFetch(path: string, init?: RequestInit): Promise<Response> {
  const client = await getPlayAuth().getClient();
  const access = await client.getAccessToken();
  const token = typeof access === "string" ? access : access?.token;
  if (!token) {
    throw new Error("Impossible d'obtenir un jeton Google Play.");
  }
  return fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });
}

export interface PlaySubscriptionLineItem {
  productId?: string;
  expiryTime?: string;
  autoRenewingPlan?: { autoRenewEnabled?: boolean };
}

export interface PlaySubscriptionPurchase {
  subscriptionState?: string;
  latestOrderId?: string;
  acknowledgementState?: string;
  linkedPurchaseToken?: string;
  lineItems?: PlaySubscriptionLineItem[];
  externalAccountIdentifiers?: {
    obfuscatedExternalAccountId?: string;
  };
}

export async function getPlaySubscriptionPurchase(
  purchaseToken: string
): Promise<PlaySubscriptionPurchase> {
  const packageName = encodeURIComponent(getPlayPackageName());
  const token = encodeURIComponent(purchaseToken);
  const response = await playFetch(
    `/applications/${packageName}/purchases/subscriptionsv2/tokens/${token}`
  );
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Play subscriptionsv2: ${response.status} ${body.slice(0, 400)}`);
  }
  return (await response.json()) as PlaySubscriptionPurchase;
}

export async function acknowledgePlaySubscription(input: {
  productId: string;
  purchaseToken: string;
}): Promise<void> {
  const packageName = encodeURIComponent(getPlayPackageName());
  const subscriptionId = encodeURIComponent(input.productId);
  const token = encodeURIComponent(input.purchaseToken);
  const response = await playFetch(
    `/applications/${packageName}/purchases/subscriptions/${subscriptionId}/tokens/${token}:acknowledge`,
    { method: "POST", body: JSON.stringify({}) }
  );
  if (response.status === 400) {
    // Déjà acquitté : Google renvoie souvent 400. Ce n'est pas bloquant.
    return;
  }
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Play acknowledge: ${response.status} ${body.slice(0, 400)}`);
  }
}

export async function cancelPlaySubscription(input: {
  productId: string;
  purchaseToken: string;
}): Promise<void> {
  const packageName = encodeURIComponent(getPlayPackageName());
  const subscriptionId = encodeURIComponent(input.productId);
  const token = encodeURIComponent(input.purchaseToken);
  const response = await playFetch(
    `/applications/${packageName}/purchases/subscriptions/${subscriptionId}/tokens/${token}:cancel`,
    { method: "POST" }
  );
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Play cancel: ${response.status} ${body.slice(0, 400)}`);
  }
}

export function primaryPlayLineItem(
  purchase: PlaySubscriptionPurchase
): PlaySubscriptionLineItem | null {
  return purchase.lineItems?.[0] ?? null;
}
