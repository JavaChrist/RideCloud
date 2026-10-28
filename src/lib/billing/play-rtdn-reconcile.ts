import { createAdminClient } from "@/lib/supabase/admin";

export const OPEN_PLAY_RTDN_STATUSES = ["pending", "failed", "orphan"] as const;

export type OpenPlayRtdnStatus = (typeof OPEN_PLAY_RTDN_STATUSES)[number];

export type PlayRtdnEventRecord = {
  messageId: string;
  purchaseToken: string | null;
  processStatus: string;
};

export type PlayRtdnApplyResult = {
  boundUserId: string | null;
};

export type PlayRtdnMarkUpdate = {
  processStatus: "applied" | "orphan" | "failed";
  processError: string | null;
};

export function isOpenPlayRtdnStatus(status: string): status is OpenPlayRtdnStatus {
  return (OPEN_PLAY_RTDN_STATUSES as readonly string[]).includes(status);
}

export function playRtdnStatusAfterApply(boundUserId: string | null): "applied" | "orphan" {
  return boundUserId ? "applied" : "orphan";
}

/**
 * Reprend chaque RTDN ouvert individuellement.
 * `applyPurchase` doit relire Google et vérifier la propriété.
 * Un événement n'est `applied` qu'après ce passage ; `applied` n'est pas réécrit.
 */
export async function reconcileOpenPlayRtdnEvents(input: {
  events: PlayRtdnEventRecord[];
  applyPurchase: (purchaseToken: string) => Promise<PlayRtdnApplyResult>;
  markEvent: (messageId: string, update: PlayRtdnMarkUpdate) => Promise<void>;
}): Promise<{ reconciled: number; failed: number; skipped: number }> {
  let reconciled = 0;
  let failed = 0;
  let skipped = 0;

  for (const event of input.events) {
    if (!isOpenPlayRtdnStatus(event.processStatus) || !event.purchaseToken) {
      skipped += 1;
      continue;
    }
    try {
      const result = await input.applyPurchase(event.purchaseToken);
      await input.markEvent(event.messageId, {
        processStatus: playRtdnStatusAfterApply(result.boundUserId),
        processError: null
      });
      reconciled += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "reconcile failed";
      await input.markEvent(event.messageId, {
        processStatus: "failed",
        processError: message.slice(0, 400)
      });
      failed += 1;
    }
  }

  return { reconciled, failed, skipped };
}

export async function reconcileStoredPlayRtdnEvents(input: {
  applyPurchase: (purchaseToken: string) => Promise<PlayRtdnApplyResult>;
  purchaseToken?: string;
  limit?: number;
}): Promise<{ reconciled: number; failed: number; skipped: number }> {
  const admin = createAdminClient();
  let query = admin
    .from("play_rtdn_events")
    .select("message_id, purchase_token, process_status")
    .in("process_status", [...OPEN_PLAY_RTDN_STATUSES])
    .not("purchase_token", "is", null)
    .limit(input.limit ?? 25);
  if (input.purchaseToken) {
    query = query.eq("purchase_token", input.purchaseToken);
  }
  const { data } = await query;
  const rows = (data ?? []) as Array<{
    message_id: string;
    purchase_token: string;
    process_status: string;
  }>;
  const now = () => new Date().toISOString();
  return reconcileOpenPlayRtdnEvents({
    events: rows.map((row) => ({
      messageId: row.message_id,
      purchaseToken: row.purchase_token,
      processStatus: row.process_status
    })),
    applyPurchase: input.applyPurchase,
    markEvent: async (messageId, update) => {
      await admin
        .from("play_rtdn_events")
        .update({
          process_status: update.processStatus,
          processed_at: now(),
          process_error: update.processError,
          updated_at: now()
        } as never)
        .eq("message_id", messageId);
    }
  });
}
