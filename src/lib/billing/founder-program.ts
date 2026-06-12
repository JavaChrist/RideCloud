/**
 * Couche d'accès Supabase pour le programme "Membres Fondateurs".
 *
 * Toute la logique sensible (compteur, attribution du numéro, déblocage du
 * Premium à vie, contrôle du délai) vit dans des fonctions Postgres
 * `SECURITY DEFINER` appelées via `supabase.rpc()`. Ce fichier n'est qu'une
 * façade typée — il NE COMPTE NI N'ATTRIBUE rien côté client.
 *
 * Stack : Supabase pur (Postgres + RLS + RPC) — pas de Firebase.
 * `joinedAt` est un `Date` natif TypeScript construit depuis l'ISO Postgres.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// ---------------------------------------------------------------------------
// Constantes (mirroir du SQL — la base reste la source de vérité côté serveur)
// ---------------------------------------------------------------------------
export const FOUNDER_LIMIT = 100;
export const QUESTIONNAIRE_WINDOW_DAYS = 30;
export const REMINDER_DAY = 20;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type FounderStatus = "pending" | "completed" | "expired";

export interface FounderRecord {
  slot: number;
  joinedAt: Date;
  questionnaireCompletedAt: Date | null;
  status: FounderStatus;
  premiumLifetime: boolean;
  badge: boolean;
}

export interface QuestionnaireAnswers {
  usage: string;
  nps: number;
  frustration: string;
  topFeature: string;
  pricing: string;
}

export type ClaimResult =
  | { ok: true; slot: number; alreadyMember: boolean }
  | { ok: false; reason: "program_full" };

type SubmitReason = "no_slot" | "expired" | "already_done";

// ---------------------------------------------------------------------------
// Helpers de dates (purs, indépendants de Supabase)
// ---------------------------------------------------------------------------

/**
 * Date limite (exclusive) au-delà de laquelle le questionnaire n'est plus
 * acceptable. = joinedAt + QUESTIONNAIRE_WINDOW_DAYS (jours calendaires).
 */
export function questionnaireDeadline(joinedAt: Date): Date {
  const d = new Date(joinedAt.getTime());
  d.setDate(d.getDate() + QUESTIONNAIRE_WINDOW_DAYS);
  return d;
}

/**
 * Nombre de jours pleins écoulés depuis l'obtention de la place.
 * Retourne 0 le jour même.
 */
