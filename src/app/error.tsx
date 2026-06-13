"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 shadow-lg">
          <AlertTriangle className="h-9 w-9 text-red-500 dark:text-red-400" aria-hidden />
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-red-600 dark:text-red-400 mb-2">
          Erreur inattendue
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-3">
          Quelque chose s&apos;est mal passé
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
          Une erreur s&apos;est produite. Vous pouvez réessayer ou retourner à l&apos;accueil.
        </p>
        {error.digest && (
          <p className="mb-8 font-mono text-xs text-slate-400 dark:text-slate-500">
            Référence : {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgba(29,78,216,0.6)] transition hover:bg-blue-800"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-950"
          >
            <Home className="h-4 w-4" aria-hidden />
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}
