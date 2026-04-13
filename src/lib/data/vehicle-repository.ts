import { categoryLabels } from "@/lib/data/demo";
import { maintenanceTemplates } from "@/lib/data/maintenance-templates";
import { calculateNextMaintenanceDue, getMaintenanceStatus } from "@/lib/maintenance";
import { createClient } from "@/lib/supabase/server";
import { formatDateFr } from "@/lib/utils/date";
import type {
  DocumentItem,
  MaintenanceEntry,
  MaintenancePlanEntry,
  Modification,
  UpcomingMaintenance,
  Vehicle,
  VehicleCategory
} from "@/types/database";

export function formatDate(date: string | null) {
  return formatDateFr(date);
}

function getDemoCategoryCounts() {
  return (Object.keys(categoryLabels) as VehicleCategory[]).map((category) => {
    return { slug: category, title: categoryLabels[category], count: 0 };
  });
}

function normalizeStoragePath(input: string | null) {
  if (!input) return null;
  if (!input.startsWith("http")) return input;

  const marker = "/storage/v1/object/ridecloud-files/";
  const index = input.indexOf(marker);
  if (index === -1) return null;

  const pathWithQuery = input.slice(index + marker.length);
  return pathWithQuery.split("?")[0] ?? null;
}

async function toDisplayVehicles(vehicles: Vehicle[]) {
  const supabase = await createClient();

  const enriched = await Promise.all(
    vehicles.map(async (vehicle) => {
      if (!vehicle.photo_url) {
        return vehicle;
      }

      const storagePath = normalizeStoragePath(vehicle.photo_url);
      if (!storagePath) {
        return vehicle;
      }

      const { data } = await supabase.storage.from("ridecloud-files").createSignedUrl(storagePath, 60 * 60);
      return { ...vehicle, photo_url: data?.signedUrl ?? null };
    })
  );

  return enriched;
}

async function mapDocumentsUrls(documents: DocumentItem[]) {
  const supabase = await createClient();
  const enriched = await Promise.all(
    documents.map(async (document) => {
      if (!document.url || document.url === "#") {
        return document;
      }

      const storagePath = normalizeStoragePath(document.url);
      if (!storagePath) {
        return document;
      }

      const { data } = await supabase.storage.from("ridecloud-files").createSignedUrl(storagePath, 60 * 60);
      return { ...document, url: data?.signedUrl ?? "#" };
    })
  );

  return enriched;
}

async function mapModificationsUrls(modifications: Modification[]) {
  const supabase = await createClient();
  const enriched = await Promise.all(
    modifications.map(async (item) => {
      if (!item.facture_url) {
        return item;
      }

      const storagePath = normalizeStoragePath(item.facture_url);
      if (!storagePath) {
        return item;
      }

      const { data } = await supabase.storage.from("ridecloud-files").createSignedUrl(storagePath, 60 * 60);
      return { ...item, facture_url: data?.signedUrl ?? null };
    })
  );

  return enriched;
}

async function ensureMaintenancePlanEntries(userId: string, vehicle: Vehicle) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_plan_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("vehicle_id", vehicle.id)
    .order("created_at", { ascending: true });

  if (error) {
    return [] as MaintenancePlanEntry[];
  }

  const existing = (data ?? []) as MaintenancePlanEntry[];
  if (existing.length > 0) {
    return existing;
  }

  const templates = maintenanceTemplates[vehicle.category] ?? [];
  if (templates.length === 0) return [];

  const nowIso = new Date().toISOString();
  const payload = templates.map((template) => {
    const due = calculateNextMaintenanceDue({
      intervalKm: template.intervalKm,
      intervalMonths: template.intervalMonths,
      firstDueKm: template.firstDueKm,
      firstDueDate: template.firstDueDate,
      lastDoneKm: null,
      lastDoneDate: null
    });
    const status = getMaintenanceStatus({
      nextDueKm: due.nextDueKm,
      nextDueDate: due.nextDueDate,
      currentKm: vehicle.kilometrage
    });

    return {
      user_id: userId,
      vehicle_id: vehicle.id,
      titre: template.titre,
      categorie: template.categorie,
      description: template.description,
      interval_km: template.intervalKm,
      interval_months: template.intervalMonths,
      first_due_km: template.firstDueKm,
      first_due_date: template.firstDueDate,
      last_done_km: null,
      last_done_date: null,
      next_due_km: due.nextDueKm,
      next_due_date: due.nextDueDate,
      priority: template.priority,
      status,
      source: "template" as const,
      created_at: nowIso,
      updated_at: nowIso
    };
  });

  const { data: inserted, error: insertError } = await supabase
    .from("maintenance_plan_entries")
    .insert(payload as never)
    .select("*");

  if (insertError) {
    return [];
  }

  return (inserted ?? []) as MaintenancePlanEntry[];
}

