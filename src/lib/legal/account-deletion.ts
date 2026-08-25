/** Contact support réellement utilisé dans RideCloud (pages légales, Paramètres). */
export const RIDE_CLOUD_SUPPORT_EMAIL = "support@javachrist.fr";

export const ACCOUNT_DELETION_MAIL_SUBJECT = "Demande de suppression de compte RideCloud";

export const ACCOUNT_DELETION_MAIL_BODY = `Bonjour,

Je demande la suppression de mon compte RideCloud et des données associées.

Adresse e-mail associée à mon compte RideCloud :
[indiquez ici l'adresse e-mail de votre compte]

Je confirme que je souhaite la suppression définitive de ce compte.

Merci.`;

const FORBIDDEN_MAIL_TERMS = [
  "mot de passe",
  "password",
  "token",
  "secret",
  "iban",
  "carte bancaire",
  "numéro de carte"
] as const;

export function buildAccountDeletionMailto(): string {
  return `mailto:${RIDE_CLOUD_SUPPORT_EMAIL}?subject=${encodeURIComponent(ACCOUNT_DELETION_MAIL_SUBJECT)}&body=${encodeURIComponent(ACCOUNT_DELETION_MAIL_BODY)}`;
}

export function accountDeletionMailtoContainsSecrets(): boolean {
  const haystack = `${ACCOUNT_DELETION_MAIL_SUBJECT}\n${ACCOUNT_DELETION_MAIL_BODY}`.toLowerCase();
  return FORBIDDEN_MAIL_TERMS.some((term) => haystack.includes(term));
}
