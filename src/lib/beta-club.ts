/** Application JavaChrist Beta Club (campagnes et missions). */
export const BETA_CLUB_MISSIONS_URL = "https://java-christ-beta-club.vercel.app/";

/** Invitation Discord publique JavaChrist (lien de serveur, pas un salon). */
export const JAVACHRIST_DISCORD_INVITE_URL = "https://discord.gg/7mD8UgBGv4";

/**
 * Invitation Discord publique.
 * Priorité : argument → `NEXT_PUBLIC_JAVACHRIST_DISCORD_INVITE` → invitation
 * JavaChrist par défaut.
 *
 * Accepte uniquement une invitation (`discord.gg/…` ou `discord.com/invite/…`).
 * Les liens de salon (`discord.com/channels/…`) sont rejetés : ils ne sont
 * pas utilisables par un visiteur hors serveur.
 */
export function getJavaChristDiscordInviteUrl(
  raw = process.env.NEXT_PUBLIC_JAVACHRIST_DISCORD_INVITE || JAVACHRIST_DISCORD_INVITE_URL
): string | null {
  const value = raw?.trim() ?? "";
  if (!value) return null;

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const path = url.pathname;

    const isInvite =
      host === "discord.gg" ||
      (host === "discord.com" && path.startsWith("/invite/")) ||
      (host === "discordapp.com" && path.startsWith("/invite/"));

    if (!isInvite) return null;
    return url.toString();
  } catch {
    return null;
  }
}
