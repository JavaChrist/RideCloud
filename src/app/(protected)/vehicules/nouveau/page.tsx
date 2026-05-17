import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Sparkles, Lock } from "lucide-react";
import { AddVehicleForm } from "@/components/vehicles/add-vehicle-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanState } from "@/lib/billing/limits";
import { PLANS } from "@/lib/billing/plans";

export default async function NewVehiclePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const state = await getUserPlanState(user.id);

  if (state.hasReachedVehicleLimit) {
    const currentPlanDef = PLANS[state.plan];
    const nextPlan = state.plan === "free" ? PLANS.premium : PLANS.family;
    const isAtMax = state.plan === "family";

    return (
      <section className="space-y-6">
        <div>
          <Badge
            variant="outline"
            className="mb-3 gap-1.5 rounded-full border-amber-200 bg-amber-50/70 px-3 py-1 text-xs font-medium text-amber-800 shadow-ride-xs backdrop-blur"
          >
            <Lock className="h-3 w-3" strokeWidth={2.5} />
            Limite atteinte
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Vous avez atteint la limite du plan {currentPlanDef.name}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Votre plan actuel autorise <strong>{state.vehicleLimit} véhicule
            {state.vehicleLimit > 1 ? "s" : ""}</strong>. Vous en avez déjà{" "}
            {state.vehicleCount}.{" "}
            {isAtMax
              ? "Le plan Family est notre offre maximale en libre-service. Contactez-nous si vous souhaitez gérer une flotte plus importante."
              : "Passez au plan supérieur pour continuer à ajouter des véhicules."}
          </p>
        </div>

        {!isAtMax ? (
          <article className="relative overflow-hidden rounded-3xl border border-blue-200 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(29,78,216,0.45),0_1px_2px_rgba(15,23,42,0.04)] md:p-8">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/60 to-transparent"
            />
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  Recommandé
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                  Passez au plan {nextPlan.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {nextPlan.description}
                </p>
                <ul className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  {nextPlan.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end md:text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-slate-900">
                    {nextPlan.price.monthly.toString().replace(".", ",")}
                  </span>
                  <span className="text-xl text-slate-400">€</span>
                  <span className="ml-1 text-sm text-slate-500">/ mois</span>
                </div>
                <p className="text-xs text-slate-500">ou {nextPlan.price.yearly} €/an</p>
                <Link
                  href="/tarifs"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-[0_4px_14px_-4px_rgba(29,78,216,0.6)] transition hover:bg-blue-800"
                >
                  Voir tous les plans
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </article>
        ) : (
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-ride-sm md:p-8">
            <p className="text-sm text-slate-600">
              Besoin d&apos;une offre flotte ?{" "}
              <a href="mailto:support@javachrist.fr" className="font-medium text-blue-700 hover:underline">
                Contactez-nous
              </a>
              .
            </p>
          </article>
        )}

        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition hover:text-slate-900"
        >
          ← Retour à mes véhicules
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <Badge
          variant="outline"
          className="mb-3 gap-1.5 rounded-full border-blue-200 bg-white/70 px-3 py-1 text-xs font-medium text-blue-700 shadow-ride-xs backdrop-blur"
        >
          <Sparkles className="h-3 w-3" strokeWidth={2.5} />
          Nouveau véhicule
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Ajouter un véhicule
        </h1>
        <p className="text-slate-600">
          Créez une fiche complète avec les informations de base.
        </p>
        {state.plan === "free" ? (
          <p className="mt-2 text-xs text-slate-500">
            Plan Free : {state.vehicleCount}/{state.vehicleLimit} véhicule utilisé ·{" "}
            <Link href="/tarifs" className="font-medium text-blue-700 hover:underline">
              Passez Premium
            </Link>{" "}
            pour en ajouter jusqu&apos;à {PLANS.premium.vehicleLimit}.
          </p>
        ) : (
          <p className="mt-2 text-xs text-slate-500">
            Plan {PLANS[state.plan].name} : {state.vehicleCount}/{state.vehicleLimit} véhicules
            utilisés.
          </p>
        )}
      </div>
      <Card className="relative overflow-hidden rounded-2xl border-slate-200/80 bg-ride-gradient-card shadow-ride-sm">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/40 to-transparent"
        />
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">
            Nouveau véhicule
          </CardTitle>
          <CardDescription>
            Formulaire en français avec catalogue local.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddVehicleForm />
        </CardContent>
      </Card>
    </section>
  );
}
