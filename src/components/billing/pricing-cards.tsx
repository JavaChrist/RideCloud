"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import {
  PLANS,
  formatPrice,
  getPriceForInterval,
  getYearlyDiscount
} from "@/lib/billing/plans";
import type { Plan, PlanInterval } from "@/types/database";
import { UpgradeButton } from "@/components/billing/upgrade-button";

interface PricingCardsProps {
  isLoggedIn: boolean;
  currentPlan: Plan | null;
  currentInterval: PlanInterval | null;
  hasActiveSubscription: boolean;
  defaultInterval?: PlanInterval;
}

export function PricingCards({
  isLoggedIn,
  currentPlan,
  currentInterval,
  hasActiveSubscription,
  defaultInterval = "monthly"
}: PricingCardsProps) {
  const [interval, setInterval] = useState<PlanInterval>(defaultInterval);

  const orderedPlans = useMemo(() => [PLANS.free, PLANS.premium, PLANS.family], []);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-center">
        <div
          role="tablist"
          aria-label="Choisir la fréquence de facturation"
          className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-1 shadow-ride-xs"
        >
          {(["monthly", "yearly"] as PlanInterval[]).map((value) => {
            const active = interval === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setInterval(value)}
                className={`relative inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-slate-900 text-white shadow-[0_4px_12px_-4px_rgba(15,23,42,0.5)]"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50"
                }`}
              >
                {value === "monthly" ? "Mensuel" : "Annuel"}
                {value === "yearly" ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                    }`}
                  >
                    −18 %
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {orderedPlans.map((plan) => {
          const price = getPriceForInterval(plan, interval);
          const isHighlight = plan.highlight === true;
          const yearlyDiscount = getYearlyDiscount(plan);

          return (
            <article
              key={plan.id}
              className={`relative flex flex-col overflow-hidden rounded-3xl border bg-white dark:bg-slate-900 p-6 transition-all duration-300 md:p-8 ${
                isHighlight
                  ? "border-blue-200 dark:border-blue-900 shadow-[0_24px_60px_-30px_rgba(29,78,216,0.45),0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-blue-100"
                  : "border-slate-200/80 dark:border-slate-800/80 shadow-ride-sm hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(15,23,42,0.18)]"
              }`}
            >
              {isHighlight ? (
                <>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/60 to-transparent"
                  />
                  <div className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                    <Sparkles className="h-3 w-3" aria-hidden />
                    Populaire
                  </div>
                </>
              ) : null}

              <header>
                <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{plan.tagline}</p>
              </header>

              <div className="mt-6 flex items-baseline gap-1">
                {price === 0 ? (
                  <span className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    Gratuit
                  </span>
                ) : (
                  <>
                    <span className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      {price.toString().replace(".", ",")}
                    </span>
                    <span className="text-xl text-slate-400 dark:text-slate-500">€</span>
                    <span className="ml-1 text-sm text-slate-500 dark:text-slate-400">
                      / {interval === "monthly" ? "mois" : "an"}
                    </span>
                  </>
                )}
              </div>
              {interval === "yearly" && yearlyDiscount > 0 ? (
                <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Soit {(plan.price.yearly / 12).toFixed(2).replace(".", ",")} €/mois ·
                  économisez {yearlyDiscount}&nbsp;%
                </p>
              ) : null}

              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {plan.description}
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 stroke-[2.5] ${
                        isHighlight ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                      aria-hidden
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {plan.id === "free" ? (
                  isLoggedIn && currentPlan === "free" ? (
                    <Link
                      href="/categories"
                      className="inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Plan actuel
                    </Link>
                  ) : (
                    <Link
                      href={isLoggedIn ? "/categories" : "/register"}
                      className="inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-950"
                    >
                      {plan.cta}
                    </Link>
                  )
                ) : (
                  <UpgradeButton
                    plan={plan.id as "premium" | "family"}
                    interval={interval}
                    isLoggedIn={isLoggedIn}
                    currentPlan={currentPlan}
                    currentInterval={currentInterval}
                    hasActiveSubscription={hasActiveSubscription}
                    label={plan.cta}
                    variant={isHighlight ? "default" : "outline"}
                    className={
                      isHighlight
                        ? "w-full bg-blue-700 text-white shadow-[0_4px_14px_-4px_rgba(29,78,216,0.6)] hover:bg-blue-800"
                        : "w-full"
                    }
                  />
                )}
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Paiement sécurisé par Mollie · Sans engagement · Annulation en 1 clic ·
        Données hébergées en Europe
      </p>
    </div>
  );
}

export function formatPriceUtility(value: number, interval: PlanInterval) {
  return formatPrice(value, interval);
}
