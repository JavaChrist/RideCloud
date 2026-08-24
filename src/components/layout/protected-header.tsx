import Link from "next/link";
import { Settings, Sparkles } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeMenuRow, ThemeToggle } from "@/components/common/theme-toggle";
import { FounderBadge } from "@/components/founder/founder-badge";
import { NotificationsProvider } from "@/components/notifications/notifications-provider";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { MobileHeaderMenu, MobileMenuLink, menuItemClassName } from "@/components/layout/mobile-header-menu";

interface ProtectedHeaderProps {
  /** Numéro de slot fondateur si l'utilisateur a débloqué son badge. `null` sinon. */
  founderBadge?: number | null;
  /** Affiche le CTA "Devenir Fondateur" pour les non-membres. */
  showFounderCta?: boolean;
}

export function ProtectedHeader({ founderBadge, showFounderCta }: ProtectedHeaderProps = {}) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-200/70 bg-slate-50/70 pt-safe-top backdrop-blur-xl supports-[backdrop-filter]:bg-slate-50/50 dark:border-slate-800/70 dark:bg-slate-950/70 dark:supports-[backdrop-filter]:bg-slate-950/50">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-700/25 to-transparent dark:via-blue-400/25"
      />
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Logo compact />
          {founderBadge !== null && founderBadge !== undefined && (
            <FounderBadge slot={founderBadge} />
          )}
        </div>
        <nav className="flex shrink-0 items-center gap-1">
          <ThemeToggle className="hidden md:inline-flex" />
          <NotificationsProvider>
            <NotificationBell />
          </NotificationsProvider>
          {showFounderCta && (
            <Link
              href="/fondateur"
              aria-label="Devenir Membre Fondateur RideCloud"
              className="inline-flex items-center gap-1.5 rounded-full border border-indigo-300/60 bg-gradient-to-r from-blue-500/10 via-indigo-500/15 to-violet-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-700 transition hover:shadow-sm dark:border-indigo-700/60 dark:text-indigo-300 sm:px-3 sm:py-1.5"
            >
              <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Devenir Fondateur</span>
              <span className="sm:hidden">Fondateur</span>
            </Link>
          )}
          <Link
            href="/parametres"
            aria-label="Paramètres du compte"
            className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:inline-flex dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            <Settings className="h-4 w-4" strokeWidth={2} aria-hidden />
            <span className="hidden sm:inline">Paramètres</span>
          </Link>
          <div className="hidden md:block">
            <SignOutButton />
          </div>
          <MobileHeaderMenu>
            <ThemeMenuRow />
            <MobileMenuLink href="/parametres">
              <Settings className="h-4 w-4" strokeWidth={2} aria-hidden />
              Paramètres
            </MobileMenuLink>
            <SignOutButton
              alwaysShowLabel
              className={`${menuItemClassName} justify-start px-3`}
            />
          </MobileHeaderMenu>
        </nav>
      </div>
    </header>
  );
}
