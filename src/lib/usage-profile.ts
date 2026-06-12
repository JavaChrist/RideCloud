/**
 * Profil d'usage d'un véhicule — sert à estimer le kilométrage moyen annuel.
 *
 * La valeur de référence (`avg_km_per_year`) dépend du COUPLE (profil, type
 * de véhicule) : "tous les jours" en scooter ≠ "tous les jours" en voiture.
 *
 * Ces constantes sont la source de vérité côté frontend. Elles sont
 * recopiées dans la migration SQL (en fonction PL/pgSQL) pour permettre
 * un calcul cohérent côté serveur si nécessaire.
 */

import type { VehicleCategory } from "@/types/database";

export type UsageProfile = "daily" | "often" | "occasional" | "rare";

export const USAGE_PROFILE_VALUES: readonly UsageProfile[] = [
  "daily",
  "often",
  "occasional",
  "rare"
] as const;

export const USAGE_PROFILE_LABELS: Record<UsageProfile, string> = {
  daily: "Tous les jours",
  often: "Souvent",
  occasional: "De temps en temps",
  rare: "Rarement"
};

export const USAGE_PROFILE_DESCRIPTIONS: Record<UsageProfile, string> = {
  daily: "Trajets quotidiens domicile-travail, professionnel",
  often: "Plusieurs fois par semaine",
  occasional: "Quelques sorties par mois",
  rare: "Usage saisonnier ou de loisir uniquement"
};

/**
 * Table de correspondance (profil, catégorie) → km / an estimés.
 *
 * Source : valeurs de départ ajustées sur la base des moyennes ADEME et
 * statistiques d'usage observées pour chaque type de véhicule. Peuvent être
 * affinées plus tard avec les données réelles des utilisateurs.
 */
export const AVG_KM_PER_YEAR: Record<UsageProfile, Record<VehicleCategory, number>> = {
  daily: {
    voitures: 15000,
    motos: 12000,
    scooters: 5000,
    utilitaires: 25000
  },
  often: {
    voitures: 10000,
    motos: 7000,
    scooters: 3000,
    utilitaires: 15000
  },
  occasional: {
    voitures: 6000,
    motos: 4000,
    scooters: 1500,
    utilitaires: 8000
  },
  rare: {
    voitures: 3000,
    motos: 2000,
    scooters: 800,
    utilitaires: 4000
  }
};

/**
 * Renvoie la moyenne km/an estimée pour un couple (profil, catégorie).
 * Pure, déterministe, sans effet de bord.
 */
export function getAvgKmPerYear(profile: UsageProfile, category: VehicleCategory): number {
  return AVG_KM_PER_YEAR[profile][category];
}

/**
 * Profil par défaut pour les nouveaux véhicules (et le backfill des
 * anciens). "De temps en temps" est volontairement neutre — l'utilisateur
 * peut le préciser ensuite.
 */
export const DEFAULT_USAGE_PROFILE: UsageProfile = "occasional";

/**
 * Garde-fou de typage à l'exécution (les valeurs venant de la DB ou d'un
 * input formulaire peuvent être typées en string).
 */
export function isUsageProfile(value: unknown): value is UsageProfile {
  return typeof value === "string" && (USAGE_PROFILE_VALUES as readonly string[]).includes(value);
}
