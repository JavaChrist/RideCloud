import Image from "next/image";
import { redirect } from "next/navigation";
import { Bike, Car, Gauge, Truck } from "lucide-react";
import { DocumentsList } from "@/components/documents/documents-list";
import { HistorySections } from "@/components/history/history-sections";
import { ModificationsList } from "@/components/modifications/modifications-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

      <Tabs defaultValue="historique" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="historique">Historique</TabsTrigger>
          <TabsTrigger value="modifications">Modifications</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="informations">Informations</TabsTrigger>
        </TabsList>
        <TabsContent value="historique"><HistorySections vehicleId={vehicle.id} completed={completed} upcoming={upcoming} /></TabsContent>
        <TabsContent value="modifications"><ModificationsList vehicleId={vehicle.id} items={modifications} /></TabsContent>
        <TabsContent value="documents"><DocumentsList vehicleId={vehicle.id} items={documents} /></TabsContent>
        <TabsContent value="informations"><Card><CardContent className="space-y-2 p-4 text-sm text-slate-700"><p>Immatriculation : {vehicle.immatriculation ?? "-"}</p><p>VIN : {vehicle.vin ?? "-"}</p><p>Surnom : {vehicle.surnom ?? "-"}</p><p>Carburant : {vehicle.carburant ?? "-"}</p></CardContent></Card></TabsContent>
      </Tabs>
    </section>
  );
}
