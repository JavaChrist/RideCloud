import Link from "next/link";
import { Sparkles } from "lucide-react";

interface FounderBadgeProps {
  slot: number;
}

/**
 * Petit badge "Fondateur #N" affiché à côté du logo dans le header de l'app.
 * Cliquer dessus mène à la page Fondateur (welcome + benefits).
 */
export function FounderBadge({ slot }: FounderBadgeProps) {
  return (
    <Link
      href="/fondateur"
      aria-label={`Membre fondateur numéro ${slot}`}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-indigo-500/40 bg-gradient-to-r from-blue-600/15 via-indigo-600/20 to-violet-600/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700 shadow-sm transition hover:shadow-md sm:px-2.5 dark:border-indigo-400/40 dark:text-indigo-200"
    >
      <Sparkles className="h-3 w-3" aria-hidden />
      Fondateur #{slot}
    </Link>
  );
}
