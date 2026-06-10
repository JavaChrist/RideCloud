import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanState } from "@/lib/billing/limits";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const planState = await getUserPlanState(user.id);

  if (planState.isBetaBlocked) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") ?? "";
    if (!pathname.startsWith("/beta-feedback")) {
      redirect("/beta-feedback");
    }
  }

  return <ProtectedShell planState={planState}>{children}</ProtectedShell>;
}
