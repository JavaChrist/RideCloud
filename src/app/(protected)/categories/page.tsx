import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { CategoryCard } from "@/components/categories/category-card";
import { Badge } from "@/components/ui/badge";
import { getCategoryCounts } from "@/lib/data/vehicle-repository";
import { createClient } from "@/lib/supabase/server";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const categories = await getCategoryCounts(user.id);
  const totalVehicules = categories.reduce((acc, category) => acc + category.count, 0);

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-ride-gradient-card p-5 shadow-ride-sm md:p-7">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/40 to-transparent"
        />
        <Badge
          variant="outline"
          className="mb-3 gap-1.5 rounded-full border-blue-200 bg-white/70 px-3 py-1 text-xs font-medium text-blue-700 shadow-ride-xs backdrop-blur"
        >
          <Sparkles className="h-3 w-3" strokeWidth={2.5} />
          RideCloud · Garage
        </Badge>
        <h1 className="ride-text-balance text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          Catégories de véhicules
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
          Choisissez une catégorie pour ouvrir votre parc et accéder à
          l&apos;historique complet de chaque véhicule.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/80 px-3 py-1 text-sm font-medium text-blue-700 shadow-ride-xs backdrop-blur">
          <span className="font-mono tabular-nums">{totalVehicules}</span>
          véhicule(s) enregistré(s)
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.slug} slug={category.slug} title={category.title} />
        ))}
      </div>
    </section>
  );
}
