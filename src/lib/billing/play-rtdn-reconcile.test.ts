import { describe, expect, it } from "vitest";
import {
  isOpenPlayRtdnStatus,
  playRtdnStatusAfterApply,
  reconcileOpenPlayRtdnEvents,
  type PlayRtdnEventRecord,
  type PlayRtdnMarkUpdate
} from "@/lib/billing/play-rtdn-reconcile";

const USER_ID = "11111111-1111-1111-1111-111111111111";

async function runReconcile(
  events: PlayRtdnEventRecord[],
  applyPurchase: (token: string) => Promise<{ boundUserId: string | null }>
) {
  const marks: Array<{ messageId: string } & PlayRtdnMarkUpdate> = [];
  const result = await reconcileOpenPlayRtdnEvents({
    events,
    applyPurchase,
    markEvent: async (messageId, update) => {
      marks.push({ messageId, ...update });
      const event = events.find((row) => row.messageId === messageId);
      if (event) event.processStatus = update.processStatus;
    }
  });
  return { result, marks };
}

describe("réconciliation RTDN", () => {
  it("reprend un SUBSCRIPTION_PURCHASED orphan une fois verify lié le jeton", async () => {
    const events: PlayRtdnEventRecord[] = [
      {
        messageId: "rtdn-purchased",
        purchaseToken: "play-token",
        processStatus: "pending"
      }
    ];
    let boundUserId: string | null = null;

    const beforeVerify = await runReconcile(events, async () => ({ boundUserId }));
    expect(beforeVerify.result).toEqual({ reconciled: 1, failed: 0, skipped: 0 });
    expect(events[0]?.processStatus).toBe("orphan");
    expect(playRtdnStatusAfterApply(null)).toBe("orphan");

    boundUserId = USER_ID;
    const afterVerify = await runReconcile(events, async (token) => {
      expect(token).toBe("play-token");
      return { boundUserId };
    });
    expect(afterVerify.result.reconciled).toBe(1);
    expect(events[0]?.processStatus).toBe("applied");
    expect(afterVerify.marks.at(-1)).toEqual({
      messageId: "rtdn-purchased",
      processStatus: "applied",
      processError: null
    });
  });

  it("ne réécrit pas un événement déjà applied", async () => {
    const events: PlayRtdnEventRecord[] = [
      { messageId: "renewed", purchaseToken: "play-token", processStatus: "applied" },
      { messageId: "purchased", purchaseToken: "play-token", processStatus: "orphan" }
    ];
    let applyCalls = 0;
    const { result, marks } = await runReconcile(events, async () => {
      applyCalls += 1;
      return { boundUserId: USER_ID };
    });
    expect(applyCalls).toBe(1);
    expect(result).toEqual({ reconciled: 1, failed: 0, skipped: 1 });
    expect(marks).toEqual([
      { messageId: "purchased", processStatus: "applied", processError: null }
    ]);
    expect(events[0]?.processStatus).toBe("applied");
  });

  it("conserve l'échec de propriété sans attribuer l'événement", async () => {
    const events: PlayRtdnEventRecord[] = [
      { messageId: "foreign", purchaseToken: "other-token", processStatus: "orphan" }
    ];
    const { result, marks } = await runReconcile(events, async () => {
      throw new Error("Cet achat Google Play est déjà associé à un autre compte.");
    });
    expect(result).toEqual({ reconciled: 0, failed: 1, skipped: 0 });
    expect(marks[0]?.processStatus).toBe("failed");
    expect(events[0]?.processStatus).toBe("failed");
    expect(isOpenPlayRtdnStatus("failed")).toBe(true);
    expect(isOpenPlayRtdnStatus("applied")).toBe(false);
  });

  it("n'est pas applied seulement parce que le jeton est déjà lié", async () => {
    const events: PlayRtdnEventRecord[] = [
      { messageId: "purchased", purchaseToken: "play-token", processStatus: "orphan" }
    ];
    const { result, marks } = await runReconcile(events, async () => {
      throw new Error("Relecture Google Play impossible.");
    });
    expect(result.failed).toBe(1);
    expect(marks[0]?.processStatus).toBe("failed");
    expect(events[0]?.processStatus).toBe("failed");
  });

  it("marque applied seulement après une relecture Google réussie, même expirée", async () => {
    const events: PlayRtdnEventRecord[] = [
      { messageId: "purchased", purchaseToken: "play-token", processStatus: "orphan" }
    ];
    let applyCalls = 0;
    const { marks } = await runReconcile(events, async () => {
      applyCalls += 1;
      return { boundUserId: USER_ID };
    });
    expect(applyCalls).toBe(1);
    expect(marks[0]?.processStatus).toBe("applied");
    expect(marks[0]?.processError).toBeNull();
  });
});
