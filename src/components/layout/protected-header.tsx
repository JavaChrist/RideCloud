import Link from "next/link";
import { Settings, Sparkles } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { FounderBadge } from "@/components/founder/founder-badge";

interface ProtectedHeaderProps {
  /** Numéro de slot fondateur si l'utilisateur a débloqué son badge. `null` sinon. */
  founderBadge?: number | null;
  /** Affiche le CTA "Devenir Fondateur" pour les non-membres. */
  showFounderCta?: boolean;
}

export function ProtectedHeader({ founderBadge, showFounderCta }: ProtectedHeaderProps = {}) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-200/70 bg-slate-50/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl supports-[backdrop-filter]:bg-slate-50/50 dark:border-slate-800/70 dark:bg-slate-950/70 dark:supports-[backdrop-filter]:bg-slate-950/50">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-700/25 to-transparent dark:via-blue-400/25"
      />
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <Logo compact />
          {founderBadge !== null && founderBadge !== undefined && (
            <FounderBadge slot={founderBadge} />
          )}
        </div>
        <nav className="flex items-center gap-1">
          <ThemeToggle />
          {showFounderCta && (
            <Link
              href="/fondateur"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-indigo-300/60 dark:border-indigo-700/60 bg-gradient-to-r from-blue-500/10 via-indigo-500/15 to-violet-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition hover:shadow-sm"
            >
              <Sparkles className="h-3 w-3" aria-hidden />
              Devenir Fondateur
            </Link>
          )}
          <Link
            href="/parametres"
            aria-label="Paramètres du compte"
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            <Settings className="h-4 w-4" strokeWidth={2} aria-hidden />
            <span className="hidden sm:inline">Paramètres</span>
          </Link>
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}
