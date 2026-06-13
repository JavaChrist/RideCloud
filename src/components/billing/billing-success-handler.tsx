"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * BillingSuccessHandler
 *
 * Composant client monté sur /parametres quand `?billing=success` est présent.
 * Il déclenche une resynchronisation Mollie automatique, affiche un toast de
 * confirmation et nettoie l'URL pour éviter le re-déclenchement au refresh.
 */
export function BillingSuccessHandler() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    if (params.get("billing") !== "success") return;

    // Nettoie l'URL immédiatement pour éviter le re-déclenchement.
    const cleanUrl = window.location.pathname;
    window.history.replaceState(null, "", cleanUrl);

    // Toast d'attente pendant la synchronisation.
    const toastId = toast.loading("Activation de votre abonnement en cours…");

    fetch("/api/billing/sync", { method: "POST" })
      .then(async (res) => {
        const data = (await res.json()) as { ok?: boolean; plan?: string; error?: string };

        if (res.ok && data.ok) {
          toast.success("Abonnement activé avec succès !", {
            id: toastId,
            description: data.plan
              ? `Votre plan ${data.plan.charAt(0).toUpperCase() + data.plan.slice(1)} est maintenant actif.`
              : "Bienvenue dans RideCloud Premium 🎉",
            duration: 6000
          });
          // Recharge la page pour refléter le nouveau plan.
          router.refresh();
        } else {
          toast.warning("Paiement reçu", {
            id: toastId,
            description:
              "Votre paiement a bien été enregistré. Si votre plan n'est pas mis à jour dans quelques minutes, utilisez le bouton « Resynchroniser ».",
            duration: 8000
          });
        }
      })
      .catch(() => {
        toast.warning("Paiement reçu", {
          id: toastId,
          description:
            "Impossible de joindre le serveur. Actualisez la page ou cliquez sur « Resynchroniser » si votre plan n'est pas mis à jour.",
          duration: 8000
        });
      });
  }, [router]);

  return null;
}
