import { isAfter, parseISO, startOfMonth, startOfYear } from "date-fns";
import type { MaintenanceEntry, Modification } from "@/types/database";
import type { VehicleCostSummary } from "@/types/maintenance";

function safeCost(value: number | null) {
  return value ?? 0;
}

export function getVehicleCostSummary(input: {
  completed: MaintenanceEntry[];
  modifications: Modification[];
  currentKm: number;
  now?: Date;
}): VehicleCostSummary {
  const now = input.now ?? new Date();
  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);

  const maintenanceTotal = input.completed.reduce((acc, item) => acc + safeCost(item.cout), 0);
  const modificationsTotal = input.modifications.reduce((acc, item) => acc + safeCost(item.cout), 0);
  const totalCost = maintenanceTotal + modificationsTotal;

  const monthlyMaintenance = input.completed
    .filter((item) => isAfter(parseISO(item.date_entretien), monthStart) || item.date_entretien === monthStart.toISOString().slice(0, 10))
    .reduce((acc, item) => acc + safeCost(item.cout), 0);
  const yearlyMaintenance = input.completed
    .filter((item) => isAfter(parseISO(item.date_entretien), yearStart) || item.date_entretien === yearStart.toISOString().slice(0, 10))
    .reduce((acc, item) => acc + safeCost(item.cout), 0);

  const monthlyModifications = input.modifications
    .filter((item) => item.date_pose && (isAfter(parseISO(item.date_pose), monthStart) || item.date_pose === monthStart.toISOString().slice(0, 10)))
    .reduce((acc, item) => acc + safeCost(item.cout), 0);
  const yearlyModifications = input.modifications
    .filter((item) => item.date_pose && (isAfter(parseISO(item.date_pose), yearStart) || item.date_pose === yearStart.toISOString().slice(0, 10)))
    .reduce((acc, item) => acc + safeCost(item.cout), 0);

  const monthlyCost = monthlyMaintenance + monthlyModifications;
  const yearlyCost = yearlyMaintenance + yearlyModifications;
  const costPerKm = input.currentKm > 0 ? totalCost / input.currentKm : 0;

  return {
    monthlyCost,
    yearlyCost,
    totalCost,
    maintenanceCost: maintenanceTotal,
    modificationsCost: modificationsTotal,
    costPerKm
  };
}
