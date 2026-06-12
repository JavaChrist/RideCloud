import { NextResponse } from "next/server";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendToUser } from "@/lib/push/server";
import { getMaintenanceStatus } from "@/lib/maintenance";
import { daysSinceOdometerRefresh } from "@/lib/odometer-estimate";
import type {
  MaintenancePlanEntry,
  NotificationKind,
  Vehicle
} from "@/types/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ODOMETER_REMIND_AFTER_DAYS = 30;
const ODOMETER_RECENT_DAYS = 25; // ne pas re-renotifier compteur dans les 25 jours
const MAINTENANCE_RECENT_DAYS = 7; // 1 push max par tâche tous les 7 jours

interface VehicleWithUser extends Vehicle {
  user_id: string;
}

/**
 * Vérifie le secret du cron : header Authorization "Bearer X" ou
 * query ?token=X. Vercel Cron envoie `Authorization: Bearer $CRON_SECRET`
 * automatiquement quand on configure le job.
 */
function isAuthorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const auth = request.headers.get("authorization");
  if (auth && auth === `Bearer ${expected}`) return true;

  const url = new URL(request.url);
  if (url.searchParams.get("token") === expected) return true;

  return false;
}

interface AlertRecord {
  userId: string;
  vehicleId: string;
  kind: NotificationKind;
  subjectId: string | null;
  title: string;
  body: string;
  url: string;
  tag: string;
}

/**
 * POST/GET /api/cron/notifications
 *
 * Appelé par Vercel Cron une fois par jour. Détecte pour chaque utilisateur :
 *   - les véhicules dont le compteur n'a pas été rafraîchi depuis > 30j
 *   - les entretiens "overdue" ou "due_soon" non notifiés récemment
 * Envoie une notification Web Push par sujet, en mémorisant l'envoi dans
 * `notification_log` (anti-spam).
 */
