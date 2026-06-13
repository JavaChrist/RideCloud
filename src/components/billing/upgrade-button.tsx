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
    } catch {
      toast.error("Erreur réseau. Réessayez dans un instant.");
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
          onConfirm={handleConfirm}
        />
      ) : null}
    </>
  );
}
