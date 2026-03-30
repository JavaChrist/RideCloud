import Image from "next/image";
import Link from "next/link";
import { Bike, Car, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Vehicle } from "@/types/database";

function FallbackIcon({ category }: { category: Vehicle["category"] }) {
  if (category === "voitures") return <Car className="h-10 w-10 text-slate-500" />;
  if (category === "utilitaires") return <Truck className="h-10 w-10 text-slate-500" />;
  return <Bike className="h-10 w-10 text-slate-500" />;
}

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const isExternalImage = Boolean(vehicle.photo_url?.startsWith("http"));

  return (
    <Card className="overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden bg-white">
        {vehicle.photo_url ? (
          <Image
            src={vehicle.photo_url}
            alt={`${vehicle.marque} ${vehicle.modele}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={isExternalImage}
            className="object-contain p-0 transition-transform duration-300 hover:scale-[1.02]"

          />
        ) : (
          <div className="flex h-full items-center justify-center"><FallbackIcon category={vehicle.category} /></div>
        )}
      </div>
      <CardHeader className="pb-2"><CardTitle className="text-xl">{vehicle.marque} {vehicle.modele}</CardTitle></CardHeader>
      <CardContent className="space-y-1 text-sm text-slate-600">
        <p>Année : {vehicle.annee}</p>
        <p>Kilométrage : {vehicle.kilometrage.toLocaleString("fr-FR")} km</p>
      </CardContent>
      <CardFooter><Button asChild className="w-full"><Link href={`/vehicule/${vehicle.id}?tab=historique`}>Détails</Link></Button></CardFooter>
    </Card>
  );
}
