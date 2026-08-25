/**
 * FCM Android : payload `notification` + `data`.
 * - background / app retirée des récentes : le système Android affiche la notif
 *   sans que la WebView tourne (`notification` + channel ridecloud-default).
 * - foreground : Capacitor émet `pushNotificationReceived` ; Android n'ajoute
 *   pas de 2e notif système. On rafraîchit seulement l'inbox.
 * - clic : `data.url` interne, validé côté client.
 */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";
import { isInvalidFcmError } from "@/lib/push/native-tokens";
import { resolveRideCloudPushHref } from "@/lib/push/native-url";
import type { PushPayload } from "@/lib/push/server";

export const RIDE_CLOUD_ANDROID_CHANNEL_ID = "ridecloud-default";

export interface FcmSendResult {
  success: boolean;
  invalidToken: boolean;
  error?: string;
}

function readServiceAccount(): { projectId: string; clientEmail: string; privateKey: string } | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
}

export function isFirebaseAdminConfigured(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): boolean {
  return Boolean(env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY);
}

function getMessagingClient(): Messaging | null {
  const account = readServiceAccount();
  if (!account) return null;
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: account.projectId,
        clientEmail: account.clientEmail,
        privateKey: account.privateKey
      })
    });
  }
  return getMessaging();
}

export function buildFcmMessage(token: string, payload: PushPayload) {
  const url = resolveRideCloudPushHref(payload.url);
  return {
    token,
    notification: {
      title: payload.title,
      body: payload.body
    },
    data: {
      url,
      tag: payload.tag ?? "ridecloud",
      notificationId: payload.notificationId ?? "",
      type: payload.type ?? ""
    },
    android: {
      priority: "high" as const,
      notification: {
        channelId: RIDE_CLOUD_ANDROID_CHANNEL_ID,
        sound: "default"
      }
    }
  };
}

export async function sendFcmToToken(
  token: string,
  payload: PushPayload,
  messaging: Pick<Messaging, "send"> | null = getMessagingClient()
): Promise<FcmSendResult> {
  if (!messaging) {
    return { success: false, invalidToken: false, error: "firebase_not_configured" };
  }
  try {
    await messaging.send(buildFcmMessage(token, payload));
    return { success: true, invalidToken: false };
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : undefined;
    const message = error instanceof Error ? error.message : "fcm_error";
    const invalidToken =
      isInvalidFcmError(code) ||
      /registration-token-not-registered|invalid-registration-token/i.test(message);
    return { success: false, invalidToken, error: code ?? message };
  }
}
