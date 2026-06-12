import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  endpoint: z.string().url("Endpoint invalide"),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1)
  }),
  userAgent: z.string().nullable().optional()
});

/**
 * POST /api/push/subscribe
 *
 * Enregistre (ou met à jour) une PushSubscription pour l'utilisateur
 * authentifié. L'endpoint est unique : la même souscription d'un device
 * met à jour la ligne existante (upsert via `onConflict: endpoint`).
 *
 * RLS : la policy `push_subs_insert_own` impose que `user_id = auth.uid()`.
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

  const { endpoint, keys, userAgent } = parsed.data;
  const nowIso = new Date().toISOString();

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: userAgent ?? null,
        last_seen_at: nowIso,
        last_error_at: null,
        last_error_reason: null
      } as never,
      { onConflict: "endpoint" }
    );

  if (error) {
    return NextResponse.json(
      { ok: false, reason: "db_error", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
