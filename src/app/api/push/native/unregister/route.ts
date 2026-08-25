import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { unregisterNativePushToken } from "@/lib/push/native-register";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  installationId: z.string().min(1).max(128)
});

/**
 * POST /api/push/native/unregister
 * Dissocie le token de l'installation courante pour l'utilisateur de session.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
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

  const result = await unregisterNativePushToken({
    admin: createAdminClient(),
    sessionUserId: user.id,
    installationId: parsed.data.installationId
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
