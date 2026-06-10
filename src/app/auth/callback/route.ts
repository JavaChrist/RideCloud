import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile } from "@/lib/billing/ensure-profile";

const BETA_DURATION_DAYS = 30;

async function activateBeta(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  code: string
): Promise<void> {
  // Vérifie que le code existe et n'est pas encore utilisé
  const { data: rawInvite, error: fetchError } = await admin
    .from("invite_codes")
    .select("id, used_by")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  const invite = rawInvite as unknown as { id: string; used_by: string | null } | null;
  if (fetchError || !invite || invite.used_by) return;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + BETA_DURATION_DAYS);

  // Marque le code comme utilisé et active le bêta sur le profil en parallèle
  await Promise.all([
    admin
      .from("invite_codes")
      .update({ used_by: userId, used_at: new Date().toISOString() } as never)
      .eq("id", invite.id),
    admin
      .from("profiles")
      .update({
        beta_expires_at: expiresAt.toISOString(),
        beta_feedback_submitted: false,
        updated_at: new Date().toISOString()
      } as never)
      .eq("id", userId)
  ]);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/categories";
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const inviteCode = searchParams.get("invite");

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

      // Activation bêta si un code d'invitation valide est présent dans l'URL
      if (inviteCode) {
        await activateBeta(admin, sessionUser.id, inviteCode);
      }
    } catch (ensureErr) {
      console.error("[auth/callback] ensureProfile failed", ensureErr);
    }
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
