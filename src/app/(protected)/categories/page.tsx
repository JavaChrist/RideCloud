import { redirect } from "next/navigation";
import { CategoryCard } from "@/components/categories/category-card";
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
      <div className="rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">RideCloud Horizon</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          Catégories de véhicules
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
          Choisissez une catégorie pour ouvrir votre parc et accéder à l&apos;historique complet de chaque véhicule.
        </p>
        <div className="mt-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          {totalVehicules} véhicule(s) enregistré(s)
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {categories.map((category) => <CategoryCard key={category.slug} slug={category.slug} title={category.title} />)}
      </div>
    </section>
  );
}
