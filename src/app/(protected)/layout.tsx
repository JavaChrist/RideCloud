import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanState } from "@/lib/billing/limits";
import { getFounderRecord, effectiveStatus } from "@/lib/billing/founder-program";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [planState, founderRecord] = await Promise.all([
    getUserPlanState(user.id),
    getFounderRecord(supabase)
  ]);

  // Si fondateur "expired" sans questionnaire rempli → redirection forcée
  // vers le questionnaire (qui affichera l'écran "trop tard" en lecture seule).
  // Si fondateur "pending" avec deadline dépassée côté client → idem.
  if (founderRecord) {
    const status = effectiveStatus(founderRecord);
    const isExpiredWithoutQuestionnaire =
      status === "expired" && founderRecord.questionnaireCompletedAt === null;

    if (isExpiredWithoutQuestionnaire) {
      const headersList = await headers();
      const pathname = headersList.get("x-pathname") ?? "";
      if (
        !pathname.startsWith("/fondateur") &&
        !pathname.startsWith("/parametres") &&
        !pathname.startsWith("/api")
      ) {
        redirect("/fondateur/questionnaire");
      }
    }
  }

  return (
    <ProtectedShell planState={planState} founderRecord={founderRecord}>
      {children}
    </ProtectedShell>
  );
}
