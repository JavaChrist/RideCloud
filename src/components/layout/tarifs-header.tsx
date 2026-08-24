"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { MobileHeaderMenu, MobileMenuLink } from "@/components/layout/mobile-header-menu";

export function TarifsHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-slate-50/70 pt-safe-top backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Logo compact href="/" />
        <nav className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <Link
              href="/categories"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Tableau de bord
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                Créer un compte
              </Link>
            </>
          )}
        </nav>
        <MobileHeaderMenu>
          {isLoggedIn ? (
            <MobileMenuLink href="/categories">Tableau de bord</MobileMenuLink>
          ) : (
            <>
              <MobileMenuLink href="/login">Connexion</MobileMenuLink>
              <MobileMenuLink href="/register">Créer un compte</MobileMenuLink>
            </>
          )}
        </MobileHeaderMenu>
      </div>
    </header>
  );
}
