"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";

const STORAGE_KEY = "ridecloud.cookieConsent";
const CONSENT_VALUE = "v1-info-dismissed";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== CONSENT_VALUE) {
        const timer = setTimeout(() => setVisible(true), 400);
        return () => clearTimeout(timer);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, CONSENT_VALUE);
    } catch {
      /* localStorage indisponible : on ferme malgré tout pour la session */
    }
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="region"
      aria-label="Information sur les cookies"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 sm:pb-5 md:px-6"
    >
      <div
        className="pointer-events-auto relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25),0_1px_2px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:p-5"
        style={{ animation: "ride-banner-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/30 to-transparent"
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-ride-xs">
              <Cookie className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                Cookies strictement nécessaires
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-3 w-3" aria-hidden />
                  0 tracking
                </span>
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                RideCloud n&apos;utilise <strong>aucun cookie publicitaire ni analytique</strong>.
                Seuls les cookies de session (authentification, préférences) sont
                déposés. Votre consentement n&apos;est donc pas requis.{" "}
                <Link href="/confidentialite" className="font-medium text-blue-700 dark:text-blue-300 hover:underline">
                  En savoir plus
                </Link>
                .
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 px-4 text-sm font-medium text-white dark:text-slate-900 shadow-[0_4px_12px_-4px_rgba(15,23,42,0.5)] transition hover:bg-slate-800 dark:hover:bg-white active:scale-[0.98]"
            >
              J&apos;ai compris
            </button>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Fermer"
              className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes ride-banner-in {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
