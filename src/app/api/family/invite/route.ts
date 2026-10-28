import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { inviteHouseholdMember } from "@/lib/family/household";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const rl = rateLimit(`family-invite:${user.id}:${ip}`, 10, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Trop d'invitations. Réessayez plus tard." }, { status: 429 });
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }

  try {
    const { token } = await inviteHouseholdMember({
      ownerId: user.id,
      ownerEmail: user.email,
      email: parsed.data.email
    });
    return NextResponse.json({ ok: true, token });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invitation impossible." },
      { status: 400 }
    );
  }
}
