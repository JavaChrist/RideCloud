import { collectNotificationAlerts, type NotificationAlert } from "@/lib/notifications/alerts";
import { pushCooldownDaysForType, shouldSendPushForNotification } from "@/lib/notifications/dedupe";
import type { MaintenancePlanEntry, NotificationKind, Vehicle } from "@/types/database";
import type { PushPayload, SendOutcome } from "@/lib/push/server";

export interface PersistedCronNotification {
  id: string;
  lastPushedAt: string | null;
  readAt: string | null;
  dedupeKey: string;
}

export interface CronDependencies {
  now?: Date;
  loadVehicles: () => Promise<Array<Vehicle & { user_id: string }>>;
  loadPlanEntries: (vehicleIds: string[]) => Promise<MaintenancePlanEntry[]>;
  loadPushUserIds: () => Promise<Set<string>>;
  persistAlert: (alert: NotificationAlert) => Promise<PersistedCronNotification | null>;
  /** Filet anti-spam si last_pushed_at est encore null (historique pré-N2). */
  latestLogSentAt?: (alert: NotificationAlert) => Promise<string | null>;
  sendPush: (userId: string, payload: PushPayload) => Promise<SendOutcome[]>;
  markPushed: (notificationId: string, at: Date) => Promise<void>;
  logPushSuccess: (input: {
    userId: string;
    vehicleId: string;
    kind: NotificationKind;
    subjectId: string | null;
    payload: Record<string, unknown>;
  }) => Promise<void>;
}

export interface CronResult {
  processed: number;
  candidates: number;
  persisted: number;
  dismissed: number;
  sent: number;
  failures: Array<{ vehicleId: string; type: string; reason: string }>;
}

/**
 * 1) événements métier (tous les véhicules)
 * 2) upsert notifications
 * 3) Push seulement si abonnement + cooldown last_pushed_at
 *    (filet notification_log si last_pushed_at encore null)
 * 4) last_pushed_at + notification_log uniquement après Push réussi
 */
export async function processNotificationCron(deps: CronDependencies): Promise<CronResult> {
  const now = deps.now ?? new Date();
  const vehicles = await deps.loadVehicles();
  if (vehicles.length === 0) {
    return { processed: 0, candidates: 0, persisted: 0, dismissed: 0, sent: 0, failures: [] };
  }

  const planEntries = await deps.loadPlanEntries(vehicles.map((vehicle) => vehicle.id));
  const pushUserIds = await deps.loadPushUserIds();
  const alerts = collectNotificationAlerts({ vehicles, planEntries, now });

  let persisted = 0;
  let dismissed = 0;
  let sent = 0;
  const failures: CronResult["failures"] = [];

  for (const alert of alerts) {
    let row: PersistedCronNotification | null;
    try {
      row = await deps.persistAlert(alert);
      if (!row) {
        dismissed += 1;
        continue;
      }
      persisted += 1;
    } catch (error) {
      failures.push({
        vehicleId: alert.vehicleId,
        type: alert.type,
        reason: error instanceof Error ? error.message : "persist_failed"
      });
      continue;
    }

    const lastPushedAt =
      row.lastPushedAt ?? (deps.latestLogSentAt ? await deps.latestLogSentAt(alert) : null);

    const shouldPush = shouldSendPushForNotification({
      hasPushSubscription: pushUserIds.has(alert.userId),
      lastPushedAt,
      cooldownDays: pushCooldownDaysForType(alert.type),
      now
    });
    if (!shouldPush) continue;

    const outcomes = await deps.sendPush(alert.userId, {
      title: alert.title,
      body: alert.body,
      url: alert.href,
      tag: alert.tag
    });
    const success = outcomes.some((outcome) => outcome.success);

    if (success) {
      sent += 1;
      await deps.markPushed(row.id, now);
      await deps.logPushSuccess({
        userId: alert.userId,
        vehicleId: alert.vehicleId,
        kind: alert.type,
        subjectId: alert.subjectId,
        payload: {
          title: alert.title,
          body: alert.body,
          url: alert.href
        }
      });
    } else {
      failures.push({
        vehicleId: alert.vehicleId,
        type: alert.type,
        reason:
          outcomes.map((outcome) => outcome.error || `status ${outcome.status}`).join(", ") ||
          "push_failed"
      });
    }
  }

  return {
    processed: vehicles.length,
    candidates: alerts.length,
    persisted,
    dismissed,
    sent,
    failures
  };
}
