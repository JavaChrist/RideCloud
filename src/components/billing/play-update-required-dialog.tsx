"use client";

import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PLAY_PACKAGE_NAME } from "@/lib/billing/play-products";

interface PlayUpdateRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlayUpdateRequiredDialog({
  open,
  onOpenChange
}: PlayUpdateRequiredDialogProps) {
  const storeUrl = `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE_NAME}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-700" aria-hidden />
            Mise à jour requise
          </DialogTitle>
          <DialogDescription>
            Cette version de l&apos;application ne peut pas facturer via Google Play.
            Mettez à jour RideCloud depuis le Play Store. Le paiement web n&apos;est
            pas proposé ici.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Plus tard
          </Button>
          <Button type="button" onClick={() => { window.location.href = storeUrl; }}>
            Ouvrir Google Play
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
