import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registerNativePushToken } from "@/lib/push/native-register";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  token: z.string().min(8).max(4096),
  platform: z.enum(["android", "ios"]),
  installationId: z.string().min(1).max(128).nullable().optional(),
  userId: z.string().uuid().optional()
});

/**
 * POST /api/push/native/register
 * Enregistre un token FCM/APNs pour l'utilisateur de session uniquement.
 * `userId` éventuel du body est ignoré comme source d'autorité.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    console.info("[native-push-register] authenticated=false");
    return NextResponse.json({ ok: false, reason: "unauthenticated" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: "invalid_payload" }, { status: 400 });
  }

  console.info("[native-push-register] authenticated=true", {
    platform: parsed.data.platform,
    hasInstallationId: Boolean(parsed.data.installationId),
    tokenLength: parsed.data.token.length
  });

  const result = await registerNativePushToken({
    admin: createAdminClient(),
    sessionUserId: user.id,
    requestedUserId: parsed.data.userId ?? null,
    token: parsed.data.token,
    platform: parsed.data.platform,
    installationId: parsed.data.installationId ?? null
  });

  if (!result.ok) {
    console.info("[native-push-register] upsert=fail", { reason: result.reason });
    return NextResponse.json({ ok: false, reason: result.reason }, { status: result.status });
  }

  console.info("[native-push-register] upsert=success", { platform: parsed.data.platform });
  return NextResponse.json({ ok: true });
}
