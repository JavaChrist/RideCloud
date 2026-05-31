"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CancelSubscriptionButtonProps {
  renewsAt: string | null;
}

export function CancelSubscriptionButton({ renewsAt }: CancelSubscriptionButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const renewsFormatted = renewsAt
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(renewsAt))
    : null;

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/billing/cancel", { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Annulation impossible pour le moment.");
        setIsLoading(false);
        return;
      }
      toast.success(
        renewsFormatted
          ? `Abonnement annulé. Plan actif jusqu'au ${renewsFormatted}.`
          : "Abonnement annulé."
      );
      setConfirmOpen(false);
      router.refresh();
    } catch {
      toast.error("Erreur réseau. Réessayez dans un instant.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!confirmOpen) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => setConfirmOpen(true)}
        className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50"
      >
        Annuler l&apos;abonnement
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <span className="text-sm text-slate-600 dark:text-slate-300">
        Confirmer ?{" "}
        {renewsFormatted ? (
          <span className="text-slate-500 dark:text-slate-400">
            (plan actif jusqu&apos;au {renewsFormatted})
          </span>
        ) : null}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setConfirmOpen(false)}
          disabled={isLoading}
        >
          Non
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleCancel}
          disabled={isLoading}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Annulation…
            </>
          ) : (
            "Oui, annuler"
          )}
        </Button>
      </div>
    </div>
  );
}
