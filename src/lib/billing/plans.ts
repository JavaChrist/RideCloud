import type { Plan, PlanInterval } from "@/types/database";

export interface PlanDefinition {
  id: Plan;
  name: string;
  tagline: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  vehicleLimit: number;
  documentsUnlimited: boolean;
  features: string[];
  highlight?: boolean;
  cta: string;
}

/**
 * Plans RideCloud — source unique de vérité pour les tarifs.
 *
 * Modifier ici met à jour automatiquement :
 *   - la page publique `/tarifs`
 *   - la section abonnement de `/parametres`
 *   - la modal d'upgrade au quota atteint
 *   - les descriptions envoyées à Mollie au moment du checkout
 *
 * Les prix sont en EUROS, taxes incluses (l'éditeur étant en franchise de TVA,
 * art. 293 B du CGI, aucune TVA n'est facturée pour l'instant).
 */
export const PLANS: Record<Plan, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Pour démarrer",
    description: "L'essentiel pour suivre un véhicule, sans engagement.",
    price: { monthly: 0, yearly: 0 },
    vehicleLimit: 1,
    documentsUnlimited: false,
    features: [
      "1 véhicule",
      "Entretiens illimités",
      "Rappels intelligents",
      "1 document par véhicule",
      "Export JSON",
      "PWA installable"
    ],
    cta: "Commencer gratuitement"
  },
  premium: {
    id: "premium",
    name: "Premium",
    tagline: "Pour les multi-véhicules",
    description: "Pour ceux qui possèdent plusieurs véhicules et veulent tout maîtriser.",
    price: { monthly: 3.99, yearly: 39 },
    vehicleLimit: 5,
    documentsUnlimited: true,
    features: [
      "Jusqu'à 5 véhicules",
      "Documents illimités",
      "Plan d'entretien intelligent",
      "Export PDF, JSON, ZIP",
      "Passeport numérique pour la revente",
      "Support prioritaire"
    ],
    highlight: true,
    cta: "Passer Premium"
  },
  family: {
    id: "family",
    name: "Family",
    tagline: "Pour la famille / le foyer",
    description: "L'offre pensée pour un foyer entier ou un passionné multi-engins.",
    price: { monthly: 7.99, yearly: 79 },
    vehicleLimit: 10,
    documentsUnlimited: true,
    features: [
      "Jusqu'à 10 véhicules",
      "Tout Premium",
      "Partage entre 4 comptes (V1, 2026)",
      "Profil maintenance avancé",
      "Statistiques foyer",
      "Support prioritaire"
    ],
    cta: "Choisir Family"
  }
};

export function getPlan(id: Plan): PlanDefinition {
  return PLANS[id];
}

export function getYearlyDiscount(plan: PlanDefinition): number {
  if (plan.price.monthly === 0) return 0;
  const monthly12 = plan.price.monthly * 12;
  if (monthly12 === 0) return 0;
  return Math.round((1 - plan.price.yearly / monthly12) * 100);
}

export function formatPrice(amount: number, interval: PlanInterval = "monthly"): string {
  const formatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  });
  if (amount === 0) return "Gratuit";
  return `${formatter.format(amount)}/${interval === "monthly" ? "mois" : "an"}`;
}

export function getPriceForInterval(plan: PlanDefinition, interval: PlanInterval): number {
  return interval === "monthly" ? plan.price.monthly : plan.price.yearly;
}

export const PAID_PLAN_IDS = ["premium", "family"] as const satisfies readonly Plan[];

export function isPaidPlan(plan: Plan): plan is "premium" | "family" {
  return PAID_PLAN_IDS.includes(plan as "premium" | "family");
}
