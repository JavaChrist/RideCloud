export const ODOMETER_REMIND_AFTER_DAYS = 30;
export const ODOMETER_PUSH_COOLDOWN_DAYS = 25;
export const MAINTENANCE_PUSH_COOLDOWN_DAYS = 7;

export function normalizeOccurrenceToken(value: string | number | null | undefined): string {
  if (value == null || value === "") return "none";
  if (typeof value === "number") return String(value);
  const dateOnly = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return dateOnly ? dateOnly[1] : value;
}

/**
 * Une plan_entry est une tâche récurrente : next_due_* avance après réalisation.
 * La clé identifie l'échéance courante, pas la tâche à vie.
 */
export function buildMaintenanceDedupeKey(input: {
  planEntryId: string;
  nextDueKm: number | null;
  nextDueDate: string | null;
}): string {
  return [
    "maintenance_due",
    input.planEntryId,
    normalizeOccurrenceToken(input.nextDueKm),
    normalizeOccurrenceToken(input.nextDueDate)
  ].join(":");
}

/**
 * Un même véhicule produit plusieurs cycles compteur : chaque relevé
 * (last_odometer_date) ouvre une nouvelle période de rappel.
 */
export function buildOdometerDedupeKey(input: {
  vehicleId: string;
  lastOdometerDate: string | null;
}): string {
  return ["odometer_refresh", input.vehicleId, normalizeOccurrenceToken(input.lastOdometerDate)].join(":");
}

export function shouldReopenReadNotification(input: {
  existingStatus: string | null | undefined;
  incomingStatus: string;
}): boolean {
  return input.existingStatus === "due_soon" && input.incomingStatus === "overdue";
}

export function resolveReadAtAfterPersist(input: {
  existingReadAt: string | null;
  existingStatus: string | null | undefined;
  incomingStatus: string;
}): string | null {
  if (shouldReopenReadNotification(input)) return null;
  return input.existingReadAt;
}

export function shouldSendPushForNotification(input: {
  hasPushSubscription: boolean;
  lastPushedAt: string | null;
  cooldownDays: number;
  now?: Date;
}): boolean {
  if (!input.hasPushSubscription) return false;
  if (!input.lastPushedAt) return true;
  const now = input.now ?? new Date();
  const ageDays = (now.getTime() - new Date(input.lastPushedAt).getTime()) / (24 * 60 * 60 * 1000);
  return ageDays >= input.cooldownDays;
}

export function pushCooldownDaysForType(type: string): number {
  return type === "odometer_refresh" ? ODOMETER_PUSH_COOLDOWN_DAYS : MAINTENANCE_PUSH_COOLDOWN_DAYS;
}
