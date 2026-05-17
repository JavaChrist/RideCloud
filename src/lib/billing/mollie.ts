import createMollieClient, { type MollieClient } from "@mollie/api-client";
import type { Plan, PlanInterval } from "@/types/database";
import { PLANS } from "@/lib/billing/plans";

const apiKey = process.env.MOLLIE_API_KEY;

export function hasMollieEnv(): boolean {
  return Boolean(apiKey);
}

let cachedClient: MollieClient | null = null;

/**
 * Client Mollie singleton (côté serveur uniquement).
 *
 * Mollie n'expose pas de mode "test" séparé : la clé `test_xxx` route vers
 * leur sandbox, la clé `live_xxx` route vers la production. On utilise la
 * variable d'env `MOLLIE_API_KEY` sans distinction.
 */
export function getMollieClient(): MollieClient {
  if (!apiKey) {
    throw new Error(
      "MOLLIE_API_KEY manquante. Ajoutez-la dans .env.local (test_xxx ou live_xxx)."
    );
  }
  if (!cachedClient) {
    cachedClient = createMollieClient({ apiKey });
  }
  return cachedClient;
}

export function getMollieMode(): "test" | "live" | "unknown" {
  if (!apiKey) return "unknown";
  if (apiKey.startsWith("test_")) return "test";
  if (apiKey.startsWith("live_")) return "live";
  return "unknown";
}

/**
 * Description Mollie d'une souscription (ce que le client verra sur son relevé).
 */
export function describeSubscription(plan: Plan, interval: PlanInterval): string {
  const planDef = PLANS[plan];
  return `RideCloud ${planDef.name} · ${interval === "monthly" ? "Mensuel" : "Annuel"}`;
}

/**
 * Conversion d'un montant (number en euros) vers la structure `Amount` Mollie
 * (string avec 2 décimales).
 */
export function toMollieAmount(amount: number): { currency: "EUR"; value: string } {
  return {
    currency: "EUR",
    value: amount.toFixed(2)
  };
}

/**
 * Intervalle Mollie (pour `customers_subscriptions.interval`).
 */
export function getMollieInterval(interval: PlanInterval): string {
  return interval === "monthly" ? "1 month" : "12 months";
}
