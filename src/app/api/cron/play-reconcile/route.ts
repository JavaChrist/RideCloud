import { NextResponse } from "next/server";
import {
  applyVerifiedPlayPurchase,
  retryPendingPlayAcknowledgements
} from "@/lib/billing/apply-play-purchase";
import { hasPlayBillingEnv } from "@/lib/billing/play-publisher";
import { reconcileStoredPlayRtdnEvents } from "@/lib/billing/play-rtdn-reconcile";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function isAuthorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const auth = request.headers.get("authorization");
  if (auth && auth === `Bearer ${expected}`) return true;
  const url = new URL(request.url);
  return url.searchParams.get("token") === expected;
}

async function handle(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPlayBillingEnv()) {
    return NextResponse.json({ ok: true, skipped: "no play credentials" });
  }

  const acked = await retryPendingPlayAcknowledgements(25);
  const { reconciled, failed } = await reconcileStoredPlayRtdnEvents({
    applyPurchase: (purchaseToken) =>
      applyVerifiedPlayPurchase({
        purchaseToken,
        requireObfuscatedAccount: false
      })
  });

  return NextResponse.json({ ok: true, acked, reconciled, failed });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
