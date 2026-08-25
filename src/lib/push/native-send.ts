import { createAdminClient } from "@/lib/supabase/admin";
import { sendFcmToToken } from "@/lib/push/fcm";
import type { PushPayload, SendOutcome } from "@/lib/push/server";


export type FcmSender = typeof sendFcmToToken;

/**
 * Envoie le payload métier via FCM à tous les tokens Android de l'utilisateur.
 * Un token invalide est purgé ici uniquement — jamais dans push_subscriptions.
 */
export async function sendNativePushToUser(
  userId: string,
  payload: PushPayload,
  sendFcm: FcmSender = sendFcmToToken,
  admin = createAdminClient()
): Promise<SendOutcome[]> {
  const { data, error } = await admin
    .from("native_push_tokens")
    .select("id, token, platform")
    .eq("user_id", userId)
    .eq("platform", "android");

  if (error || !data || data.length === 0) return [];

  const outcomes: SendOutcome[] = [];
  for (const row of data as Array<{ id: string; token: string; platform: string }>) {
    const result = await sendFcm(row.token, payload);
    if (result.invalidToken) {
      await admin.from("native_push_tokens").delete().eq("id", row.id);
      outcomes.push({
        endpoint: `fcm:${row.id}`,
        success: false,
        removed: true,
        error: "token_invalid"
      });
      continue;
    }
    if (!result.success) {
      outcomes.push({
        endpoint: `fcm:${row.id}`,
        success: false,
        error: result.error
      });
      continue;
    }
    outcomes.push({ endpoint: `fcm:${row.id}`, success: true });
  }
  return outcomes;
}
