import { describe, expect, it } from "vitest";
import {
  interpretAcknowledgeHttp,
  isPlayAcknowledged,
  needsPlayAcknowledgement,
  nextPlayAckRetryAt
} from "@/lib/billing/play-ack";

describe("acknowledgement Play", () => {
  it("ne traite pas un HTTP 400 comme déjà acquitté", () => {
    expect(interpretAcknowledgeHttp(200)).toBe("acked");
    expect(interpretAcknowledgeHttp(204)).toBe("acked");
    expect(interpretAcknowledgeHttp(400)).toBe("retry");
    expect(interpretAcknowledgeHttp(409)).toBe("retry");
    expect(interpretAcknowledgeHttp(500)).toBe("retry");
  });

  it("s'appuie sur acknowledgementState et programme une reprise", () => {
    expect(isPlayAcknowledged("ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED")).toBe(true);
    expect(isPlayAcknowledged("ACKNOWLEDGEMENT_STATE_PENDING")).toBe(false);
    expect(needsPlayAcknowledgement("ACKNOWLEDGEMENT_STATE_PENDING")).toBe(true);
    const from = new Date("2026-10-28T12:00:00.000Z");
    expect(nextPlayAckRetryAt(0, from).getTime()).toBe(from.getTime() + 15 * 60 * 1000);
    expect(nextPlayAckRetryAt(8, from).getTime()).toBe(from.getTime() + 6 * 60 * 60 * 1000);
  });
});
