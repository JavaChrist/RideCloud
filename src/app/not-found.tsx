import Link from "next/link";
import { Car, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
            <Search className="h-9 w-9 text-slate-400" aria-hidden />
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
            Erreur 404
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-3">
            Page introuvable
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgba(29,78,216,0.6)] transition hover:bg-blue-800"
            >
              <Home className="h-4 w-4" aria-hidden />
              Accueil
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-950"
            >
              <Car className="h-4 w-4" aria-hidden />
              Mes véhicules
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
