import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/common/logo";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-[600px] bg-ride-mesh opacity-70" />
        <div className="absolute inset-x-0 top-0 h-[800px] bg-ride-grid bg-ride-grid-sm [mask-image:radial-gradient(ellipse_60%_40%_at_50%_0%,black,transparent)]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-slate-50/70 backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200/70 to-transparent"
        />
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 md:px-6">
          <Logo />
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/60 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Retour à l&apos;accueil</span>
          </Link>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-3xl px-4 py-12 md:px-6 md:py-16">
        {children}
      </main>

      <footer className="border-t border-slate-200/70 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row md:px-6">
          <p>© {new Date().getFullYear()} RideCloud · Tous droits réservés</p>
          <nav className="flex flex-wrap items-center gap-4">
            <Link href="/mentions-legales" className="hover:text-slate-900">Mentions légales</Link>
            <Link href="/cgu" className="hover:text-slate-900">CGU</Link>
            <Link href="/confidentialite" className="hover:text-slate-900">Confidentialité</Link>
            <Link href="/rgpd" className="hover:text-slate-900">RGPD</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
