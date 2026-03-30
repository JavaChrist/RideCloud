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

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Catégories de véhicules</h1>
        <p className="text-slate-600">Choisissez une catégorie pour afficher la liste des véhicules.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {categories.map((category) => <CategoryCard key={category.slug} slug={category.slug} title={category.title} />)}
      </div>
    </section>
  );
}
