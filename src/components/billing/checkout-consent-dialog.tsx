"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PLANS,
  getPriceForInterval,
  getYearlyDiscount,
  CHECKOUT_CONSENT_VERSION
} from "@/lib/billing/plans";
import type { PlanInterval } from "@/types/database";

export interface CheckoutConsentPayload {
  consentAccepted: true;
  consentVersion: string;
  consentAcceptedAt: string;
}

interface CheckoutConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: "premium" | "family";
  interval: PlanInterval;
  isSubmitting: boolean;
  onConfirm: (payload: CheckoutConsentPayload) => void;
}

function formatEuro(value: number): string {
  return value.toString().replace(".", ",");
}

export function CheckoutConsentDialog({
  open,
  onOpenChange,
  plan,
  interval,
  isSubmitting,
  onConfirm
}: CheckoutConsentDialogProps) {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!open) setAccepted(false);
  }, [open]);

  const planDef = PLANS[plan];
  const price = getPriceForInterval(planDef, interval);
  const monthlyEquivalent =
    interval === "yearly" ? (planDef.price.yearly / 12).toFixed(2).replace(".", ",") : null;
  const discount = interval === "yearly" ? getYearlyDiscount(planDef) : 0;

  const handleConfirm = () => {
    if (!accepted || isSubmitting) return;
    onConfirm({
      consentAccepted: true,
      consentVersion: CHECKOUT_CONSENT_VERSION,
      consentAcceptedAt: new Date().toISOString()
    });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isSubmitting && onOpenChange(next)}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-blue-600" aria-hidden />
            Confirmation de votre abonnement {planDef.name}
          </DialogTitle>
          <DialogDescription>
            Vous êtes sur le point d&apos;activer votre abonnement. Quelques précisions
            avant le paiement sécurisé.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-2">
          <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  Plan choisi
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-50">
                  {planDef.name} · {interval === "monthly" ? "Mensuel" : "Annuel"}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Jusqu&apos;à {planDef.vehicleLimit} véhicules
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  {formatEuro(price)}&nbsp;€
                  <span className="ml-1 text-sm font-normal text-slate-500 dark:text-slate-400">
                    /{interval === "monthly" ? "mois" : "an"}
                  </span>
                </p>
                {monthlyEquivalent ? (
                  <p className="mt-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    soit {monthlyEquivalent} €/mois
                    {discount > 0 ? ` · −${discount}\u00a0%` : ""}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/40 p-4 text-sm text-amber-900 dark:text-amber-200">
            <p className="flex items-center gap-1.5 font-semibold">
              <Zap className="h-4 w-4" aria-hidden />
              Activation immédiate — renonciation au délai de 14 jours
            </p>
            <p className="text-[13px] leading-relaxed">
              Le service est activé{" "}
              <strong>immédiatement après votre paiement</strong>. Conformément à
              l&apos;article <strong>L.&nbsp;221-28, 13°</strong> du Code de la
              consommation, vous renoncez à votre droit de rétractation de 14 jours.
            </p>
            <p className="text-[13px] leading-relaxed">
              Vous pouvez résilier à tout moment depuis vos paramètres :
              l&apos;abonnement reste actif jusqu&apos;à la fin de la période payée,
              mais{" "}
              <strong>
                aucun remboursement du temps restant n&apos;est dû
              </strong>
              {interval === "yearly" ? " (y compris pour les abonnements annuels)" : ""}
              .
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 transition hover:border-slate-300 dark:hover:border-slate-700">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              aria-describedby="consent-text"
            />
            <span
              id="consent-text"
              className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-200"
            >
              Je demande expressément l&apos;<strong>activation immédiate</strong> du
              Service, j&apos;ai pris connaissance des{" "}
              <Link
                href="/cgu"
                target="_blank"
                className="font-medium text-blue-700 dark:text-blue-300 underline hover:no-underline"
              >
                CGU/CGV
              </Link>{" "}
              et je <strong>renonce expressément à mon droit de rétractation</strong>{" "}
              de 14 jours. Je reconnais que cet abonnement n&apos;est{" "}
              <strong>pas remboursable</strong> au prorata en cas de résiliation.
            </span>
          </label>

          <p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Paiement sécurisé par Mollie · Données hébergées en Europe · Annulation
            en 1 clic
          </p>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!accepted || isSubmitting}
            className="bg-blue-700 text-white hover:bg-blue-800"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden />
                Redirection vers Mollie…
              </>
            ) : (
              <>Confirmer et payer · {formatEuro(price)}&nbsp;€</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
