"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DeleteAccountSectionProps {
  email: string;
}

export function DeleteAccountSection({ email }: DeleteAccountSectionProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !isDeleting) {
          setIsOpen(false);
        }
      };
      window.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(timer);
        window.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, isDeleting]);

  const isMatch = confirmation.trim().toLowerCase() === email.trim().toLowerCase();

  const handleDelete = async () => {
    if (!isMatch || isDeleting) return;
    setIsDeleting(true);
    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: confirmation.trim() })
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; ok?: boolean };

      if (!response.ok || !data.ok) {
        toast.error(data.error ?? "Impossible de supprimer le compte pour le moment.");
        setIsDeleting(false);
        return;
      }

      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Compte supprimé. À bientôt.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Une erreur réseau est survenue. Réessayez dans un instant.");
      setIsDeleting(false);
    }
  };

  return (
    <section
      aria-labelledby="delete-account-heading"
      className="relative overflow-hidden rounded-3xl border border-red-200/70 dark:border-red-900/70 bg-gradient-to-br from-red-50/60 dark:from-red-950/40 via-white dark:via-slate-900 to-white dark:to-slate-900 p-6 shadow-ride-sm md:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-300/70 to-transparent"
      />
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 shadow-ride-xs">
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex-1">
          <h2 id="delete-account-heading" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Supprimer définitivement mon compte
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Cette action supprime <strong>l&apos;ensemble</strong> de vos données&nbsp;:
            véhicules, entretiens, rappels, modifications, documents, photos et fichiers
            téléversés. Elle est <strong>irréversible</strong>.
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Conformément à l&apos;article 17 du RGPD, votre demande est traitée
            immédiatement. La suppression est effective sous quelques secondes côté
            serveur.
          </p>
          <Button
            type="button"
            onClick={() => {
              setConfirmation("");
              setIsOpen(true);
            }}
            className="mt-5 gap-2 bg-red-600 text-white shadow-[0_4px_12px_-4px_rgba(220,38,38,0.5)] transition hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Supprimer mon compte
          </Button>
        </div>
      </div>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => !isDeleting && setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            disabled={isDeleting}
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-red-50 dark:from-red-950/40 to-white dark:to-slate-900 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-ride-xs">
                  <AlertTriangle className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 id="delete-modal-title" className="text-base font-semibold text-slate-900 dark:text-slate-50">
                    Confirmation requise
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Cette action est irréversible.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                aria-label="Annuler"
                className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Vous êtes sur le point de supprimer définitivement votre compte
                <strong className="text-slate-900 dark:text-slate-50"> {email}</strong> ainsi que toutes les
                données associées.
              </p>
              <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/40 p-3 text-sm text-amber-900 dark:text-amber-200">
                <p className="font-medium">⚠️ Avant de continuer :</p>
                <p className="mt-1 text-amber-800 dark:text-amber-300">
                  Pensez à exporter vos données importantes depuis chaque fiche véhicule
                  (JSON, ZIP ou PDF). Aucune sauvegarde ne sera conservée après suppression.
                </p>
              </div>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Pour confirmer, saisissez votre adresse e-mail&nbsp;:
                <Input
                  ref={inputRef}
                  type="email"
                  autoComplete="off"
                  spellCheck={false}
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder={email}
                  disabled={isDeleting}
                  className="mt-2"
                />
              </label>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  disabled={isDeleting}
                  className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={!isMatch || isDeleting}
                  className="gap-2 bg-red-600 text-white shadow-[0_4px_12px_-4px_rgba(220,38,38,0.5)] transition hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" aria-hidden />
                      Supprimer définitivement
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
