import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyVerifiedPlayPurchase } from "@/lib/billing/apply-play-purchase";
import { getPlayPackageName } from "@/lib/billing/play-products";
import { hasPlayBillingEnv } from "@/lib/billing/play-publisher";

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

/**
 * POST /api/billing/play/rtdn
 *
 * Real-time developer notifications (Pub/Sub). La source de vérité reste
 * l'API Android Publisher : on relit le jeton puis on applique le plan.
 */
export async function POST(request: Request) {
  if (!hasPlayBillingEnv()) {
    return NextResponse.json({ ok: true, skipped: "no play credentials" });
  }

  let envelope: { message?: { data?: string } };
  try {
    envelope = (await request.json()) as { message?: { data?: string } };
  } catch {
    return NextResponse.json({ ok: true, skipped: "invalid json" });
  }

  const encoded = envelope.message?.data;
  if (!encoded) {
    return NextResponse.json({ ok: true, skipped: "no data" });
  }

  let payload: PlayRtdnMessage;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64").toString("utf8")) as PlayRtdnMessage;
  } catch {
    return NextResponse.json({ ok: true, skipped: "invalid payload" });
  }

  if (payload.packageName && payload.packageName !== getPlayPackageName()) {
    return NextResponse.json({ ok: true, skipped: "package mismatch" });
  }

  const purchaseToken = payload.subscriptionNotification?.purchaseToken;
  if (!purchaseToken) {
    return NextResponse.json({ ok: true, skipped: "no subscription token" });
  }

  const admin = createAdminClient();
  const { data: profileData } = await admin
    .from("profiles")
    .select("id")
    .eq("play_purchase_token", purchaseToken)
    .maybeSingle();
  const profile = profileData as { id: string } | null;
  if (!profile) {
    console.warn("[billing/play/rtdn] unknown purchase token");
    return NextResponse.json({ ok: true, skipped: "unknown token" });
  }

  try {
    await applyVerifiedPlayPurchase({
      userId: profile.id,
      purchaseToken,
      claimedProductId: payload.subscriptionNotification?.subscriptionId
    });
  } catch (error) {
    console.error("[billing/play/rtdn] apply failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
