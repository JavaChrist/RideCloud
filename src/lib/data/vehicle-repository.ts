import {
  categoryLabels,
  demoDocuments,
  demoMaintenanceEntries,
  demoModifications,
  demoUpcomingMaintenance,
  demoVehicles
} from "@/lib/data/demo";
import { createClient } from "@/lib/supabase/server";
import { formatDateFr } from "@/lib/utils/date";
import type { VehicleCategory } from "@/types/database";

export function formatDate(date: string | null) {
  return formatDateFr(date);
}

function getDemoCategoryCounts() {
  return (Object.keys(categoryLabels) as VehicleCategory[]).map((category) => {
    const count = demoVehicles.filter((vehicle) => vehicle.category === category).length;
    return { slug: category, title: categoryLabels[category], count };
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

async function toDisplayVehicles(vehicles: typeof demoVehicles) {
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

async function mapDocumentsUrls(documents: typeof demoDocuments) {
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

    if (error) return toDisplayVehicles(demoVehicles.filter((vehicle) => vehicle.category === category));
    const vehicles = (data ?? []) as typeof demoVehicles;
    if (vehicles.length === 0) return toDisplayVehicles(demoVehicles.filter((vehicle) => vehicle.category === category));

    return toDisplayVehicles(vehicles);
  } catch {
    return toDisplayVehicles(demoVehicles.filter((vehicle) => vehicle.category === category));
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

    if (error) return demoVehicles.find((vehicle) => vehicle.id === id) ?? null;
    const vehicleData = data as (typeof demoVehicles)[number] | null;
    if (!vehicleData) return demoVehicles.find((vehicle) => vehicle.id === id) ?? null;

    const [vehicle] = await toDisplayVehicles([vehicleData]);
    return vehicle ?? null;
  } catch {
    return demoVehicles.find((vehicle) => vehicle.id === id) ?? null;
  }
}

export async function getVehicleHistory(userId: string, vehicleId: string) {
  try {
    const supabase = await createClient();

    const [completedRes, upcomingRes, modificationsRes, documentsRes] = await Promise.all([
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
        .order("created_at", { ascending: false })
    ]);

    if (completedRes.error || upcomingRes.error || modificationsRes.error || documentsRes.error) {
      return {
        completed: demoMaintenanceEntries.filter((entry) => entry.vehicle_id === vehicleId),
        upcoming: demoUpcomingMaintenance.filter((entry) => entry.vehicle_id === vehicleId),
        modifications: demoModifications.filter((entry) => entry.vehicle_id === vehicleId),
        documents: demoDocuments.filter((entry) => entry.vehicle_id === vehicleId)
      };
    }

    const completed = (completedRes.data ?? []) as typeof demoMaintenanceEntries;
    const upcoming = (upcomingRes.data ?? []) as typeof demoUpcomingMaintenance;
    const modificationsRaw = (modificationsRes.data ?? []) as typeof demoModifications;
    const documents = (documentsRes.data ?? []) as typeof demoDocuments;
    const modifications = await Promise.all(
      modificationsRaw.map(async (item) => {
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

    if (
      completed.length === 0 &&
      upcoming.length === 0 &&
      modifications.length === 0 &&
      documents.length === 0
    ) {
      return {
        completed: demoMaintenanceEntries.filter((entry) => entry.vehicle_id === vehicleId),
        upcoming: demoUpcomingMaintenance.filter((entry) => entry.vehicle_id === vehicleId),
        modifications: demoModifications.filter((entry) => entry.vehicle_id === vehicleId),
        documents: demoDocuments.filter((entry) => entry.vehicle_id === vehicleId)
      };
    }

    return {
      completed,
      upcoming,
      modifications,
      documents: await mapDocumentsUrls(documents)
    };
  } catch {
    return {
      completed: demoMaintenanceEntries.filter((entry) => entry.vehicle_id === vehicleId),
      upcoming: demoUpcomingMaintenance.filter((entry) => entry.vehicle_id === vehicleId),
      modifications: demoModifications.filter((entry) => entry.vehicle_id === vehicleId),
      documents: demoDocuments.filter((entry) => entry.vehicle_id === vehicleId)
    };
  }
}
