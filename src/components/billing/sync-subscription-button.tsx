"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface SyncSubscriptionButtonProps {
  variant?: "default" | "subtle";
}

export function SyncSubscriptionButton({ variant = "default" }: SyncSubscriptionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/billing/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const result = (await response.json()) as {
        ok?: boolean;
        synced?: string;
        plan?: string;
        planStatus?: string;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        toast.error(result.error ?? "Resynchronisation échouée.");
        return;
      }

      if (result.synced === "subscription_created") {
        toast.success(
          `Abonnement ${result.plan} activé ! Votre profil est maintenant à jour.`
        );
      } else {
        toast.success("Abonnement resynchronisé avec Mollie.");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur réseau pendant la resynchronisation.");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "subtle") {
    return (
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 transition hover:text-blue-900 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="h-3 w-3" aria-hidden strokeWidth={2.25} />
        )}
        {loading ? "Synchronisation…" : "Resynchroniser depuis Mollie"}
      </button>
    );
  }

  return (
    <Button
      type="button"
      onClick={handleSync}
      disabled={loading}
      variant="outline"
      className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Synchronisation…
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" aria-hidden strokeWidth={2.25} />
          Resynchroniser mon abonnement
        </>
      )}
    </Button>
  );
}
