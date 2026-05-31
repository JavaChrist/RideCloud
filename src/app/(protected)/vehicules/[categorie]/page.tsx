import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PlusCircle, Search } from "lucide-react";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoryLabels } from "@/lib/data/demo";
import { getVehiclesByCategory } from "@/lib/data/vehicle-repository";
import { createClient } from "@/lib/supabase/server";
import type { VehicleCategory } from "@/types/database";

export default async function CategoryVehiclesPage({ params }: { params: Promise<{ categorie: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { categorie } = await params;
  if (!(categorie in categoryLabels)) notFound();

  const vehicles = await getVehiclesByCategory(user.id, categorie as VehicleCategory);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {categoryLabels[categorie as VehicleCategory]}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            <span className="font-mono tabular-nums">{vehicles.length}</span>{" "}
            véhicule(s) dans cette catégorie.
          </p>
        </div>
        <Button
          asChild
          className="group/cta bg-ride-gradient-primary text-white shadow-ride-glow-sm transition-all duration-300 hover:shadow-ride-glow hover:brightness-110"
        >
          <Link href="/vehicules/nouveau">
            <PlusCircle className="h-4 w-4 transition-transform duration-300 group-hover/cta:rotate-90" strokeWidth={2.25} />
            Ajouter un véhicule
          </Link>
        </Button>
      </div>
      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500"
          strokeWidth={2}
        />
        <Input
          className="pl-10 shadow-ride-xs"
          placeholder="Rechercher un véhicule (placeholder)"
        />
      </div>
      {vehicles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 p-10 text-center text-slate-600 dark:text-slate-300 shadow-ride-xs backdrop-blur-sm">
          <p className="text-base font-medium text-slate-900 dark:text-slate-50">
            Aucun véhicule dans cette catégorie.
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Ajoutez votre premier véhicule pour commencer le suivi.
          </p>
          <Button
            asChild
            className="mt-4 bg-ride-gradient-primary text-white shadow-ride-glow-sm transition-all duration-300 hover:shadow-ride-glow hover:brightness-110"
          >
            <Link href="/vehicules/nouveau">
              <PlusCircle className="h-4 w-4" strokeWidth={2.25} />
              Ajouter un véhicule
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}
    </section>
  );
}
