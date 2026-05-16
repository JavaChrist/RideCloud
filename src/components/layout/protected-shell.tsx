import type { ReactNode } from "react";
import Link from "next/link";
import { ProtectedHeader } from "@/components/layout/protected-header";

export function ProtectedShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-50 text-slate-900">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-[900px] bg-ride-mesh opacity-80" />
        <div className="absolute inset-x-0 top-0 h-[1200px] bg-ride-grid bg-ride-grid-sm [mask-image:radial-gradient(ellipse_60%_45%_at_50%_0%,black,transparent)]" />
      </div>

      <ProtectedHeader />
      <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+7rem)] md:px-6">
        {children}
      </main>

      <footer className="relative border-t border-slate-200/70 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row md:px-6">
          <p>© {new Date().getFullYear()} RideCloud · Tous droits réservés</p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/mentions-legales" className="transition hover:text-slate-900">Mentions légales</Link>
            <Link href="/cgu" className="transition hover:text-slate-900">CGU</Link>
            <Link href="/confidentialite" className="transition hover:text-slate-900">Confidentialité</Link>
            <Link href="/rgpd" className="transition hover:text-slate-900">RGPD</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
