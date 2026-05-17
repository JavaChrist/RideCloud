import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Garantit qu'une ligne `profiles` existe pour l'utilisateur donné.
 *
 * À utiliser au début de toute opération qui va patcher la table profiles
 * (checkout, webhook, sync, callback auth, ...) afin de couvrir les cas où :
 *   - le trigger `handle_new_user` n'a pas été déployé au moment de l'inscription
 *   - le trigger a planté silencieusement (cas rares)
 *   - le compte a été créé en dehors de Supabase Auth puis lié plus tard
 *
 * L'opération est idempotente : si la ligne existe déjà, on ne fait que
 * rafraîchir `updated_at`.
 *
 * IMPORTANT : à utiliser uniquement côté serveur avec un client admin
 * (service role), jamais avec une session utilisateur (RLS interdit
 * l'insertion d'une row dont auth.uid() ≠ id).
 */
export async function ensureProfile(
  admin: SupabaseClient<Database>,
  userId: string,
  email: string | null | undefined
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!email) {
    return {
      ok: false,
      error:
        "Aucun email associé à votre compte. Impossible de créer le profil."
    };
  }

  const { error } = await admin
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        updated_at: new Date().toISOString()
      } as never,
      { onConflict: "id" }
    );

  if (error) {
    console.error("[ensureProfile] upsert failed", { userId, error });
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
