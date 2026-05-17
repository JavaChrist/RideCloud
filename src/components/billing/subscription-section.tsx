import Link from "next/link";
import { AlertCircle, ArrowUpRight, Calendar, Car, Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PLANS } from "@/lib/billing/plans";
import { CancelSubscriptionButton } from "@/components/billing/cancel-subscription-button";
import type { UserPlanState } from "@/lib/billing/limits";

interface SubscriptionSectionProps {
  state: UserPlanState;
}

export function SubscriptionSection({ state }: SubscriptionSectionProps) {
  const planDef = PLANS[state.plan];
  const isPaid = state.plan !== "free";
  const isCanceled = Boolean(state.canceledAt);
  const isPastDue = state.planStatus === "past_due";

  const renewsFormatted = state.renewsAt
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(state.renewsAt))
    : null;

  const Icon = state.plan === "family" ? Crown : state.plan === "premium" ? Sparkles : Car;

  const accentClass =
    state.plan === "family"
      ? "border-purple-200 bg-purple-50 text-purple-700"
      : state.plan === "premium"
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <section
      aria-labelledby="subscription-heading"
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-ride-sm md:p-8"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/30 to-transparent"
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-ride-xs ${accentClass}`}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="subscription-heading"
                className="text-lg font-semibold tracking-tight text-slate-900"
              >
                Abonnement {planDef.name}
              </h2>
              {isPastDue ? (
                <Badge className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                  Paiement en attente
                </Badge>
              ) : isCanceled ? (
                <Badge className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  Annulé
                </Badge>
              ) : isPaid ? (
                <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                  Actif
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-600">{planDef.description}</p>
          </div>
        </div>
        {!isPaid ? (
          <Link
            href="/tarifs"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-md bg-blue-700 px-4 text-sm font-medium text-white shadow-[0_4px_14px_-4px_rgba(29,78,216,0.6)] transition hover:bg-blue-800"
          >
            Passer Premium
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <Link
            href="/tarifs"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Voir les plans
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
      </div>

      <Separator className="my-5 bg-slate-200/70" />

      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4">
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
            <Car className="h-3.5 w-3.5" aria-hidden />
            Véhicules
          </dt>
          <dd className="mt-1.5 flex items-baseline gap-1.5 text-sm font-semibold text-slate-900">
            <span className="text-2xl">{state.vehicleCount}</span>
            <span className="text-sm font-normal text-slate-500">
              / {state.vehicleLimit}
            </span>
          </dd>
          {state.hasReachedVehicleLimit && state.plan !== "family" ? (
            <p className="mt-1.5 text-[11px] font-medium text-amber-700">
              Limite atteinte. <Link href="/tarifs" className="underline">Voir plans</Link>
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4">
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Cycle
          </dt>
          <dd className="mt-1.5 text-sm font-medium text-slate-900">
            {state.planInterval === "monthly"
              ? "Mensuel"
              : state.planInterval === "yearly"
              ? "Annuel"
              : "—"}
          </dd>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4">
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {isCanceled ? "Fin de période" : "Prochain prélèvement"}
          </dt>
          <dd className="mt-1.5 text-sm font-medium text-slate-900">
            {renewsFormatted ?? "—"}
          </dd>
        </div>
      </dl>

      {isPastDue ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Paiement en échec</p>
            <p className="mt-0.5 text-amber-800">
              Mollie va retenter automatiquement. Si le problème persiste, vérifiez
              votre moyen de paiement ou réessayez depuis la page Tarifs.
            </p>
          </div>
        </div>
      ) : null}

      {isPaid && !isCanceled ? (
        <div className="mt-5 flex flex-col items-start gap-2 border-t border-slate-200/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Vous pouvez annuler à tout moment. Votre plan reste actif jusqu&apos;à la
            fin de la période payée.
          </p>
          <CancelSubscriptionButton renewsAt={state.renewsAt} />
        </div>
      ) : null}

      {isCanceled ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
          <p>
            Votre abonnement est annulé. Vous restez en {planDef.name} jusqu&apos;au{" "}
            <strong>{renewsFormatted ?? "—"}</strong>, puis vous repasserez automatiquement
            en Free.
          </p>
        </div>
      ) : null}
    </section>
  );
}
