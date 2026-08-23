import { z } from "zod";
import type { VehicleCategory } from "@/types/database";
import type { MaintenanceTemplateEntry } from "@/types/maintenance";

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const DEFAULT_MODEL = process.env.MISTRAL_MODEL ?? "mistral-small-latest";
const PROMPT_VERSION = "v1";

const TASK_PRIORITY = z.enum(["normal", "important", "urgent"]);

/** Seuil d'alerte : nombre, omis, ou null (tâche sans cycle km/temps). */
const OptionalDueSoonThreshold = z.number().int().positive().nullish();

const TaskSchema = z.object({
  titre: z.string().min(2).max(80),
  categorie: z.string().min(2).max(40),
  description: z.string().min(5).max(280),
  intervalKm: z.number().int().positive().nullable(),
  intervalMonths: z.number().int().positive().nullable(),
  firstDueKm: z.number().int().positive().nullable(),
  firstDueDate: z.string().nullable(),
  dueSoonKmThreshold: OptionalDueSoonThreshold,
  dueSoonDaysThreshold: OptionalDueSoonThreshold,
  priority: TASK_PRIORITY
});

const PlanResponseSchema = z.object({
  profileName: z.string().min(2).max(60),
  notes: z.string().max(280).optional(),
  tasks: z.array(TaskSchema).min(3).max(15)
});

export interface AiMaintenancePlanResult {
  profileName: string;
  templates: MaintenanceTemplateEntry[];
  llmModel: string;
  promptVersion: string;
  notes?: string;
}

export interface GeneratePlanInput {
  category: VehicleCategory;
  marque: string;
  modele: string;
  annee: number;
  carburant?: string | null;
}

const CATEGORY_LABEL: Record<VehicleCategory, string> = {
  voitures: "voiture",
  motos: "moto",
  scooters: "scooter",
  utilitaires: "véhicule utilitaire"
};

function buildPrompt(input: GeneratePlanInput): { system: string; user: string } {
  const system = `Tu es un expert en maintenance automobile et 2-roues. Tu connais les préconisations constructeur des principales marques européennes, japonaises, américaines et chinoises.

Ta mission : générer un plan d'entretien préventif réaliste pour un véhicule donné, basé sur les recommandations habituelles du constructeur.

Règles strictes :
- Réponds UNIQUEMENT en JSON valide, sans texte avant ni après
- 3 à 12 tâches d'entretien périodique
- Pour chaque tâche : titre court, catégorie technique, description précise (max 280 caractères)
- intervalKm = entier positif ou null (null si pas de cycle kilométrique)
- intervalMonths = entier positif ou null (null si pas de cycle temporel)
- firstDueKm = première échéance en km (entier ou null)
- firstDueDate = ISO 8601 ou null (souvent null, on calcule à partir de la mise en circulation)
- dueSoonKmThreshold = seuil d'alerte km avant échéance (entier positif, ou null/omis si pas de cycle kilométrique)
- dueSoonDaysThreshold = seuil d'alerte jours (15-60, ou null/omis si pas de cycle temporel)
- priority = "normal" | "important" | "urgent" (urgent = sécurité/réglementaire)
- Inclure les contrôles réglementaires si applicable (CT voiture/utilitaire en France)
- Pas de tâche pour les organes consommables non périodiques (ampoules, balais)

Catégories techniques attendues : "moteur", "transmission", "freinage", "suspension", "pneumatiques", "électrique", "réglementaire", "confort", "carburant"

Format JSON strict :
{
  "profileName": "Marque Modèle",
  "notes": "remarques courtes optionnelles",
  "tasks": [
    {
      "titre": "Vidange moteur",
      "categorie": "moteur",
      "description": "Vidange huile + filtre, intervalle constructeur.",
      "intervalKm": 10000,
      "intervalMonths": 12,
      "firstDueKm": 10000,
      "firstDueDate": null,
      "dueSoonKmThreshold": 700,
      "dueSoonDaysThreshold": 30,
      "priority": "important"
    }
  ]
}`;

  const fuelInfo = input.carburant ? `, carburant : ${input.carburant}` : "";
  const user = `Génère le plan d'entretien préventif pour cette ${CATEGORY_LABEL[input.category]} :
- Marque : ${input.marque}
- Modèle : ${input.modele}
- Année : ${input.annee}${fuelInfo}

Renvoie le JSON exact selon le schéma demandé.`;

  return { system, user };
}

export async function generateMaintenancePlanWithAi(
  input: GeneratePlanInput
): Promise<AiMaintenancePlanResult> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY manquante. Configurez la clé dans les variables d'environnement.");
  }

  const { system, user } = buildPrompt(input);

  const response = await fetch(MISTRAL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Mistral API ${response.status} : ${errorText.slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content ?? "";
  if (!content) {
    throw new Error("Mistral n'a renvoyé aucun contenu.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Réponse Mistral invalide (JSON malformé).");
  }

  const normalized = parseAndNormalizeAiPlan(parsed);

  return {
    profileName: normalized.profileName,
    templates: normalized.templates,
    llmModel: DEFAULT_MODEL,
    promptVersion: PROMPT_VERSION,
    notes: normalized.notes
  };
}

function nullToUndefined<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}

/**
 * Valide une réponse JSON Mistral puis normalise les seuils null → undefined
 * pour coller à `MaintenanceTemplateEntry` (champs optionnels).
 */
export function parseAndNormalizeAiPlan(raw: unknown): {
  profileName: string;
  notes?: string;
  templates: MaintenanceTemplateEntry[];
} {
  const result = PlanResponseSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(" | ");
    throw new Error(`Réponse Mistral invalide : ${issues}`);
  }

  return {
    profileName: result.data.profileName,
    notes: result.data.notes,
    templates: result.data.tasks.map((task) => ({
      titre: task.titre,
      categorie: task.categorie,
      description: task.description,
      intervalKm: task.intervalKm,
      intervalMonths: task.intervalMonths,
      firstDueKm: task.firstDueKm,
      firstDueDate: task.firstDueDate,
      dueSoonKmThreshold: nullToUndefined(task.dueSoonKmThreshold),
      dueSoonDaysThreshold: nullToUndefined(task.dueSoonDaysThreshold),
      priority: task.priority
    }))
  };
}

export function getMistralPromptVersion(): string {
  return PROMPT_VERSION;
}
