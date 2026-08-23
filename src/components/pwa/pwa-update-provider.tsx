"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PwaUpdateDialog } from "@/components/pwa/pwa-update-dialog";
import { isCapacitorNative, shouldRegisterServiceWorkerOnBoot, shouldRunPwaUpdateClient } from "@/lib/pwa/environment";
import { registerRideCloudServiceWorker } from "@/lib/pwa/service-worker";
import { applyWaitingOrReload, checkForAppUpdate, createReloadGuard, PWA_UPDATE_INTERVAL_MS } from "@/lib/pwa/update-check";

export function PwaUpdateProvider() {
  const [open, setOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const dismissedVersionRef = useRef<string | null>(null);
  const deployedVersionRef = useRef<string | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const allowReloadRef = useRef(false);
  const reloadOnceRef = useRef(createReloadGuard(() => window.location.reload()));

  const runCheck = useCallback(async () => {
    if (!shouldRunPwaUpdateClient({ isNative: isCapacitorNative(), nodeEnv: process.env.NODE_ENV })) {
      return;
    }

    const result = await checkForAppUpdate({
      isNative: false,
      dismissedVersion: dismissedVersionRef.current
    });
    deployedVersionRef.current = result.deployedVersion;
    if (result.shouldPrompt) {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    const isNative = isCapacitorNative();
    const nodeEnv = process.env.NODE_ENV;

    if (isNative || !shouldRunPwaUpdateClient({ isNative, nodeEnv })) {
      return;
    }

    let cancelled = false;
    const reloadOnce = reloadOnceRef.current;

    const onControllerChange = () => {
      if (allowReloadRef.current) {
        reloadOnce();
      }
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    }

    const boot = async () => {
      if (shouldRegisterServiceWorkerOnBoot({ isNative, nodeEnv })) {
        try {
          registrationRef.current = await registerRideCloudServiceWorker();
        } catch {
          registrationRef.current = null;
        }
      }
      if (!cancelled) {
        await runCheck();
      }
    };

    void boot();

    const timer = window.setInterval(() => {
      void runCheck();
    }, PWA_UPDATE_INTERVAL_MS);

    const onFocus = () => {
      dismissedVersionRef.current = null;
      void runCheck();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        dismissedVersionRef.current = null;
        void runCheck();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      }
    };
  }, [runCheck]);

  const handleLater = () => {
    dismissedVersionRef.current = deployedVersionRef.current ?? "waiting";
    setOpen(false);
  };

  const handleUpdate = async () => {
    if (applying) return;
    setApplying(true);
    allowReloadRef.current = true;

    const registration =
      registrationRef.current ??
      ("serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration("/sw.js") : null);
    const action = applyWaitingOrReload({
      waiting: registration?.waiting,
      reloadOnce: reloadOnceRef.current
    });
    if (action === "skip-waiting") {
      window.setTimeout(() => {
        reloadOnceRef.current();
      }, 1500);
    }
  };

  return (
    <PwaUpdateDialog open={open} applying={applying} onUpdate={() => void handleUpdate()} onLater={handleLater} />
  );
}
