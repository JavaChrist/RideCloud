"use client";

import { RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PwaUpdateDialogProps {
  open: boolean;
  applying: boolean;
  onUpdate: () => void;
  onLater: () => void;
}

export function PwaUpdateDialog({ open, applying, onUpdate, onLater }: PwaUpdateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && !applying && onLater()}>
      <DialogContent className="max-w-md overflow-hidden p-0" hideClose>
        <div className="relative bg-gradient-to-b from-blue-50 via-white to-white px-6 pb-6 pt-6 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-700/40 to-transparent"
          />
          <DialogHeader className="!p-0">
            <div className="mb-3 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                <RefreshCw className="h-5 w-5" strokeWidth={2.2} aria-hidden />
              </span>
              <DialogTitle>Nouvelle version disponible</DialogTitle>
            </div>
            <DialogDescription>
              Une nouvelle version de RideCloud est disponible.
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onLater}
            disabled={applying}
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-950"
          >
            Plus tard
          </Button>
          <Button type="button" onClick={onUpdate} disabled={applying}>
            {applying ? "Mise à jour…" : "Mettre à jour"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
