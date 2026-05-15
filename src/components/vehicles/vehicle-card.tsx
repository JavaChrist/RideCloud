import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bike, Car, Gauge, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Vehicle } from "@/types/database";

function FallbackIcon({ category }: { category: Vehicle["category"] }) {
  if (category === "voitures") return <Car className="h-10 w-10 text-slate-400" />;
  if (category === "utilitaires") return <Truck className="h-10 w-10 text-slate-400" />;
  return <Bike className="h-10 w-10 text-slate-400" />;
}

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const isExternalImage = Boolean(vehicle.photo_url?.startsWith("http"));

  return (
    <Card className="group/card relative overflow-hidden rounded-2xl border-slate-200/80 bg-ride-gradient-card shadow-ride-xs transition-all duration-500 ease-ride-spring hover:-translate-y-1 hover:border-blue-200 hover:shadow-ride-lg">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/40 to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
      />

      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-b from-white to-slate-50">
        {vehicle.photo_url ? (
          <Image
            src={vehicle.photo_url}
            alt={`${vehicle.marque} ${vehicle.modele}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={isExternalImage}
            className="object-contain p-2 transition-transform duration-500 ease-ride-spring group-hover/card:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FallbackIcon category={vehicle.category} />
          </div>
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/80 to-transparent"
        />
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-3 text-xl">
          <span className="truncate">
            {vehicle.marque} {vehicle.modele}
          </span>
          <span
            aria-hidden
            className="text-[11px] font-medium uppercase tracking-wider text-slate-400"
          >
            {vehicle.annee}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-1.5 text-sm text-slate-600">
        <p className="flex items-center gap-2">
          <Gauge className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
          <span className="font-mono tabular-nums">
            {vehicle.kilometrage.toLocaleString("fr-FR")} km
          </span>
        </p>
      </CardContent>

      <CardFooter>
        <Button
          asChild
          className="group/cta w-full bg-ride-gradient-primary text-white shadow-ride-glow-sm transition-all duration-300 hover:shadow-ride-glow hover:brightness-110"
        >
          <Link href={`/vehicule/${vehicle.id}?tab=historique`}>
            Détails
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
              strokeWidth={2.25}
            />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
