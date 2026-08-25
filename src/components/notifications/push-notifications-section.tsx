"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Loader2, ShieldAlert, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { isCapacitorAndroid } from "@/lib/pwa/environment";
import { disablePush, enablePush, getPushStatus, type PushStatus } from "@/lib/push/client";
import {
  disableNativePush,
  enableNativePush,
  getNativePushStatus,
  type NativePushStatus
} from "@/lib/push/native-client";
import {
  NATIVE_PUSH_DETECTION_TIMEOUT_MS,
  resolveNotificationsDetectionView,
  withTimeout
} from "@/lib/push/native-status";

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
  const [isAndroidNative, setIsAndroidNative] = useState(false);
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [nativeStatus, setNativeStatus] = useState<NativePushStatus | null>(null);
  const [detectionPhase, setDetectionPhase] = useState<"loading" | "ready" | "error">("loading");
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setDetectionPhase("loading");
    setDetectionError(null);
    try {
      const android = isCapacitorAndroid();
      setIsAndroidNative(android);
      if (android) {
        setNativeStatus(await getNativePushStatus());
      } else {
        setStatus(await withTimeout(getPushStatus(), NATIVE_PUSH_DETECTION_TIMEOUT_MS, "web_status_timeout"));
      }
      setDetectionPhase("ready");
    } catch (error) {
      console.error("[push-ui] detection failed", error);
      setDetectionError("Impossible de vérifier les notifications");
      setDetectionPhase("error");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleEnable = async () => {
    setLoading(true);
    try {
      if (isCapacitorAndroid()) {
        const result = await enableNativePush();
        if (result.ok) {
          toast.success("Notifications activées. Tu recevras les rappels d'entretien sur ce téléphone.");
        } else {
          toast.error(result.reason);
        }
        await refresh();
        return;
      }
      if (!vapidPublicKey) {
        toast.error("Notifications indisponibles : configuration serveur incomplète.");
        return;
      }
      const result = await enablePush(vapidPublicKey);
      if (result.ok) {
        toast.success("Notifications activées. Tu recevras les rappels d'entretien sur ce téléphone.");
      } else {
        toast.error(result.reason);
      }
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      const result = isCapacitorAndroid() ? await disableNativePush() : await disablePush();
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

  const detectionView = resolveNotificationsDetectionView({
    phase: detectionPhase,
    isAndroidNative,
    nativeStatus,
    webStatus: status,
    error: detectionError
  });

  if (detectionView.kind === "loading") {
    return (
      <article className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-ride-sm md:p-8">
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Détection en cours…
        </div>
      </article>
    );
  }

  if (detectionView.kind === "error") {
    return (
      <article className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-ride-sm md:p-8">
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/40 p-3 text-sm text-amber-800 dark:text-amber-300">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div className="flex-1">
            <p>{detectionView.message}</p>
            <Button type="button" variant="outline" onClick={() => void refresh()} className="mt-3 gap-2">
              Réessayer
            </Button>
          </div>
        </div>
      </article>
    );
  }

  const isNativeLinked = detectionView.kind === "native" && detectionView.label === "activated";
  const isWebSubscribed = Boolean(status?.subscribed && status.permission === "granted");
  const isSubscribed = detectionView.kind === "native" ? isNativeLinked : isWebSubscribed;

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
            {isAndroidNative
              ? "RideCloud t'envoie les rappels d'entretien même si l'app est fermée. Android demandera l'autorisation uniquement après ce bouton."
              : "Reçois directement sur ton téléphone les rappels d'entretien (overdue / bientôt dû) et l'invitation à recaler ton compteur, même quand l'app n'est pas ouverte. Tu peux désactiver à tout moment depuis ici."}
          </p>
        </div>
      </div>

      <Separator className="my-5 bg-slate-200/70 dark:bg-slate-800/70" />

      {detectionView.kind === "native" && detectionView.label === "denied" && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/40 p-3 text-sm text-rose-800 dark:text-rose-300">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Notifications non autorisées. Ouvre <strong>Paramètres Android → Applications → RideCloud → Notifications</strong> pour les autoriser, puis reviens ici.
          </span>
        </div>
      )}

      {detectionView.kind === "native" && detectionView.label === "check_failed" && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/40 p-3 text-sm text-amber-800 dark:text-amber-300">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div className="flex-1">
            <p>Impossible de vérifier les notifications. Tes alertes ne sont pas désactivées.</p>
            <Button type="button" variant="outline" onClick={() => void refresh()} className="mt-3 gap-2">
              Réessayer
            </Button>
          </div>
        </div>
      )}

      {detectionView.kind === "native" && detectionView.label !== "denied" && detectionView.label !== "check_failed" && (
        <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {isNativeLinked
              ? "Notifications Android détectées. Ce téléphone recevra les rappels d'entretien."
              : "Active les notifications pour recevoir les rappels d'entretien hors de l'app."}
          </p>
          {isNativeLinked ? (
            <Button type="button" variant="outline" onClick={handleDisable} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <BellOff className="h-4 w-4" aria-hidden />}
              Désactiver sur ce device
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleEnable}
              disabled={loading}
              className="gap-2 bg-blue-700 text-white shadow-[0_4px_14px_-4px_rgba(29,78,216,0.6)] transition hover:bg-blue-800"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Bell className="h-4 w-4" aria-hidden />}
              Activer les notifications
            </Button>
          )}
        </div>
      )}

      {detectionView.kind === "web" && status?.support === "unsupported" && (
        <div className="flex items-start gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3 text-sm text-slate-600 dark:text-slate-300">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>Ce navigateur ne supporte pas les notifications push. Ouvre l&apos;app depuis Chrome, Edge, Firefox ou Safari 16.4+ pour activer cette fonctionnalité.</span>
        </div>
      )}

      {detectionView.kind === "web" && status?.support === "needs-install" && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/40 p-3 text-sm text-amber-800 dark:text-amber-300">
          <Smartphone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Sur iPhone, ouvre l&apos;app depuis Safari puis <strong>Partager → Ajouter à l&apos;écran d&apos;accueil</strong>. Une fois installée, rouvre RideCloud depuis l&apos;icône et reviens ici pour activer.
          </span>
        </div>
      )}

      {detectionView.kind === "web" && status?.support === "supported" && status.permission === "denied" && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/40 p-3 text-sm text-rose-800 dark:text-rose-300">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Les notifications sont bloquées pour ce site. Ouvre les réglages du navigateur (icône de cadenas → Notifications) pour les autoriser, puis recharge cette page.
          </span>
        </div>
      )}

      {detectionView.kind === "web" && status?.support === "supported" && status.permission !== "denied" && (
        <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {isWebSubscribed
              ? "Ce device est inscrit : les rappels arriveront ici."
              : "Active les notifications pour recevoir les rappels d'entretien hors de l'app."}
          </p>
          {isWebSubscribed ? (
            <Button type="button" variant="outline" onClick={handleDisable} disabled={loading} className="gap-2">
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
