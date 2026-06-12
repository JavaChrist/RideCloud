"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Loader2, ShieldAlert, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { disablePush, enablePush, getPushStatus, type PushStatus } from "@/lib/push/client";

interface PushNotificationsSectionProps {
  vapidPublicKey: string | null;
}

/**
 * Section "Notifications" du panneau Paramètres.
 *
 * Cycle :
 *   1) Au montage, on lit l'état actuel (support navigateur + permission +
 *      souscription existante).
 *   2) Bouton "Activer" → demande la permission + souscrit + envoie au backend.
 *   3) Bouton "Désactiver" → unsubscribe browser + serveur.
 *
 * Cas particuliers :
 *   - Navigateur sans Push (Safari iOS < 16.4 ou desktop trop ancien) :
 *     on affiche un message clair sans bouton.
 *   - iOS Safari hors PWA installée : on invite à installer l'app d'abord.
 *   - Permission `denied` : on explique qu'il faut autoriser dans les
 *     réglages du navigateur.
 */
export function PushNotificationsSection({ vapidPublicKey }: PushNotificationsSectionProps) {
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const next = await getPushStatus();
    setStatus(next);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleEnable = async () => {
    if (!vapidPublicKey) {
      toast.error("Notifications indisponibles : configuration serveur incomplète.");
      return;
    }
    setLoading(true);
    try {
      const result = await enablePush(vapidPublicKey);
      if (result.ok) {
        toast.success("Notifications activées. Tu recevras les rappels d'entretien sur ce téléphone.");
        await refresh();
      } else {
        toast.error(result.reason);
        await refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      const result = await disablePush();
      if (result.ok) {
        toast.success("Notifications désactivées sur ce device.");
        await refresh();
      } else {
        toast.error(result.reason);
      }
    } finally {
      setLoading(false);
    }
  };

  // ----- Rendu -----

  if (!status) {
    return (
      <article className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-ride-sm md:p-8">
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Détection des notifications…
        </div>
      </article>
    );
  }

  const isSubscribed = status.subscribed && status.permission === "granted";

  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-ride-sm md:p-8">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-ride-xs ${
            isSubscribed
              ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
              : "border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
          }`}
        >
          {isSubscribed ? <Bell className="h-5 w-5" aria-hidden /> : <BellOff className="h-5 w-5" aria-hidden />}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Notifications sur le téléphone
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Reçois directement sur ton téléphone les rappels d&apos;entretien (overdue / bientôt
            dû) et l&apos;invitation à recaler ton compteur, même quand l&apos;app n&apos;est pas
            ouverte. Tu peux désactiver à tout moment depuis ici.
          </p>
        </div>
      </div>

      <Separator className="my-5 bg-slate-200/70 dark:bg-slate-800/70" />

      {status.support === "unsupported" && (
        <div className="flex items-start gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3 text-sm text-slate-600 dark:text-slate-300">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>Ce navigateur ne supporte pas les notifications push. Ouvre l&apos;app depuis Chrome, Edge, Firefox ou Safari 16.4+ pour activer cette fonctionnalité.</span>
        </div>
      )}

      {status.support === "needs-install" && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/40 p-3 text-sm text-amber-800 dark:text-amber-300">
          <Smartphone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Sur iPhone, ouvre l&apos;app depuis Safari puis <strong>Partager → Ajouter à l&apos;écran d&apos;accueil</strong>. Une fois installée, rouvre RideCloud depuis l&apos;icône et reviens ici pour activer.
          </span>
        </div>
      )}

      {status.support === "supported" && status.permission === "denied" && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/40 p-3 text-sm text-rose-800 dark:text-rose-300">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Les notifications sont bloquées pour ce site. Ouvre les réglages du navigateur (icône de cadenas → Notifications) pour les autoriser, puis recharge cette page.
          </span>
        </div>
      )}

      {status.support === "supported" && status.permission !== "denied" && (
        <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {isSubscribed
              ? "Ce device est inscrit : les rappels arriveront ici."
              : "Active les notifications pour recevoir les rappels d'entretien hors de l'app."}
          </p>
          {isSubscribed ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleDisable}
              disabled={loading}
              className="gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <BellOff className="h-4 w-4" aria-hidden />}
              Désactiver sur ce device
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleEnable}
              disabled={loading || !vapidPublicKey}
              className="gap-2 bg-blue-700 text-white shadow-[0_4px_14px_-4px_rgba(29,78,216,0.6)] transition hover:bg-blue-800"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Bell className="h-4 w-4" aria-hidden />}
              Activer les notifications
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