export function daysSinceJoin(joinedAt: Date, now: Date = new Date()): number {
  const ms = now.getTime() - joinedAt.getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/**
 * Nombre de jours restants avant la deadline du questionnaire.
 * Plancher à 0 (jamais négatif côté UI ; pour savoir si expiré, utiliser
 * `effectiveStatus`).
 */
export function daysLeft(joinedAt: Date, now: Date = new Date()): number {
  const deadline = questionnaireDeadline(joinedAt);
  const ms = deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/**
 * Statut effectif côté client :
 * - completed si le questionnaire a été soumis,
 * - expired   si pending mais now > deadline,
 * - pending   sinon.
 *
 * Reste informatif : la décision réelle d'expiration est ENCORE prise côté
 * serveur dans `submit_founder_questionnaire`.
 */
export function effectiveStatus(record: FounderRecord, now: Date = new Date()): FounderStatus {
  if (record.questionnaireCompletedAt) return "completed";
  if (record.status === "completed") return "completed";
  const deadline = questionnaireDeadline(record.joinedAt);
  if (now > deadline) return "expired";
  return record.status;
}

// ---------------------------------------------------------------------------
// Helpers internes
// ---------------------------------------------------------------------------

type FounderMemberRow = {
  user_id: string;
  slot: number;
  joined_at: string;
  status: FounderStatus;
  completed_at: string | null;
  premium_lifetime: boolean;
  badge: boolean;
};

type ClaimRpcResponse =
  | { ok: true; slot: number; alreadyMember: boolean }
  | { ok: false; reason: "program_full" | "not_authenticated" };

type SubmitRpcResponse =
  | { ok: true }
  | { ok: false; reason: SubmitReason | "not_authenticated" | "invalid_nps" | "invalid_payload" };

// ---------------------------------------------------------------------------
// Accès données — Supabase
// ---------------------------------------------------------------------------

/**
 * Réserve une place fondateur (1..100) pour l'utilisateur courant.
 * Idempotent : si l'utilisateur a déjà un slot, on le renvoie sans en
 * consommer un nouveau. Atomique côté Postgres.
 *
 * @param supabase - Client Supabase authentifié (session utilisateur).
 *                   L'identité est récupérée côté serveur via `auth.uid()`,
 *                   on ne fait jamais confiance à un uid passé en argument.
 */
export async function claimFounderSlot(
  supabase: SupabaseClient<Database>
): Promise<ClaimResult> {
  const { data, error } = await supabase.rpc("claim_founder_slot");

  if (error) {
    console.error("[founder-program] claim_founder_slot error", error);
    return { ok: false, reason: "program_full" };
  }

  const res = data as ClaimRpcResponse | null;
  if (!res || res.ok === false) {
    return { ok: false, reason: "program_full" };
  }

  return {
    ok: true,
    slot: res.slot,
    alreadyMember: res.alreadyMember
  };
}

/**
 * Lit la place fondateur de l'utilisateur authentifié.
 * Retourne `null` si l'utilisateur n'a pas de place (ou n'est pas connecté).
 *
 * S'appuie sur la RLS `founder_members_read_own` qui restreint déjà à
 * `auth.uid() = user_id`.
 */
export async function getFounderRecord(
  supabase: SupabaseClient<Database>
): Promise<FounderRecord | null> {
  const { data, error } = await supabase
    .from("founder_members")
    .select("user_id, slot, joined_at, status, completed_at, premium_lifetime, badge")
    .maybeSingle<FounderMemberRow>();

  if (error) {
    console.error("[founder-program] getFounderRecord error", error);
    return null;
  }
  if (!data) return null;

  return {
    slot: data.slot,
    joinedAt: new Date(data.joined_at),
    questionnaireCompletedAt: data.completed_at ? new Date(data.completed_at) : null,
    status: data.status,
    premiumLifetime: data.premium_lifetime,
    badge: data.badge
  };
}

/**
 * Compteur public du nombre de places déjà attribuées (pour la landing
 * du programme). Renvoie 0 en cas d'erreur réseau pour ne pas casser la page.
 */
export async function getSlotsTaken(supabase: SupabaseClient<Database>): Promise<number> {
  const { data, error } = await supabase.rpc("founder_slots_taken");
  if (error || typeof data !== "number") return 0;
  return data;
}

/**
 * Soumet le questionnaire fondateur. Le serveur valide :
 * - que l'utilisateur a bien une place,
 * - que le questionnaire n'a pas déjà été rempli,
 * - qu'on est encore dans les 30 jours.
 * Sur succès, le Premium à vie et le badge sont débloqués dans la même
 * transaction Postgres.
 */
export async function submitQuestionnaire(
  supabase: SupabaseClient<Database>,
  answers: QuestionnaireAnswers
): Promise<{ ok: boolean; reason?: SubmitReason }> {
  const { data, error } = await supabase.rpc("submit_founder_questionnaire", {
    p_usage: answers.usage,
    p_nps: answers.nps,
    p_frustration: answers.frustration,
    p_top_feature: answers.topFeature,
    p_pricing: answers.pricing
  } as never);

  if (error) {
    console.error("[founder-program] submit_founder_questionnaire error", error);
    return { ok: false };
  }

  const res = data as SubmitRpcResponse | null;
  if (!res) return { ok: false };
  if (res.ok === true) return { ok: true };

  // On n'expose au caller que les 3 raisons documentées par le brief ;
  // les autres (not_authenticated / invalid_*) sont des erreurs de garde,
  // remontées en `ok: false` sans `reason` pour éviter une UX confuse.
  if (res.reason === "no_slot" || res.reason === "expired" || res.reason === "already_done") {
    return { ok: false, reason: res.reason };
  }
  return { ok: false };
}
