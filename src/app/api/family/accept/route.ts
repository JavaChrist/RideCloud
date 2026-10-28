import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { acceptHouseholdInvite } from "@/lib/family/household";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  token: z.string().uuid()
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Jeton d'invitation invalide." }, { status: 400 });
  }

  try {
    await acceptHouseholdInvite({
      userId: user.id,
      email: user.email,
      token: parsed.data.token
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Acceptation impossible." },
      { status: 400 }
    );
  }
}
