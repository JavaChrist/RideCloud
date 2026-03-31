import Image from "next/image";
import { redirect } from "next/navigation";
import { Bike, Car, Gauge, Truck } from "lucide-react";
import { VehicleDetailTabs } from "@/components/vehicles/vehicle-detail-tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getVehicleById, getVehicleHistory } from "@/lib/data/vehicle-repository";
import { createClient } from "@/lib/supabase/server";

function VehicleIcon({ category }: { category: "voitures" | "motos" | "scooters" | "utilitaires" }) {
  if (category === "voitures") return <Car className="h-12 w-12 text-slate-600" />;
  if (category === "utilitaires") return <Truck className="h-12 w-12 text-slate-600" />;
  return <Bike className="h-12 w-12 text-slate-600" />;
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
    return <div className="rounded-xl border bg-white p-8 text-center text-slate-600">Véhicule introuvable.</div>;
  }

  const { completed, upcoming, modifications, documents } = await getVehicleHistory(user.id, vehicle.id);
  const isExternalImage = Boolean(vehicle.photo_url?.startsWith("http"));

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="grid gap-4 md:grid-cols-[280px_1fr]">
            <div className="relative h-56 w-full bg-slate-100 md:h-full">
              {vehicle.photo_url ? (
                <Image
                  src={vehicle.photo_url}
                  alt={`${vehicle.marque} ${vehicle.modele}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 280px"
                  unoptimized={isExternalImage}
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center"><VehicleIcon category={vehicle.category} /></div>
              )}
            </div>
            <div className="space-y-4 p-5">
              <div><h1 className="text-3xl font-semibold tracking-tight">{vehicle.marque} {vehicle.modele}</h1><p className="text-slate-600">Année {vehicle.annee} · {vehicle.kilometrage.toLocaleString("fr-FR")} km</p></div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-slate-50 p-3"><p className="text-sm text-slate-600">État entretien</p><Badge variant="success">Globalement à jour</Badge></div>
                <div className="rounded-xl border bg-slate-50 p-3"><p className="text-sm text-slate-600">Prochaine échéance</p><p className="font-medium">2 000 km</p></div>
                <div className="rounded-xl border bg-slate-50 p-3"><p className="text-sm text-slate-600">Compteur</p><p className="flex items-center gap-2 font-medium"><Gauge className="h-4 w-4" />{vehicle.kilometrage.toLocaleString("fr-FR")} km</p></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <VehicleDetailTabs
        vehicleId={vehicle.id}
        completed={completed}
        upcoming={upcoming}
        modifications={modifications}
        documents={documents}
        immatriculation={vehicle.immatriculation}
        vin={vehicle.vin}
        surnom={vehicle.surnom}
        carburant={vehicle.carburant}
      />
    </section>
  );
}
