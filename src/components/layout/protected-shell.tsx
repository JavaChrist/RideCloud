import type { ReactNode } from "react";
import Link from "next/link";
import { ProtectedHeader } from "@/components/layout/protected-header";
import { NativePushListener } from "@/components/notifications/native-push-listener";
import { FounderBanner } from "@/components/founder/founder-banner";
import type { UserPlanState } from "@/lib/billing/limits";
import { daysLeft, effectiveStatus, type FounderRecord } from "@/lib/billing/founder-program";

interface ProtectedShellProps {
  children: ReactNode;
  planState?: UserPlanState;
  founderRecord?: FounderRecord | null;
}

export function ProtectedShell({ children, planState, founderRecord }: ProtectedShellProps) {
  // Bannière fondateur affichée tant que le questionnaire n'est pas rempli.
  // Couleur urgente si ≤ 3 jours restants.
  const showFounderBanner =
    founderRecord !== null &&
    founderRecord !== undefined &&
    effectiveStatus(founderRecord) === "pending";

  const remaining = founderRecord ? daysLeft(founderRecord.joinedAt) : 0;

  // Lien "Devenir Fondateur" visible pour les utilisateurs qui n'ont pas encore
  // de slot (ni badge), pour leur permettre de découvrir le programme.
  const showFounderCta = !founderRecord && !planState?.founderBadge;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-[900px] bg-ride-mesh opacity-80" />
        <div className="absolute inset-x-0 top-0 h-[1200px] bg-ride-grid dark:bg-ride-grid-light bg-ride-grid-sm [mask-image:radial-gradient(ellipse_60%_45%_at_50%_0%,black,transparent)]" />
      </div>

      <NativePushListener />
      <ProtectedHeader
        founderBadge={planState?.founderBadge ? founderRecord?.slot ?? null : null}
        showFounderCta={showFounderCta}
      />

      {/*
        Le header est `fixed` (hors flux). Ce spacer invisible compense sa hauteur
        pour que la bannière fondateur (et le main) commencent sous le header.
        Hauteur = safe-area-inset-top + ~3.5rem (py-3 × 2 + logo compact).
      */}
      <div aria-hidden className="h-[calc(var(--rc-safe-area-top)+3.5rem)] shrink-0" />

      {showFounderBanner && founderRecord && (
        <FounderBanner slot={founderRecord.slot} daysRemaining={remaining} />
      )}

      <main className={`relative mx-auto w-full max-w-6xl flex-1 px-4 pb-10 md:px-6 ${
        showFounderBanner ? "pt-4 md:pt-6" : "pt-[calc(var(--rc-safe-area-top)+3.5rem)]"
      }`}>
        {children}
      </main>

      <footer className="relative border-t border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 dark:text-slate-400 sm:flex-row md:px-6">
          <p>© {new Date().getFullYear()} RideCloud · Tous droits réservés</p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/mentions-legales" className="transition hover:text-slate-900 dark:hover:text-slate-50">Mentions légales</Link>
            <Link href="/cgu" className="transition hover:text-slate-900 dark:hover:text-slate-50">CGU</Link>
            <Link href="/confidentialite" className="transition hover:text-slate-900 dark:hover:text-slate-50">Confidentialité</Link>
            <Link href="/rgpd" className="transition hover:text-slate-900 dark:hover:text-slate-50">RGPD</Link>
            <Link href="/suppression-compte" className="transition hover:text-slate-900 dark:hover:text-slate-50">Supprimer mon compte</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
