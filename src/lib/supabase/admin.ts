import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { supabaseServiceRoleKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Crée un client Supabase administrateur (service role).
 *
 * À utiliser UNIQUEMENT côté serveur (route handlers, server actions, scripts CLI),
 * jamais côté client. Cette clé bypass les politiques RLS et a accès à
 * l'ensemble de l'API d'administration.
 *
 * Lance une erreur explicite si SUPABASE_SERVICE_ROLE_KEY n'est pas configurée.
 */
export function createAdminClient(): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY manquante. Ajoutez-la dans .env.local pour activer les opérations administratives."
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
