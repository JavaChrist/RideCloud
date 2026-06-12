/**
 * Estimation du kilométrage courant entre deux saisies manuelles du compteur.
 *
 * Toutes les fonctions de ce module sont PURES et déterministes : elles
 * dépendent uniquement de leurs arguments (date "now" injectable), n'ont
 * aucun side-effect, et sont donc directement testables.
 *
 * Modèle linéaire : on suppose un rythme moyen constant `avg_km_per_year`.
 * À chaque saisie réelle du compteur, on recale `last_odometer_*` → le
 * modèle redevient juste pour la suite.
 */

import { differenceInCalendarDays, addDays, parseISO } from "date-fns";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_YEAR = 365;

/**
 * Estime le kilométrage courant à partir du dernier point de référence.
 *
 * Formule : km_estimé = lastOdometerValue + avgKmPerYear * (jours_écoulés / 365)
 *
 * - `lastOdometerDate` est l'ISO date du dernier recalage (saisie manuelle
 *   du compteur, ou enregistrement d'un entretien).
 * - Le résultat est arrondi à l'entier (pas de demi-kilomètres affichés).
 * - On ne descend jamais sous `lastOdometerValue` : si l'horloge système
 *   est en arrière (cas exotique), on renvoie la dernière valeur connue.
 */
export function estimateCurrentOdometer(input: {
  lastOdometerValue: number;
  lastOdometerDate: string | Date;
  avgKmPerYear: number;
  now?: Date;
}): number {
  const now = input.now ?? new Date();
  const refDate =
    typeof input.lastOdometerDate === "string"
      ? parseISO(input.lastOdometerDate)
      : input.lastOdometerDate;
  const daysElapsed = Math.max(0, (now.getTime() - refDate.getTime()) / MS_PER_DAY);
  const kmDelta = (input.avgKmPerYear * daysElapsed) / DAYS_PER_YEAR;
  return Math.max(input.lastOdometerValue, Math.round(input.lastOdometerValue + kmDelta));
}

/**
 * Projette la DATE à laquelle l'odomètre estimé atteindra `targetKm`,
 * en partant du dernier point de référence et en supposant le rythme
 * `avgKmPerYear`.
 *
 * Renvoie `null` si :
 *   - targetKm est nul ou non fourni
 *   - avgKmPerYear ≤ 0 (rythme inconnu / véhicule à l'arrêt)
 *   - targetKm est déjà atteint au moment du calcul → renvoie la date du
 *     dernier recalage (échéance dépassée).
 */
export function projectDateForOdometer(input: {
  targetKm: number | null;
  lastOdometerValue: number;
  lastOdometerDate: string | Date;
  avgKmPerYear: number;
}): Date | null {
  if (input.targetKm == null) return null;
  if (input.avgKmPerYear <= 0) return null;

  const refDate =
    typeof input.lastOdometerDate === "string"
      ? parseISO(input.lastOdometerDate)
      : input.lastOdometerDate;
  const kmRemaining = input.targetKm - input.lastOdometerValue;
  if (kmRemaining <= 0) return refDate;
  const daysToTarget = Math.ceil((kmRemaining * DAYS_PER_YEAR) / input.avgKmPerYear);
  return addDays(refDate, daysToTarget);
}

/**
 * Renvoie le nombre de jours pleins écoulés depuis le dernier recalage du
 * compteur. Utile pour afficher "Dernière saisie il y a X jours" et
 * déclencher le rappel non bloquant après 30 jours.
 */
export function daysSinceOdometerRefresh(input: {
  lastOdometerDate: string | Date | null;
  now?: Date;
}): number | null {
  if (!input.lastOdometerDate) return null;
  const now = input.now ?? new Date();
  const ref =
    typeof input.lastOdometerDate === "string"
      ? parseISO(input.lastOdometerDate)
      : input.lastOdometerDate;
  return Math.max(0, differenceInCalendarDays(now, ref));
}

/**
 * Date d'alerte effective d'un entretien = MIN(échéance temporelle, échéance
 * kilométrique projetée).
 *
 * - L'échéance temporelle (`nextDueDate`) reste le filet de sécurité, comme
 *   demandé dans le brief : on ne supprime jamais ce signal.
 * - L'échéance kilométrique est convertie en date estimée via
 *   `projectDateForOdometer` (utilise le rythme `avgKmPerYear`).
 * - Le retour précise quel des deux signaux a déclenché l'alerte, ce qui
 *   permet à l'UI d'afficher "dans X km" OU "dans Y jours" selon le cas.
 */
export interface EffectiveDueResult {
  /** Date effective d'alerte (la plus proche des deux échéances). */
  effectiveDate: Date | null;
  /** Date temporelle pure (intervalle de temps, indépendante du km). */
  dateBound: Date | null;
  /** Date projetée pour l'échéance km (basée sur avgKmPerYear). */
  kmBound: Date | null;
  /** Lequel des deux a déclenché l'alerte effective. */
  triggeredBy: "date" | "km" | null;
}

export function getEffectiveDueDate(input: {
  nextDueKm: number | null;
  nextDueDate: string | null;
  lastOdometerValue: number;
  lastOdometerDate: string | Date;
  avgKmPerYear: number;
}): EffectiveDueResult {
  const dateBound = input.nextDueDate ? parseISO(input.nextDueDate) : null;
  const kmBound = projectDateForOdometer({
    targetKm: input.nextDueKm,
    lastOdometerValue: input.lastOdometerValue,
    lastOdometerDate: input.lastOdometerDate,
    avgKmPerYear: input.avgKmPerYear
  });

  if (dateBound && kmBound) {
    if (dateBound.getTime() <= kmBound.getTime()) {
      return { effectiveDate: dateBound, dateBound, kmBound, triggeredBy: "date" };
    }
    return { effectiveDate: kmBound, dateBound, kmBound, triggeredBy: "km" };
  }
  if (dateBound) return { effectiveDate: dateBound, dateBound, kmBound: null, triggeredBy: "date" };
  if (kmBound) return { effectiveDate: kmBound, dateBound: null, kmBound, triggeredBy: "km" };
  return { effectiveDate: null, dateBound: null, kmBound: null, triggeredBy: null };
}
