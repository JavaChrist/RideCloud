import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { leaveHousehold, removeHouseholdMember, revokeHouseholdInvite } from "@/lib/family/household";

export const dynamic = "force-dynamic";

const BodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("remove"), memberUserId: z.string().uuid() }),
  z.object({ action: z.literal("revoke"), inviteId: z.string().uuid() }),
  z.object({ action: z.literal("leave") })
]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    if (parsed.data.action === "remove") {
      await removeHouseholdMember({ ownerId: user.id, memberUserId: parsed.data.memberUserId });
    } else if (parsed.data.action === "revoke") {
      await revokeHouseholdInvite({ ownerId: user.id, inviteId: parsed.data.inviteId });
    } else {
      await leaveHousehold(user.id);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Action impossible." },
      { status: 400 }
    );
  }
}
