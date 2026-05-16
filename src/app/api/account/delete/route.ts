import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

/**
 * POST /api/account/delete
 *
 * Supprime DÉFINITIVEMENT le compte de l'utilisateur authentifié et l'ensemble
 * des données associées, conformément à l'article 17 du RGPD (droit à l'effacement).
 *
 * Étapes :
 *   1. Vérification de l'authentification via cookies SSR.
 *   2. Vérification du consentement explicite (champ `confirm` = email du compte).
 *   3. Suppression des fichiers Storage préfixés par `${userId}/`.
 *   4. Suppression en cascade des données métier (documents, modifications,
 *      plans d'entretien, rappels, entretiens, véhicules, profil).
 *   5. Suppression de l'utilisateur dans `auth.users` via le service role.
 *
 * Le client effectue ensuite un `signOut()` côté navigateur.
 */
export async function POST(request: Request) {
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json(
      {
        error:
          "Suppression indisponible : SUPABASE_SERVICE_ROLE_KEY n'est pas configurée côté serveur."
      },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let body: { confirm?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de la requête invalide" }, { status: 400 });
  }

  const confirmation = (body.confirm ?? "").trim().toLowerCase();
  const expected = (user.email ?? "").trim().toLowerCase();

  if (!expected || confirmation !== expected) {
    return NextResponse.json(
      { error: "Confirmation requise : saisissez votre adresse e-mail exacte pour valider." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const userId = user.id;
  const errors: string[] = [];

  // 1. Storage : supprimer récursivement tous les fichiers sous {userId}/
  try {
    await deleteUserStorage(admin, userId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur Storage";
    errors.push(`Storage : ${message}`);
  }

  // 2. Données métier (ordre : enfants → parents, par sécurité même si CASCADE)
  const tables = [
    "documents",
    "modifications",
    "maintenance_plan_entries",
    "upcoming_maintenance",
    "maintenance_entries",
    "vehicles",
    "profiles"
  ] as const;

  for (const table of tables) {
    const column = table === "profiles" ? "id" : "user_id";
    const { error } = await admin.from(table).delete().eq(column, userId);
    if (error) {
      errors.push(`${table} : ${error.message}`);
    }
  }

  // 3. Suppression de l'utilisateur Supabase Auth
  const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
  if (deleteUserError) {
    errors.push(`auth.users : ${deleteUserError.message}`);
    return NextResponse.json(
      {
        error: "Suppression partielle. Le compte n'a pas pu être totalement supprimé.",
        details: errors
      },
      { status: 500 }
    );
  }

  if (errors.length > 0) {
    console.warn("[account/delete] Suppression terminée avec avertissements :", errors);
  }

  return NextResponse.json({ ok: true });
}

/**
 * Supprime récursivement tous les fichiers d'un utilisateur dans le bucket
 * `ridecloud-files`. Le bucket utilise la convention `{userId}/...`.
 */
async function deleteUserStorage(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<void> {
  const bucket = "ridecloud-files";
  const paths: string[] = [];

  async function walk(prefix: string) {
    const { data, error } = await admin.storage.from(bucket).list(prefix, {
      limit: 1000,
      sortBy: { column: "name", order: "asc" }
    });
    if (error) {
      throw new Error(error.message);
    }
    if (!data) return;

    for (const entry of data) {
      const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) {
        await walk(fullPath);
      } else {
        paths.push(fullPath);
      }
    }
  }

  await walk(userId);

  while (paths.length > 0) {
    const chunk = paths.splice(0, 100);
    const { error } = await admin.storage.from(bucket).remove(chunk);
    if (error) {
      throw new Error(error.message);
    }
  }
}
