import Link from "next/link";
import { Clock, MessageSquareHeart } from "lucide-react";

interface BetaBannerProps {
  daysRemaining: number;
  feedbackSubmitted: boolean;
}

export function BetaBanner({ daysRemaining, feedbackSubmitted }: BetaBannerProps) {
  const isUrgent = daysRemaining <= 2;

  return (
    <div
      className={
        isUrgent
          ? "border-b border-orange-500/30 bg-orange-500/10 px-4 py-2 text-orange-700 dark:text-orange-300"
          : "border-b border-blue-500/30 bg-blue-500/10 px-4 py-2 text-blue-700 dark:text-blue-300"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            <strong>Accès bêta :</strong>{" "}
            {daysRemaining === 1
              ? "il vous reste 1 jour"
              : `il vous reste ${daysRemaining} jours`}
            {feedbackSubmitted ? "." : " — pensez à donner votre avis avant l'expiration."}
          </span>
        </span>

        {!feedbackSubmitted && (
          <Link
            href="/beta-feedback"
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-current/30 px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80"
          >
            <MessageSquareHeart className="h-3.5 w-3.5" />
            Donner mon avis
          </Link>
        )}
      </div>
    </div>
  );
}
