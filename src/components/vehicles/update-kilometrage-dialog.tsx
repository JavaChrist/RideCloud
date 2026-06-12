"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Gauge, Loader2, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/providers/confirm-provider";

interface UpdateKilometrageDialogProps {
  vehicleId: string;
  currentKm: number;
  isDemoVehicle?: boolean;
}

const QUICK_INCREMENTS = [100, 500, 1000, 5000];

export function UpdateKilometrageDialog({
  vehicleId,
  currentKm,
  isDemoVehicle = false
}: UpdateKilometrageDialogProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<string>(String(currentKm));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const openDialog = () => {
    if (isDemoVehicle) {
      toast.info("Modification désactivée sur le véhicule de démonstration.");
      return;
    }
    setValue(String(currentKm));
    setIsOpen(true);
  };

  const handleIncrement = (delta: number) => {
    const current = Number.isFinite(Number(value)) ? Number(value) : currentKm;
    const next = Math.max(0, Math.round(current + delta));
    setValue(String(next));
    inputRef.current?.focus();
  };

  const handleSave = async () => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      toast.error("Kilométrage invalide.");
      return;
    }
    if (parsed === currentKm) {
      setIsOpen(false);
      return;
    }
    if (parsed < currentKm) {
      const confirmed = await confirm({
        title: "Kilométrage inférieur au compteur actuel",
        description: `Vous saisissez ${parsed.toLocaleString(
          "fr-FR"
        )} km, ce qui est inférieur au compteur actuel (${currentKm.toLocaleString(
          "fr-FR"
        )} km).\n\nC'est inhabituel mais possible (compteur remplacé, erreur de saisie corrigée…). Voulez-vous confirmer cette valeur ?`,
        confirmText: "Confirmer quand même",
        cancelText: "Annuler",
        variant: "warning"
      });
      if (!confirmed) return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      // Recalage du point de référence : à chaque saisie réelle du
      // compteur, on remet à zéro l'estimation (last_odometer_value + date)
      // pour que les projections km→date repartent d'une base juste.
      const todayIso = new Date().toISOString().slice(0, 10);
      const { error } = await supabase
        .from("vehicles")
        .update({
          kilometrage: parsed,
          last_odometer_value: parsed,
          last_odometer_date: todayIso,
          updated_at: new Date().toISOString()
        } as never)
        .eq("id", vehicleId);

      if (error) {
        toast.error(`Mise à jour impossible : ${error.message}`);
        return;
      }

      toast.success(
        `Compteur mis à jour : ${parsed.toLocaleString("fr-FR")} km${
          parsed > currentKm ? ` (+${(parsed - currentKm).toLocaleString("fr-FR")} km)` : ""
        }`
      );
      setIsOpen(false);
      router.refresh();
    } catch {
      toast.error("Erreur réseau. Réessayez dans un instant.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        disabled={isDemoVehicle}
        aria-label="Mettre à jour le kilométrage"
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors duration-150 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Pencil className="h-3 w-3" aria-hidden strokeWidth={2.25} />
        Mettre à jour le KM
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="km-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => !isSaving && setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            disabled={isSaving}
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-blue-50 dark:from-blue-950/40 to-white dark:to-slate-900 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-ride-xs">
                  <Gauge className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 id="km-dialog-title" className="text-base font-semibold text-slate-900 dark:text-slate-50">
                    Mettre à jour le compteur
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Actuel : <span className="font-mono tabular-nums">
                      {currentKm.toLocaleString("fr-FR")} km
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
                aria-label="Annuler"
                className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label
                  htmlFor="km-input"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Nouveau kilométrage
                </label>
                <div className="relative">
                  <Input
                    id="km-input"
                    ref={inputRef}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSave();
                      }
                    }}
                    disabled={isSaving}
                    className="pr-12 font-mono text-lg tabular-nums"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-slate-400 dark:text-slate-500">
                    km
                  </span>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Ajouter rapidement
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {QUICK_INCREMENTS.map((increment) => (
                    <button
                      key={increment}
                      type="button"
                      onClick={() => handleIncrement(increment)}
                      disabled={isSaving}
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 transition hover:-translate-y-0.5 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-ride-xs disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                      {increment >= 1000
                        ? `${(increment / 1000).toString().replace(".", ",")} k`
                        : increment}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  disabled={isSaving}
                  className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="gap-2 bg-blue-700 text-white shadow-[0_4px_14px_-4px_rgba(29,78,216,0.6)] transition hover:bg-blue-800"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Enregistrement…
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
