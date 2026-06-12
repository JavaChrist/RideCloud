import { Clock4 } from "lucide-react";
import { daysSinceOdometerRefresh } from "@/lib/odometer-estimate";

const REMIND_AFTER_DAYS = 30;

interface OdometerRefreshHintProps {
  lastOdometerDate: string;
  /** Permet d'injecter `now` côté tests / SSR pour résultats stables. */
  now?: Date;
}

/**
 * Bannière non bloquante affichée sous le tile "Compteur" de la fiche
 * véhicule. Apparaît uniquement si la dernière saisie réelle du compteur
 * (manuelle OU via un entretien) remonte à plus de 30 jours.
 *
 * Volontairement discrète (texte, pas de popup) pour ne pas casser
 * l'expérience tout en gardant l'utilisateur motivé à recaler.
 */
export function OdometerRefreshHint({ lastOdometerDate, now }: OdometerRefreshHintProps) {
  const days = daysSinceOdometerRefresh({ lastOdometerDate, now });
  if (days == null) return null;

  if (days <= REMIND_AFTER_DAYS) {
    return (
      <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
        Dernière saisie il y a {days} jour{days > 1 ? "s" : ""}
      </p>
    );
  }

  return (
    <p
      className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/40 px-2 py-1 text-[11px] font-medium text-amber-800 dark:text-amber-300"
      role="status"
    >
      <Clock4 className="h-3 w-3" strokeWidth={2.25} aria-hidden />
      Compteur saisi il y a {days} jours — pense à le mettre à jour pour des alertes précises
    </p>
  );
}