async function handle(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // 1) Charger tous les véhicules dont au moins un user a une push subscription.
  //    On filtre côté app : pas la peine de charger les véhicules d'un user
  //    qui n'a aucun device souscrit.
  const { data: subs, error: subsError } = await admin
    .from("push_subscriptions")
    .select("user_id");
  if (subsError) {
    return NextResponse.json({ ok: false, reason: "db_error", details: subsError.message }, { status: 500 });
  }
  const subscribedUserIds = Array.from(new Set((subs ?? []).map((row) => (row as { user_id: string }).user_id)));
  if (subscribedUserIds.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, sent: 0, reason: "no_subscribers" });
  }

  const { data: vehiclesRaw, error: vehiclesError } = await admin
    .from("vehicles")
    .select("*")
    .in("user_id", subscribedUserIds);
  if (vehiclesError) {
    return NextResponse.json(
      { ok: false, reason: "db_error", details: vehiclesError.message },
      { status: 500 }
    );
  }
  const vehicles = (vehiclesRaw ?? []) as VehicleWithUser[];
  if (vehicles.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, sent: 0, reason: "no_vehicles" });
  }

  // 2) Charger l'historique récent (anti-spam) pour tous les véhicules concernés.
  const vehicleIds = vehicles.map((v) => v.id);
  const horizonIso = new Date(Date.now() - ODOMETER_REMIND_AFTER_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentLogsRaw } = await admin
    .from("notification_log")
    .select("user_id, vehicle_id, kind, subject_id, sent_at")
    .in("vehicle_id", vehicleIds)
    .gte("sent_at", horizonIso);
  const recentLogs = (recentLogsRaw ?? []) as Array<{
    user_id: string;
    vehicle_id: string;
    kind: NotificationKind;
    subject_id: string | null;
    sent_at: string;
  }>;

  function wasRecentlyNotified(
    vehicleId: string,
    kind: NotificationKind,
    subjectId: string | null,
    maxDays: number
  ): boolean {
    const now = Date.now();
    return recentLogs.some((log) => {
      if (log.vehicle_id !== vehicleId) return false;
      if (log.kind !== kind) return false;
      if ((log.subject_id ?? null) !== subjectId) return false;
      const ageDays = (now - new Date(log.sent_at).getTime()) / (24 * 60 * 60 * 1000);
      return ageDays < maxDays;
    });
  }

  // 3) Charger tous les plan_entries des véhicules concernés.
  const { data: planRaw } = await admin
    .from("maintenance_plan_entries")
    .select("*")
    .in("vehicle_id", vehicleIds);
  const planByVehicle = new Map<string, MaintenancePlanEntry[]>();
  for (const entry of (planRaw ?? []) as MaintenancePlanEntry[]) {
    const list = planByVehicle.get(entry.vehicle_id) ?? [];
    list.push(entry);
    planByVehicle.set(entry.vehicle_id, list);
  }

  // 4) Détecter les alertes à envoyer.
  const alerts: AlertRecord[] = [];
  const now = new Date();

  for (const vehicle of vehicles) {
    const labelVehicule = vehicle.surnom?.trim() || `${vehicle.marque} ${vehicle.modele}`.trim();
    const detailUrl = `/vehicule/${vehicle.id}`;

    // 4a) Rappel compteur
    const daysSinceRefresh = daysSinceOdometerRefresh({
      lastOdometerDate: vehicle.last_odometer_date,
      now
    });
    if (
      daysSinceRefresh != null &&
      daysSinceRefresh > ODOMETER_REMIND_AFTER_DAYS &&
      !wasRecentlyNotified(vehicle.id, "odometer_refresh", null, ODOMETER_RECENT_DAYS)
    ) {
      alerts.push({
        userId: vehicle.user_id,
        vehicleId: vehicle.id,
        kind: "odometer_refresh",
        subjectId: null,
        title: `Mets à jour le compteur de ${labelVehicule}`,
        body: `Dernière saisie il y a ${daysSinceRefresh} jours. Tes alertes d'entretien gagneront en précision.`,
        url: detailUrl,
        tag: `odometer-${vehicle.id}`
      });
    }

    // 4b) Entretiens "overdue" ou "due_soon"
    const entries = planByVehicle.get(vehicle.id) ?? [];
    for (const entry of entries) {
      const status = getMaintenanceStatus({
        nextDueKm: entry.next_due_km,
        nextDueDate: entry.next_due_date,
        currentKm: vehicle.kilometrage,
        dueSoonKmThreshold: entry.due_soon_km_threshold,
        dueSoonDaysThreshold: entry.due_soon_days_threshold,
        lastDoneKm: entry.last_done_km,
        lastDoneDate: entry.last_done_date,
        avgKmPerYear: vehicle.avg_km_per_year,
        lastOdometerValue: vehicle.last_odometer_value,
        lastOdometerDate: vehicle.last_odometer_date,
        now
      });
      if (status !== "overdue" && status !== "due_soon") continue;
      if (wasRecentlyNotified(vehicle.id, "maintenance_due", entry.id, MAINTENANCE_RECENT_DAYS)) continue;

      // Construit un libellé court (km OU jours, selon ce qui tombe en premier)
      let detail = "à prévoir bientôt";
      if (status === "overdue") {
        detail = "en retard";
      } else if (entry.next_due_date) {
        const days = differenceInCalendarDays(parseISO(entry.next_due_date), now);
        if (days >= 0) detail = `dans ${days} jour${days > 1 ? "s" : ""}`;
      } else if (entry.next_due_km != null) {
        const km = entry.next_due_km - vehicle.kilometrage;
        if (km >= 0) detail = `dans ${km.toLocaleString("fr-FR")} km`;
      }

      alerts.push({
        userId: vehicle.user_id,
        vehicleId: vehicle.id,
        kind: "maintenance_due",
        subjectId: entry.id,
        title: status === "overdue"
          ? `${entry.titre} en retard — ${labelVehicule}`
          : `${entry.titre} ${detail} — ${labelVehicule}`,
        body:
          status === "overdue"
            ? `Cet entretien est ${detail} sur ${labelVehicule}. Ouvre l'app pour planifier.`
            : `Pense à planifier "${entry.titre}" ${detail} sur ${labelVehicule}.`,
        url: `${detailUrl}?tab=plan-entretien`,
        tag: `maintenance-${entry.id}`
      });
    }
  }

  if (alerts.length === 0) {
    return NextResponse.json({ ok: true, processed: vehicles.length, sent: 0 });
  }

  // 5) Envoyer chaque alerte ET logger l'envoi.
  let sentCount = 0;
  const failures: Array<{ vehicleId: string; kind: NotificationKind; reason: string }> = [];
  for (const alert of alerts) {
    const outcomes = await sendToUser(alert.userId, {
      title: alert.title,
      body: alert.body,
      url: alert.url,
      tag: alert.tag
    });
    const success = outcomes.some((o) => o.success);

    if (success) {
      sentCount += 1;
      await admin.from("notification_log").insert({
        user_id: alert.userId,
        vehicle_id: alert.vehicleId,
        kind: alert.kind,
        subject_id: alert.subjectId,
        payload: {
          title: alert.title,
          body: alert.body,
          url: alert.url
        }
      } as never);
    } else {
      failures.push({
        vehicleId: alert.vehicleId,
        kind: alert.kind,
        reason: outcomes.map((o) => o.error || `status ${o.status}`).join(", ") || "no_subscriptions"
      });
    }
  }

  return NextResponse.json({
    ok: true,
    processed: vehicles.length,
    candidates: alerts.length,
    sent: sentCount,
    failures
  });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
