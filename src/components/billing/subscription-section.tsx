import Link from "next/link";
import { AlertCircle, ArrowUpRight, Calendar, Car, Crown, RefreshCw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PLANS } from "@/lib/billing/plans";
import { CancelSubscriptionButton } from "@/components/billing/cancel-subscription-button";
import { SyncSubscriptionButton } from "@/components/billing/sync-subscription-button";
import type { UserPlanState } from "@/lib/billing/limits";

interface SubscriptionSectionProps {
  state: UserPlanState;
}

export function SubscriptionSection({ state }: SubscriptionSectionProps) {
  const planDef = PLANS[state.plan];
  const isPaid = state.plan !== "free";
  const isCanceled = Boolean(state.canceledAt);
  const isPastDue = state.planStatus === "past_due";

  // On propose la resynchronisation manuelle dès que l'utilisateur est en Free
  // ou en `pending`. Deux scénarios :
  //   - mollie_customer_id déjà en DB : webhook raté → resync direct
  //   - mollie_customer_id absent en DB : on cherchera côté Mollie via l'email
  // Cette UX permet à un utilisateur qui a payé mais dont le profil n'a pas été
  // mis à jour de débloquer la situation lui-même.
  const showSyncFallback = state.plan === "free" || state.planStatus === "pending";
  const hasMollieCustomer = Boolean(state.mollieCustomerId);

  const renewsFormatted = state.renewsAt
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(state.renewsAt))
    : null;

  const Icon = state.plan === "family" ? Crown : state.plan === "premium" ? Sparkles : Car;

  const accentClass =
    state.plan === "family"
      ? "border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300"
      : state.plan === "premium"
      ? "border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200";

  return (
    <section
      aria-labelledby="subscription-heading"
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-ride-sm md:p-8"
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
                className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50"
              >
                Abonnement {planDef.name}
              </h2>
              {isPastDue ? (
                <Badge className="rounded-full border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                  Paiement en attente
                </Badge>
              ) : isCanceled ? (
                <Badge className="rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                  Annulé
                </Badge>
              ) : isPaid ? (
                <Badge className="rounded-full border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Actif
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{planDef.description}</p>
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
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-950"
          >
            Voir les plans
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
      </div>

      <Separator className="my-5 bg-slate-200/70 dark:bg-slate-800/70" />

      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-950/50 p-4">
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Car className="h-3.5 w-3.5" aria-hidden />
            Véhicules
          </dt>
          <dd className="mt-1.5 flex items-baseline gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-50">
            <span className="text-2xl">{state.vehicleCount}</span>
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
              / {state.vehicleLimit}
            </span>
          </dd>
          {state.hasReachedVehicleLimit && state.plan !== "family" ? (
            <p className="mt-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
              Limite atteinte. <Link href="/tarifs" className="underline">Voir plans</Link>
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-950/50 p-4">
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Cycle
          </dt>
          <dd className="mt-1.5 text-sm font-medium text-slate-900 dark:text-slate-50">
            {state.planInterval === "monthly"
              ? "Mensuel"
              : state.planInterval === "yearly"
              ? "Annuel"
              : "—"}
          </dd>
        </div>

        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-950/50 p-4">
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {isCanceled ? "Fin de période" : "Prochain prélèvement"}
          </dt>
          <dd className="mt-1.5 text-sm font-medium text-slate-900 dark:text-slate-50">
            {renewsFormatted ?? "—"}
          </dd>
        </div>
      </dl>

      {isPastDue ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/40 p-4 text-sm text-amber-900 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Paiement en échec</p>
            <p className="mt-0.5 text-amber-800 dark:text-amber-300">
              Mollie va retenter automatiquement. Si le problème persiste, vérifiez
              votre moyen de paiement ou réessayez depuis la page Tarifs.
            </p>
          </div>
        </div>
      ) : null}

      {showSyncFallback ? (
        <div className="mt-5 flex flex-col items-start gap-3 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 p-4 text-sm text-blue-900 dark:text-blue-200 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-blue-700 dark:text-blue-300" aria-hidden />
            <div>
              <p className="font-medium">
                Vous avez réglé un paiement, mais votre plan est toujours Free ?
              </p>
              <p className="mt-0.5 text-blue-800 dark:text-blue-200">
                {hasMollieCustomer
                  ? "Cela peut arriver si la notification Mollie n'a pas été reçue. Cliquez ci-contre pour resynchroniser votre abonnement."
                  : "Cliquez ci-contre pour rechercher votre paiement chez Mollie via votre e-mail et activer votre plan."}
              </p>
            </div>
          </div>
          <SyncSubscriptionButton />
        </div>
      ) : null}

      {isPaid && !isCanceled ? (
        <div className="mt-5 flex flex-col items-start gap-2 border-t border-slate-200/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Vous pouvez annuler à tout moment. Votre plan reste actif jusqu&apos;à la
            fin de la période payée.
          </p>
          <CancelSubscriptionButton renewsAt={state.renewsAt} />
        </div>
      ) : null}

      {isCanceled ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 text-sm text-slate-700 dark:text-slate-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
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
