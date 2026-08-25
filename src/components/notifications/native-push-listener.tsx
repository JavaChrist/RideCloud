"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isCapacitorAndroid } from "@/lib/pwa/environment";
import { syncNativePushIfGranted } from "@/lib/push/native-client";

/**
 * Monte uniquement en session protégée. Ne demande jamais la permission :
 * rafraîchit le token si déjà accordée, et navigue au clic notification.
 */
export function NativePushListener() {
  const router = useRouter();

  useEffect(() => {
    if (!isCapacitorAndroid()) return;
    void syncNativePushIfGranted({
      onActionUrl: (href) => {
        router.push(href);
      }
    });
  }, [router]);

  return null;
}