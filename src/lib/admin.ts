/**
 * Helpers de contrôle d'accès admin.
 *
 * RideCloud n'a pas de notion de rôle au niveau base : on s'appuie sur une
 * liste blanche d'emails configurée via la variable d'environnement
 * `ADMIN_EMAILS` (séparés par virgule).
 *
 * Exemple .env :
 *   ADMIN_EMAILS=support@javachrist.fr,contact@javachrist.fr
 *
 * Si la variable n'est pas définie, AUCUN utilisateur n'est admin
 * (default-deny) — c'est volontaire pour ne jamais ouvrir l'admin par
 * inadvertance en local ou en preview.
 */

function getAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

/**
 * Renvoie `true` si l'email passé en argument est autorisé à accéder aux
 * sections d'administration RideCloud.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().has(email.toLowerCase());
}
