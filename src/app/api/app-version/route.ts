import { NextResponse } from "next/server";
import { resolveAppVersion } from "@/lib/pwa/app-version";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Version actuellement déployée. Publique, sans secret.
 * Cache désactivé pour que la PWA compare toujours avec le déploiement vivant.
 */
export function GET() {
  return NextResponse.json(
    { version: resolveAppVersion() },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate"
      }
    }
  );
}
