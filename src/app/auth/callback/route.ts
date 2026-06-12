import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile } from "@/lib/billing/ensure-profile";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/categories";
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const safeNext = rawNext.startsWith("/") ? rawNext : "/categories";

  if (errorParam) {
    const message = errorDescription ?? errorParam;
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(message)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Lien invalide ou expiré")}`
    );
  }

  const supabase = await createClient();
  const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // Filet de sécurité : garantit l'existence d'une row `profiles` pour
  // chaque utilisateur authentifié. Si le trigger handle_new_user a échoué
  // ou n'avait pas été déployé, c'est ici qu'on rattrape automatiquement.
  // Non bloquant : un échec ici n'empêche pas la connexion.
  const sessionUser = sessionData?.user;
  if (sessionUser?.id) {
    try {
      const admin = createAdminClient();
      await ensureProfile(admin, sessionUser.id, sessionUser.email);
    } catch (ensureErr) {
      console.error("[auth/callback] ensureProfile failed", ensureErr);
    }
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
