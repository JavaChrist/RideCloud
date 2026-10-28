export function isPlayAcknowledged(acknowledgementState: string | null | undefined): boolean {
  return acknowledgementState === "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED";
}

export function needsPlayAcknowledgement(acknowledgementState: string | null | undefined): boolean {
  return acknowledgementState === "ACKNOWLEDGEMENT_STATE_PENDING";
}

export function nextPlayAckRetryAt(attemptCount: number, from = new Date()): Date {
  const minutes = Math.min(6 * 60, 15 * 2 ** Math.max(0, attemptCount));
  return new Date(from.getTime() + minutes * 60 * 1000);
}

export function interpretAcknowledgeHttp(status: number): "acked" | "retry" {
  if (status >= 200 && status < 300) return "acked";
  return "retry";
}
