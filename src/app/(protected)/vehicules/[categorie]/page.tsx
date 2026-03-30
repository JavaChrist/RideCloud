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
        <div><h1 className="text-3xl font-semibold tracking-tight">{categoryLabels[categorie as VehicleCategory]}</h1><p className="text-slate-600">{vehicles.length} véhicule(s) dans cette catégorie.</p></div>
        <Button asChild><Link href="/vehicules/nouveau"><PlusCircle className="mr-2 h-4 w-4" />Ajouter un véhicule</Link></Button>
      </div>
      <div className="relative max-w-md"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input className="pl-10" placeholder="Rechercher un véhicule (placeholder)" /></div>
      {vehicles.length === 0 ? <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-slate-600">Aucun véhicule dans cette catégorie.</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}</div>}
    </section>
  );
}
