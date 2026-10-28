import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  applyVerifiedPlayPurchase,
  retryPendingPlayAcknowledgements
} from "@/lib/billing/apply-play-purchase";
import { hasPlayBillingEnv } from "@/lib/billing/play-publisher";

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
  const admin = createAdminClient();
  const { data } = await admin
    .from("play_rtdn_events")
    .select("message_id, purchase_token")
    .in("process_status", ["pending", "failed", "orphan"])
    .not("purchase_token", "is", null)
    .limit(25);
  const rows = (data ?? []) as Array<{ message_id: string; purchase_token: string }>;
  let reconciled = 0;
  for (const row of rows) {
    try {
      const result = await applyVerifiedPlayPurchase({
        purchaseToken: row.purchase_token,
        requireObfuscatedAccount: false
      });
      await admin
        .from("play_rtdn_events")
        .update({
          process_status: result.boundUserId ? "applied" : "orphan",
          processed_at: new Date().toISOString(),
          process_error: null,
          updated_at: new Date().toISOString()
        } as never)
        .eq("message_id", row.message_id);
      reconciled += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "reconcile failed";
      await admin
        .from("play_rtdn_events")
        .update({
          process_status: "failed",
          process_error: message.slice(0, 400),
          updated_at: new Date().toISOString()
        } as never)
        .eq("message_id", row.message_id);
    }
  }

  return NextResponse.json({ ok: true, acked, reconciled });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
