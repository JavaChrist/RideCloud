"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { MobileHeaderMenu, MobileMenuLink } from "@/components/layout/mobile-header-menu";

export function LegalHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-slate-50/70 pt-safe-top backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200/70 to-transparent"
      />
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 md:px-6">
        <Logo compact href="/" />
        <Link
          href="/"
          className="group hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/60 hover:text-slate-900 md:inline-flex dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-slate-50"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Retour à l&apos;accueil
        </Link>
        <MobileHeaderMenu>
          <MobileMenuLink href="/">Retour à l&apos;accueil</MobileMenuLink>
        </MobileHeaderMenu>
      </div>
    </header>
  );
}
