import type {
  MaintenancePlanEntry,
  MaintenancePriority,
  MaintenanceSource,
  MaintenanceStatus,
  VehicleCategory
} from "@/types/database";

export interface MaintenanceTemplateEntry {
  titre: string;
  categorie: string;
  description: string;
  intervalKm: number | null;
  intervalMonths: number | null;
  firstDueKm: number | null;
  firstDueDate: string | null;
  priority: MaintenancePriority;
}

export type MaintenanceTemplateByCategory = Record<VehicleCategory, MaintenanceTemplateEntry[]>;

export interface MaintenanceDueResult {
  nextDueKm: number | null;
  nextDueDate: string | null;
}

export interface MaintenanceStatusInput {
  nextDueKm: number | null;
  nextDueDate: string | null;
  currentKm: number;
  now?: Date;
}

export interface VehicleMaintenanceSummary {
  globalLabel: string;
  nextLabel: string;
  overdueCount: number;
  dueSoonCount: number;
  totalPlanEntries: number;
  status: MaintenanceStatus;
  dueSoonTitles: string[];
  overdueTitles: string[];
}

export interface MarkMaintenanceDonePayload {
  planEntry: MaintenancePlanEntry;
  doneKm: number;
  doneDate: string;
  cout: number | null;
  description: string | null;
  userId: string;
}

export interface PlanItemDisplay {
  id: string;
  titre: string;
  categorie: string;
  source: MaintenanceSource;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  nextDueKm: number | null;
  nextDueDate: string | null;
}
