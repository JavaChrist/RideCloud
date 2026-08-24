import type { ReactNode } from "react";
import Link from "next/link";
import { LegalHeader } from "@/components/layout/legal-header";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-[600px] bg-ride-mesh opacity-70" />
        <div className="absolute inset-x-0 top-0 h-[800px] bg-ride-grid dark:bg-ride-grid-light bg-ride-grid-sm [mask-image:radial-gradient(ellipse_60%_40%_at_50%_0%,black,transparent)]" />
      </div>

      <LegalHeader />

      <main className="relative mx-auto w-full max-w-3xl px-4 py-12 md:px-6 md:py-16">
        {children}
      </main>

      <footer className="border-t border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 dark:text-slate-400 sm:flex-row md:px-6">
          <p>© {new Date().getFullYear()} RideCloud · Tous droits réservés</p>
          <nav className="flex flex-wrap items-center gap-4">
            <Link href="/mentions-legales" className="hover:text-slate-900 dark:hover:text-slate-50">Mentions légales</Link>
            <Link href="/cgu" className="hover:text-slate-900 dark:hover:text-slate-50">CGU</Link>
            <Link href="/confidentialite" className="hover:text-slate-900 dark:hover:text-slate-50">Confidentialité</Link>
            <Link href="/rgpd" className="hover:text-slate-900 dark:hover:text-slate-50">RGPD</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
