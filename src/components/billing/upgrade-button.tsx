"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Plan, PlanInterval } from "@/types/database";
import {
  CheckoutConsentDialog,
  type CheckoutConsentPayload
} from "@/components/billing/checkout-consent-dialog";
import { isCapacitorAndroid } from "@/lib/pwa/environment";
import { loadPlayBillingBridge } from "@/lib/billing/play-billing-bridge";

interface UpgradeButtonProps {
  plan: "premium" | "family";
  interval: PlanInterval;
  isLoggedIn: boolean;
  currentPlan: Plan | null;
  currentInterval: PlanInterval | null;
  hasActiveSubscription: boolean;
  label: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function UpgradeButton({
  plan,
  interval,
  isLoggedIn,
  currentPlan,
  currentInterval,
  hasActiveSubscription,
  label,
  className,
  variant = "default"
}: UpgradeButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);

  const isCurrentPlan =
    isLoggedIn && currentPlan === plan && currentInterval === interval;

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push(`/register?next=/tarifs&plan=${plan}&interval=${interval}`);
      return;
    }
    if (isCurrentPlan) return;
    setConsentOpen(true);
  };

  const handleConfirm = async (consent: CheckoutConsentPayload) => {
    setIsLoading(true);
    try {
      if (isCapacitorAndroid()) {
        const prepared = await fetch("/api/billing/play/prepare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, interval, consent })
        });
        const preparedData = (await prepared.json().catch(() => ({}))) as {
          productId?: string;
          obfuscatedAccountId?: string;
          error?: string;
        };
        if (!prepared.ok || !preparedData.productId || !preparedData.obfuscatedAccountId) {
          toast.error(preparedData.error ?? "Impossible de préparer l'achat Google Play.");
          setIsLoading(false);
          return;
        }

        const billing = await loadPlayBillingBridge();
        const purchase = await billing.purchase({
          productId: preparedData.productId,
          obfuscatedAccountId: preparedData.obfuscatedAccountId
        });

        const verified = await fetch("/api/billing/play/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            purchaseToken: purchase.purchaseToken,
            productId: purchase.productId,
            orderId: purchase.orderId,
            consent
          })
        });
        const verifiedData = (await verified.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
        };
        if (!verified.ok || !verifiedData.ok) {
          toast.error(verifiedData.error ?? "Achat Google Play non confirmé.");
          setIsLoading(false);
          return;
        }

        toast.success("Abonnement activé.");
        setConsentOpen(false);
        setIsLoading(false);
        router.push("/parametres?billing=success");
        router.refresh();
        return;
      }

      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval, consent })
      });
      const data = (await response.json().catch(() => ({}))) as {
        checkoutUrl?: string;
        error?: string;
      };
      if (!response.ok || !data.checkoutUrl) {
        toast.error(data.error ?? "Impossible de démarrer le paiement.");
        setIsLoading(false);
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("USER_CANCELED") || message.includes("Achat annulé")) {
        toast.message("Achat annulé.");
      } else {
        toast.error(message || "Erreur réseau. Réessayez dans un instant.");
      }
      setIsLoading(false);
    }
  };

  if (isCurrentPlan) {
    return (
      <Button type="button" disabled className={className} variant="secondary">
        Plan actuel
      </Button>
    );
  }

  return (
    <>
      <Button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        variant={variant}
        className={className}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Redirection…
          </>
        ) : (
          <>
            {label}
            {hasActiveSubscription && currentPlan !== "free" ? null : null}
          </>
        )}
      </Button>
      {isLoggedIn ? (
        <CheckoutConsentDialog
          open={consentOpen}
          onOpenChange={setConsentOpen}
          plan={plan}
          interval={interval}
          isSubmitting={isLoading}
          provider={isCapacitorAndroid() ? "play" : "mollie"}
          onConfirm={handleConfirm}
        />
      ) : null}
    </>
  );
}
