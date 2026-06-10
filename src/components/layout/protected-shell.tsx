import type { ReactNode } from "react";
import Link from "next/link";
import { ProtectedHeader } from "@/components/layout/protected-header";
import { BetaBanner } from "@/components/beta/beta-banner";
import type { UserPlanState } from "@/lib/billing/limits";

interface ProtectedShellProps {
  children: ReactNode;
  planState?: UserPlanState;
}

export function ProtectedShell({ children, planState }: ProtectedShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-[900px] bg-ride-mesh opacity-80" />
        <div className="absolute inset-x-0 top-0 h-[1200px] bg-ride-grid dark:bg-ride-grid-light bg-ride-grid-sm [mask-image:radial-gradient(ellipse_60%_45%_at_50%_0%,black,transparent)]" />
      </div>

      <ProtectedHeader />

      {planState?.isBetaActive && planState.betaDaysRemaining !== null && planState.betaDaysRemaining <= 7 && (
        <BetaBanner daysRemaining={planState.betaDaysRemaining} feedbackSubmitted={planState.betaFeedbackSubmitted} />
      )}

      <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+7rem)] md:px-6">
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
          </nav>
        </div>
      </footer>
    </div>
  );
}
