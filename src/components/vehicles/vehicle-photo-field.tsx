"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { ImagePlus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { validateVehiclePhotoFile } from "@/lib/vehicles/vehicle-photo";
import { cn } from "@/lib/utils";

interface VehiclePhotoFieldProps {
  file: File | null;
  existingSrc?: string | null;
  alt?: string;
  busy?: boolean;
  allowClear?: boolean;
  addLabel?: string;
  changeLabel?: string;
  layout?: "form" | "cover";
  placeholder?: ReactNode;
  onFileChange: (file: File | null) => void;
}

export function VehiclePhotoField({
  file,
  existingSrc = null,
  alt = "Photo du véhicule",
  busy = false,
  allowClear = true,
  addLabel = "Ajouter une photo",
  changeLabel = "Changer la photo",
  layout = "form",
  placeholder,
  onFileChange
}: VehiclePhotoFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const previewSrc = objectUrl ?? existingSrc ?? null;

  const openPicker = () => {
    if (busy) return;
    inputRef.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!next) return;
    const error = validateVehiclePhotoFile(next);
    if (error) {
      toast.error(error);
      return;
    }
    onFileChange(next);
  };

  const pickerInput = (
    <input
      id={inputId}
      ref={inputRef}
      type="file"
      accept="image/*"
      className="sr-only"
      disabled={busy}
      onChange={handleChange}
    />
  );

  if (layout === "cover") {
    return (
      <div className="relative h-full min-h-48 w-full">
        {pickerInput}
        <button
          type="button"
          onClick={openPicker}
          disabled={busy}
          aria-label={previewSrc ? changeLabel : addLabel}
          className="group relative flex h-full min-h-48 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-white text-left transition hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-80 dark:from-slate-950 dark:to-slate-900 dark:hover:bg-blue-950/20"
        >
          {previewSrc ? (
            // Aperçu local (blob) ou URL signée — next/image ne gère pas blob:.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewSrc} alt={alt} className="h-full w-full object-contain p-3" />
          ) : (
            placeholder ?? (
              <span className="flex flex-col items-center gap-2 px-4 text-center text-sm text-slate-500 dark:text-slate-400">
                <ImagePlus className="h-8 w-8 text-blue-700 dark:text-blue-300" strokeWidth={1.75} />
                <span className="font-medium text-slate-700 dark:text-slate-200">{addLabel}</span>
              </span>
            )
          )}
          <span
            className={cn(
              "absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-slate-950/55 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm",
              !previewSrc && "bg-slate-950/40"
            )}
          >
            <ImagePlus className="h-3.5 w-3.5" />
            {previewSrc ? changeLabel : addLabel}
          </span>
          {busy ? (
            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/45 text-sm font-medium text-white">
              Envoi en cours…
            </span>
          ) : null}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pickerInput}
      <button
        type="button"
        onClick={openPicker}
        disabled={busy}
        aria-label={previewSrc ? changeLabel : addLabel}
        className="group relative flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-left transition hover:border-blue-400 hover:bg-blue-50/60 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
      >
        {previewSrc ? (
          // Aperçu local (blob) ou URL signée — next/image ne gère pas blob:.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc} alt={alt} className="h-full w-full object-contain p-3" />
        ) : (
          placeholder ?? (
            <span className="flex flex-col items-center gap-2 px-4 text-center text-sm text-slate-500 dark:text-slate-400">
              <ImagePlus className="h-8 w-8 text-blue-700 dark:text-blue-300" strokeWidth={1.75} />
              <span className="font-medium text-slate-700 dark:text-slate-200">Photo du véhicule</span>
              <span>Facultatif · galerie ou fichiers</span>
            </span>
          )
        )}
        {busy ? (
          <span className="absolute inset-0 flex items-center justify-center bg-slate-950/40 text-sm font-medium text-white">
            Envoi en cours…
          </span>
        ) : null}
      </button>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={openPicker} disabled={busy}>
          <ImagePlus className="h-4 w-4" />
          {previewSrc ? changeLabel : addLabel}
        </Button>
        {allowClear && file ? (
          <Button type="button" variant="outline" disabled={busy} onClick={() => onFileChange(null)}>
            <Trash2 className="h-4 w-4" />
            Supprimer la sélection
          </Button>
        ) : null}
        {previewSrc && !allowClear ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Pencil className="h-3.5 w-3.5" />
            Cliquez sur la zone ou le bouton pour remplacer
          </span>
        ) : null}
      </div>
    </div>
  );
}
