import Link from "next/link";
import { Sparkles, MessageSquareHeart } from "lucide-react";

interface FounderBannerProps {
  slot: number;
  daysRemaining: number;
}

/**
 * Bannière haut d'application affichée aux Membres Fondateurs dont le
 * questionnaire n'est pas encore rempli. Couleur "ai" (gradient indigo)
 * en temps normal ; orange (urgent) si ≤ 3 jours restants.
 */
export function FounderBanner({ slot, daysRemaining }: FounderBannerProps) {
  const isUrgent = daysRemaining <= 3;

  const baseClass = isUrgent
    ? "border-b border-orange-500/30 bg-orange-500/10 text-orange-800 dark:text-orange-200"
    : "border-b border-indigo-500/30 bg-gradient-to-r from-blue-500/10 via-indigo-500/15 to-violet-500/10 text-indigo-800 dark:text-indigo-100";

  return (
    <div className={`${baseClass} px-4 py-2`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>
            <strong>Fondateur·rice #{slot}</strong>
            {" — "}
            {daysRemaining === 0
              ? "dernier jour pour remplir le questionnaire."
              : daysRemaining === 1
              ? "il vous reste 1 jour pour remplir le questionnaire."
              : `il vous reste ${daysRemaining} jours pour remplir le questionnaire.`}
            {" "}Premium à vie + badge à la clé.
          </span>
        </span>

        <Link
          href="/fondateur/questionnaire"
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-current/30 px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80"
        >
          <MessageSquareHeart className="h-3.5 w-3.5" />
          Donner mon avis
        </Link>
      </div>
    </div>
  );
}