export async function getCategoryCounts(userId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("vehicles").select("category").eq("user_id", userId);
    if (error) return getDemoCategoryCounts();

    const rows = (data ?? []) as Array<{ category: VehicleCategory }>;
    if (rows.length === 0) return getDemoCategoryCounts();

    return (Object.keys(categoryLabels) as VehicleCategory[]).map((category) => {
      const count = rows.filter((row) => row.category === category).length;
      return { slug: category, title: categoryLabels[category], count };
    });
  } catch {
    return getDemoCategoryCounts();
  }
}

export async function getVehiclesByCategory(userId: string, category: VehicleCategory) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", userId)
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) return [];
    const vehicles = (data ?? []) as Vehicle[];
    if (vehicles.length === 0) return [];

    return toDisplayVehicles(vehicles);
  } catch {
    return [];
  }
}

export async function getVehicleById(userId: string, id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", userId)
      .eq("id", id)
      .maybeSingle();

    if (error) return null;
    const vehicleData = data as Vehicle | null;
    if (!vehicleData) return null;

    const [vehicle] = await toDisplayVehicles([vehicleData]);
    return vehicle ?? null;
  } catch {
    return null;
  }
}

export async function getVehicleHistory(userId: string, vehicleId: string) {
  try {
    const supabase = await createClient();
    const { data: vehicleData } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", userId)
      .eq("id", vehicleId)
      .maybeSingle();
    const vehicle = (vehicleData ?? null) as Vehicle | null;

    const [completedRes, upcomingRes, modificationsRes, documentsRes, planRes] = await Promise.all([
      supabase
        .from("maintenance_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("vehicle_id", vehicleId)
        .order("date_entretien", { ascending: false }),
      supabase
        .from("upcoming_maintenance")
        .select("*")
        .eq("user_id", userId)
        .eq("vehicle_id", vehicleId)
        .order("created_at", { ascending: false }),
      supabase
        .from("modifications")
        .select("*")
        .eq("user_id", userId)
        .eq("vehicle_id", vehicleId)
        .order("created_at", { ascending: false }),
      supabase
        .from("documents")
        .select("*")
        .eq("user_id", userId)
        .eq("vehicle_id", vehicleId)
        .order("created_at", { ascending: false }),
      supabase
        .from("maintenance_plan_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("vehicle_id", vehicleId)
        .order("created_at", { ascending: true })
    ]);

    if (completedRes.error || upcomingRes.error || modificationsRes.error || documentsRes.error || planRes.error) {
      return { completed: [], upcoming: [], modifications: [], documents: [], planEntries: [] };
    }

    const completed = (completedRes.data ?? []) as MaintenanceEntry[];
    const upcoming = (upcomingRes.data ?? []) as UpcomingMaintenance[];
    const modificationsRaw = (modificationsRes.data ?? []) as Modification[];
    const documents = (documentsRes.data ?? []) as DocumentItem[];
    const modifications = await mapModificationsUrls(modificationsRaw);
    const storedPlanEntries = (planRes.data ?? []) as MaintenancePlanEntry[];
    const ensuredPlanEntries =
      storedPlanEntries.length > 0 || !vehicle ? storedPlanEntries : await ensureMaintenancePlanEntries(userId, vehicle);
    const nowIso = new Date().toISOString();
    const currentKm = vehicle?.kilometrage ?? 0;
    const planEntries = ensuredPlanEntries.map((entry) => {
      const due = calculateNextMaintenanceDue({
        intervalKm: entry.interval_km,
        intervalMonths: entry.interval_months,
        firstDueKm: entry.first_due_km,
        firstDueDate: entry.first_due_date,
        lastDoneKm: entry.last_done_km,
        lastDoneDate: entry.last_done_date
      });
      const status = getMaintenanceStatus({
        nextDueKm: due.nextDueKm,
        nextDueDate: due.nextDueDate,
        currentKm
      });

      return {
        ...entry,
        next_due_km: due.nextDueKm,
        next_due_date: due.nextDueDate,
        status,
        updated_at: entry.updated_at ?? nowIso
      };
    });

    return {
      completed,
      upcoming,
      modifications,
      documents: await mapDocumentsUrls(documents),
      planEntries
    };
  } catch {
    return { completed: [], upcoming: [], modifications: [], documents: [], planEntries: [] };
  }
}
