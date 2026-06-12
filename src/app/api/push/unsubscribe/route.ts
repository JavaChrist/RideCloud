import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  endpoint: z.string().url("Endpoint invalide")
});

/**
 * POST /api/push/unsubscribe
 *
 * Supprime la PushSubscription identifiée par son endpoint. RLS impose
 * que `user_id = auth.uid()` : un utilisateur ne peut supprimer que ses
 * propres souscriptions.
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

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", parsed.data.endpoint);

  if (error) {
    return NextResponse.json(
      { ok: false, reason: "db_error", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
