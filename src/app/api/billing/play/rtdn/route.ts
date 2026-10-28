import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyVerifiedPlayPurchase } from "@/lib/billing/apply-play-purchase";
import { getPlayPackageName, isExpectedPlayPackage } from "@/lib/billing/play-products";
import { hasPlayBillingEnv } from "@/lib/billing/play-publisher";
import {
  verifyGoogleIdTokenSignature,
  verifyPubSubOidcToken
} from "@/lib/billing/play-oidc";

export const dynamic = "force-dynamic";

interface PlayRtdnMessage {
  version?: string;
  packageName?: string;
  subscriptionNotification?: {
    notificationType?: number;
    purchaseToken?: string;
    subscriptionId?: string;
  };
}

function isPlausiblePurchaseToken(token: string): boolean {
  return token.length >= 16 && token.length <= 512 && !/\s/.test(token);
}

/**
 * POST /api/billing/play/rtdn
 * Push Pub/Sub authentifié (OIDC). L'état métier est relu chez Google.
 */
export async function POST(request: Request) {
  const oidc = await verifyPubSubOidcToken(
    request.headers.get("authorization"),
    verifyGoogleIdTokenSignature
  );
  if (!oidc.ok) {
    return NextResponse.json({ error: oidc.error }, { status: oidc.status });
  }

  if (!hasPlayBillingEnv()) {
    return NextResponse.json({ error: "play_unconfigured" }, { status: 503 });
  }

  let envelope: { message?: { data?: string; messageId?: string } };
  try {
    envelope = (await request.json()) as { message?: { data?: string; messageId?: string } };
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const messageId = envelope.message?.messageId;
  const encoded = envelope.message?.data;
  if (!messageId || !encoded) {
    return NextResponse.json({ error: "missing message" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("play_rtdn_events")
    .select("message_id, process_status")
    .eq("message_id", messageId)
    .maybeSingle();
  const existingRow = existing as { message_id: string; process_status: string } | null;
  if (existingRow?.process_status === "applied" || existingRow?.process_status === "skipped") {
    return NextResponse.json({ ok: true, deduped: true });
  }

  let payload: PlayRtdnMessage;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64").toString("utf8")) as PlayRtdnMessage;
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  if (!isExpectedPlayPackage(payload.packageName ?? null)) {
    return NextResponse.json({ error: "package mismatch" }, { status: 400 });
  }

  const purchaseToken = payload.subscriptionNotification?.purchaseToken ?? null;
  await admin.from("play_rtdn_events").upsert(
    {
      message_id: messageId,
      package_name: payload.packageName ?? getPlayPackageName(),
      notification_type: payload.subscriptionNotification?.notificationType ?? null,
      purchase_token: purchaseToken,
      payload: payload as never,
      process_status: purchaseToken ? "pending" : "skipped",
      updated_at: new Date().toISOString()
    } as never,
    { onConflict: "message_id" }
  );

  if (!purchaseToken) {
    return NextResponse.json({ ok: true, skipped: "no subscription token" });
  }
  if (!isPlausiblePurchaseToken(purchaseToken)) {
    await admin
      .from("play_rtdn_events")
      .update({ process_status: "failed", process_error: "invalid token format" } as never)
      .eq("message_id", messageId);
    return NextResponse.json({ error: "invalid token" }, { status: 400 });
  }

  try {
    const result = await applyVerifiedPlayPurchase({
      purchaseToken,
      claimedProductId: payload.subscriptionNotification?.subscriptionId,
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
      .eq("message_id", messageId);
    return NextResponse.json({
      ok: true,
      bound: Boolean(result.boundUserId),
      applied: result.applied
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "apply failed";
    await admin
      .from("play_rtdn_events")
      .update({
        process_status: "failed",
        process_error: message.slice(0, 400),
        updated_at: new Date().toISOString()
      } as never)
      .eq("message_id", messageId);
    return NextResponse.json({ ok: false, error: "retry" }, { status: 500 });
  }
}
