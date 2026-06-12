import Image from "next/image";
import { redirect } from "next/navigation";
import { Bike, CalendarClock, Car, Gauge, Truck } from "lucide-react";
import { OdometerRefreshHint } from "@/components/vehicles/odometer-refresh-hint";
import { UpdateKilometrageDialog } from "@/components/vehicles/update-kilometrage-dialog";
import { VehicleActions } from "@/components/vehicles/vehicle-actions";
import { VehicleCostSummaryCard } from "@/components/vehicles/vehicle-cost-summary";
import { VehicleDetailTabs } from "@/components/vehicles/vehicle-detail-tabs";
import { VehicleRemindersCard } from "@/components/vehicles/vehicle-reminders-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getVehicleById, getVehicleHistory } from "@/lib/data/vehicle-repository";
import { getVehicleCostSummary } from "@/lib/costs";
import { getVehicleMaintenanceSummary } from "@/lib/maintenance";
import { getVehicleReminderSummary } from "@/lib/reminders";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanState } from "@/lib/billing/limits";
import { isPaidPlan } from "@/lib/billing/plans";

const categoryLabels = {
  voitures: "Voiture",
  motos: "Moto",
  scooters: "Scooter",
  utilitaires: "Utilitaire"
} as const;

function VehicleIcon({ category }: { category: "voitures" | "motos" | "scooters" | "utilitaires" }) {
  if (category === "voitures") return <Car className="h-12 w-12 text-slate-400 dark:text-slate-500" />;
  if (category === "utilitaires") return <Truck className="h-12 w-12 text-slate-400 dark:text-slate-500" />;
  return <Bike className="h-12 w-12 text-slate-400 dark:text-slate-500" />;
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const vehicle = await getVehicleById(user.id, id);

  if (!vehicle) {
    return (
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-8 text-center text-slate-600 dark:text-slate-300 shadow-ride-sm">
        Véhicule introuvable.
      </div>
    );
  }

  const [history, planState] = await Promise.all([
    getVehicleHistory(user.id, vehicle.id),
    getUserPlanState(user.id)
  ]);
  const { completed, upcoming, modifications, documents, planEntries, maintenanceProfileName } = history;
  const canUseAi = isPaidPlan(planState.plan) && planState.planStatus === "active";
  const summary = getVehicleMaintenanceSummary({
    planEntries,
    currentKm: vehicle.kilometrage,
    avgKmPerYear: vehicle.avg_km_per_year,
    lastOdometerValue: vehicle.last_odometer_value,
    lastOdometerDate: vehicle.last_odometer_date
  });
  const costSummary = getVehicleCostSummary({
    completed,
    modifications,
    currentKm: vehicle.kilometrage
  });
  const reminderSummary = getVehicleReminderSummary({
    planEntries,
    currentKm: vehicle.kilometrage,
    avgKmPerYear: vehicle.avg_km_per_year,
    lastOdometerValue: vehicle.last_odometer_value,
    lastOdometerDate: vehicle.last_odometer_date
  });
  const isExternalImage = Boolean(vehicle.photo_url?.startsWith("http"));
  const isUuidVehicle = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    vehicle.id
  );

  return (
    <section className="space-y-6">
      <Card className="relative overflow-hidden rounded-2xl border-slate-200/80 dark:border-slate-800/80 bg-ride-gradient-card shadow-ride-md">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/40 to-transparent"
        />
        <CardContent className="p-0">
          <div className="grid gap-0 md:grid-cols-[280px_1fr]">
            <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-slate-50 dark:from-slate-950 to-white dark:to-slate-900 sm:h-56 md:h-full">
              {vehicle.photo_url ? (
                <Image
                  src={vehicle.photo_url}
                  alt={`${vehicle.marque} ${vehicle.modele}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 280px"
                  unoptimized={isExternalImage}
                  className="object-contain p-3"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <VehicleIcon category={vehicle.category} />
                </div>
              )}
            </div>
            <div className="space-y-5 p-5 md:p-6">
              <div>
                <Badge
                  variant="outline"
                  className="mb-2 rounded-full border-blue-200 dark:border-blue-900 bg-white/70 dark:bg-slate-900/70 px-3 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 shadow-ride-xs"
                >
                  {categoryLabels[vehicle.category]}
                </Badge>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  {vehicle.marque} {vehicle.modele}
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Année {vehicle.annee} ·{" "}
                  <span className="font-mono tabular-nums">
                    {vehicle.kilometrage.toLocaleString("fr-FR")} km
                  </span>
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="group/tile relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-3 shadow-ride-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-ride-md">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    État entretien
                  </p>
                  <Badge
                    className="mt-2"
                    variant={
                      summary.status === "overdue"
                        ? "danger"
                        : summary.status === "due_soon"
                        ? "warning"
                        : "success"
                    }
                  >
                    {summary.globalLabel}
                  </Badge>
                </div>
                <div className="group/tile relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-3 shadow-ride-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-ride-md">
                  <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <CalendarClock className="h-3 w-3" strokeWidth={2.25} />
                    Prochaine échéance
                  </p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-slate-50">
                    {summary.nextLabel}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {summary.overdueCount} en retard · {summary.dueSoonCount} à prévoir bientôt
                  </p>
                  {summary.dueSoonTitles.length > 0 && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Entretiens bientôt dus : {summary.dueSoonTitles.join(", ")}
                    </p>
                  )}
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-3 shadow-ride-xs">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Compteur
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-mono text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                    <Gauge className="h-4 w-4 text-blue-700 dark:text-blue-300" strokeWidth={2} />
                    {vehicle.kilometrage.toLocaleString("fr-FR")} km
                  </p>
                  <div className="mt-2.5">
                    <UpdateKilometrageDialog
                      vehicleId={vehicle.id}
                      currentKm={vehicle.kilometrage}
                      isDemoVehicle={!isUuidVehicle}
                    />
                  </div>
                  <OdometerRefreshHint lastOdometerDate={vehicle.last_odometer_date} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <VehicleActions vehicleId={vehicle.id} vehicleName={`${vehicle.marque} ${vehicle.modele}`} />
      <VehicleCostSummaryCard summary={costSummary} />
      <VehicleRemindersCard summary={reminderSummary} />

      <VehicleDetailTabs
        vehicleId={vehicle.id}
        completed={completed}
        upcoming={upcoming}
        planEntries={planEntries}
        maintenanceProfileName={maintenanceProfileName}
        modifications={modifications}
        documents={documents}
        category={vehicle.category}
        marque={vehicle.marque}
        modele={vehicle.modele}
        annee={vehicle.annee}
        kilometrage={vehicle.kilometrage}
        dateMiseEnCirculation={vehicle.date_mise_en_circulation}
        dateAchat={vehicle.date_achat}
        immatriculation={vehicle.immatriculation}
        vin={vehicle.vin}
        surnom={vehicle.surnom}
        carburant={vehicle.carburant}
        usageProfile={vehicle.usage_profile}
        canUseAi={canUseAi}
        userPlan={planState.plan}
      />
    </section>
  );
}
