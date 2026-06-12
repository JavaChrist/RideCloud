/**
 * Helpers Web Push côté serveur.
 *
 * Encapsule la lib `web-push` :
 *   - configure les VAPID keys depuis les variables d'environnement
 *   - envoie un payload JSON à une souscription
 *   - traite les erreurs 404/410 (souscription expirée) pour purger
 *     automatiquement la table.
 *
 * À n'utiliser QUE depuis des routes serveur Node.js (web-push n'est pas
 * Edge-compatible — il dépend de modules natifs node).
 */

import webpush, { type PushSubscription as WebPushSubscription, type SendResult } from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PushSubscriptionRow } from "@/types/database";

let configured = false;

function ensureVapidConfigured(): { ok: true } | { ok: false; reason: string } {
  if (configured) return { ok: true };

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const contactEmail = process.env.VAPID_CONTACT_EMAIL;

  if (!publicKey || !privateKey || !contactEmail) {
    return {
      ok: false,
      reason:
        "Variables VAPID manquantes (NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_CONTACT_EMAIL)."
    };
  }

  webpush.setVapidDetails(contactEmail, publicKey, privateKey);
  configured = true;
  return { ok: true };
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export interface SendOutcome {
  endpoint: string;
  success: boolean;
  status?: number;
  removed?: boolean;
  error?: string;
}

/**
 * Envoie un push à UNE souscription. Si l'endpoint renvoie 404/410 (le
 * device a désabonné côté navigateur), la ligne est supprimée de la base
 * pour ne pas être ré-utilisée.
 */
export async function sendToSubscription(
  subscription: Pick<PushSubscriptionRow, "id" | "endpoint" | "p256dh" | "auth">,
  payload: PushPayload
): Promise<SendOutcome> {
  const configResult = ensureVapidConfigured();
  if (!configResult.ok) {
    return { endpoint: subscription.endpoint, success: false, error: configResult.reason };
  }

  const webPushSub: WebPushSubscription = {
    endpoint: subscription.endpoint,
    keys: { p256dh: subscription.p256dh, auth: subscription.auth }
  };

  try {
    const result: SendResult = await webpush.sendNotification(
      webPushSub,
      JSON.stringify(payload),
      { TTL: 60 * 60 * 24 } // 24h : si le téléphone est offline, on garde le message
    );
    return { endpoint: subscription.endpoint, success: true, status: result.statusCode };
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    const message = error instanceof Error ? error.message : "Erreur inconnue";

    // 404 / 410 = la souscription est invalide / révoquée → on la purge.
    if (statusCode === 404 || statusCode === 410) {
      const admin = createAdminClient();
      await admin.from("push_subscriptions").delete().eq("id", subscription.id);
      return {
        endpoint: subscription.endpoint,
        success: false,
        status: statusCode,
        removed: true,
        error: "subscription_expired"
      };
    }

    // Autre erreur : on annote la ligne pour diagnostic, sans la supprimer.
    const admin = createAdminClient();
    await admin
      .from("push_subscriptions")
      .update({
        last_error_at: new Date().toISOString(),
        last_error_reason: `${statusCode ?? "?"}: ${message}`.slice(0, 500)
      } as never)
      .eq("id", subscription.id);

    return {
      endpoint: subscription.endpoint,
      success: false,
      status: statusCode,
      error: message
    };
  }
}

/**
 * Envoie le MÊME payload à toutes les souscriptions d'un utilisateur
 * (multi-device : téléphone + tablette + desktop). Renvoie un récap.
 */
export async function sendToUser(userId: string, payload: PushPayload): Promise<SendOutcome[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error || !data || data.length === 0) return [];

  const subs = data as Array<Pick<PushSubscriptionRow, "id" | "endpoint" | "p256dh" | "auth">>;
  const outcomes: SendOutcome[] = [];
  for (const sub of subs) {
    outcomes.push(await sendToSubscription(sub, payload));
  }
  return outcomes;
}
