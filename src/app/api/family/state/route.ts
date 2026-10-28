import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanState } from "@/lib/billing/limits";
import {
  ensureHouseholdForOwner,
  getHouseholdState
} from "@/lib/family/household";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const planState = await getUserPlanState(user.id);
  if (planState.plan === "family" && planState.planStatus === "active") {
    await ensureHouseholdForOwner(user.id);
  }

  const household = await getHouseholdState({ userId: user.id, email: user.email });
  return NextResponse.json({ household, plan: planState });
}
