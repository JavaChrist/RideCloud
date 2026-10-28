import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { inviteHouseholdMember, markHouseholdInviteEmailed } from "@/lib/family/household";
import { sendFamilyInviteEmail } from "@/lib/family/invite-email";
import {
  FAMILY_INVITE_SENDS_PER_HOUR,
  canResendFamilyInvite
} from "@/lib/family/invite-flow";
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
  const rlCreate = rateLimit(`family-invite:${user.id}:${ip}`, 10, 60 * 60 * 1000);
  if (!rlCreate.ok) {
    return NextResponse.json({ error: "Trop d'invitations. Réessayez plus tard." }, { status: 429 });
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  try {
    const invited = await inviteHouseholdMember({
      ownerId: user.id,
      ownerEmail: user.email,
      email
    });
    if (invited.reused && !canResendFamilyInvite(invited.lastEmailSentAt)) {
      return NextResponse.json({
        ok: true,
        emailed: false,
        reused: true,
        error: "Invitation enregistrée, e-mail non envoyé"
      });
    }

    const rlSend = rateLimit(`family-invite-send:${user.id}:${email}`, FAMILY_INVITE_SENDS_PER_HOUR, 60 * 60 * 1000);
    if (!rlSend.ok) {
      return NextResponse.json({
        ok: true,
        emailed: false,
        reused: invited.reused,
        error: "Invitation enregistrée, e-mail non envoyé"
      });
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(request.url).origin;
    const delivery = await sendFamilyInviteEmail({
      to: email,
      ownerLabel: user.email,
      token: invited.token,
      origin
    });
    if (delivery.ok) {
      await markHouseholdInviteEmailed(invited.token);
    } else {
      console.error("[family/invite] email delivery failed", delivery.provider, delivery.error);
    }
    return NextResponse.json({
      ok: true,
      emailed: delivery.ok,
      reused: invited.reused,
      provider: delivery.provider
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invitation impossible." },
      { status: 400 }
    );
  }
}
