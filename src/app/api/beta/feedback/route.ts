import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const feedbackSchema = z.object({
  overall_rating: z.number().int().min(1).max(5),
  ease_of_use: z.number().int().min(1).max(5),
  most_useful_feature: z.string().min(1).max(500),
  improvements: z.string().min(1).max(1000),
  would_recommend: z.boolean(),
  would_pay: z.enum(["yes_current", "yes_cheaper", "no"]),
  additional_comments: z.string().max(2000).nullable().optional()
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.issues }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error: insertError } = await admin.from("beta_feedback").insert({
    user_id: user.id,
    ...parsed.data,
    additional_comments: parsed.data.additional_comments ?? null
  } as never);

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "Vous avez déjà soumis votre retour." }, { status: 409 });
    }
    console.error("[beta/feedback] insert error", insertError);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement." }, { status: 500 });
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({ beta_feedback_submitted: true, updated_at: new Date().toISOString() } as never)
    .eq("id", user.id);

  if (updateError) {
    console.error("[beta/feedback] profile update error", updateError);
  }

  return NextResponse.json({ ok: true });
}
