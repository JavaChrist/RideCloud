/**
 * Rate limiter en mémoire (module-level Map).
 *
 * Fonctionnement : une Map globale par instance serverless conserve les compteurs
 * tant que la fonction reste chaude. Cela protège contre les rafales d'abus
 * (burst) sans nécessiter de Redis/Upstash.
 *
 * Limites :
 *   - Non distribué : chaque instance Vercel a son propre compteur.
 *   - Remise à zéro si l'instance redémarre (cold start).
 *
 * Suffisant pour protéger les endpoints sensibles à faible/moyen trafic.
 * Migrer vers Upstash Redis au-delà de ~10k req/min.
 */

interface RateLimitEntry {
  hits: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Vérifie si la clé `key` a dépassé `maxHits` requêtes dans `windowMs` ms.
 *
 * @returns `ok: true` si la requête est autorisée, `ok: false` si bloquée.
 */
export function rateLimit(
  key: string,
  maxHits: number,
  windowMs: number
): { ok: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { hits: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { ok: true, remaining: maxHits - 1, resetInMs: windowMs };
  }

  entry.hits += 1;
  const remaining = Math.max(0, maxHits - entry.hits);
  const resetInMs = Math.max(0, entry.resetAt - now);
  return { ok: entry.hits <= maxHits, remaining, resetInMs };
}

/**
 * Retourne l'IP du client depuis les headers de la requête (Vercel/Next.js).
 * Utilise `x-forwarded-for` en premier (proxy/CDN), sinon `x-real-ip`.
 * Retourne "unknown" si aucun header n'est disponible.
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
