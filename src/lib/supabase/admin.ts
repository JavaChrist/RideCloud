import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { supabaseServiceRoleKey, supabaseUrl } from "@/lib/supabase/env";

function buildAdminClient(url: string, serviceRoleKey: string): SupabaseClient<Database> {
  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Crée un client Supabase administrateur (service role).
 *
 * À utiliser UNIQUEMENT côté serveur (route handlers, server actions, scripts CLI),
 * jamais côté client. Cette clé bypass les politiques RLS et a accès à
 * l'ensemble de l'API d'administration.
 *
 * Lance une erreur explicite si SUPABASE_SERVICE_ROLE_KEY n'est pas configurée.
 * Réservé aux opérations d'écriture/admin déclenchées explicitement.
 */
export function createAdminClient(): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY manquante. Ajoutez-la dans .env.local pour activer les opérations administratives."
    );
  }

  return buildAdminClient(supabaseUrl, supabaseServiceRoleKey);
}

/**
 * Variante non-levée du client administrateur.
 *
 * Retourne `null` (au lieu de lancer une erreur) quand l'URL Supabase ou la
 * clé service role est absente. À utiliser sur les chemins de LECTURE/affichage
 * qui doivent se dégrader silencieusement plutôt que de planter le rendu.
 */
export function tryCreateAdminClient(): SupabaseClient<Database> | null {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return buildAdminClient(supabaseUrl, supabaseServiceRoleKey);
}
