import type { ManufacturerMaintenanceTemplateRule } from "@/types/maintenance";

export const manufacturerMaintenanceTemplateRules: ManufacturerMaintenanceTemplateRule[] = [
  {
    category: "motos",
    marque: "Voge",
    modeleContains: "900DSX",
    profileName: "Voge 900DSX",
    templates: [
      {
        titre: "Révision rodage",
        categorie: "moteur",
        description: "Première révision après rodage constructeur.",
        intervalKm: null,
        intervalMonths: null,
        firstDueKm: 1000,
        firstDueDate: null,
        dueSoonKmThreshold: 150,
        dueSoonDaysThreshold: 15,
        priority: "important"
      },
      {
        titre: "Vidange moteur",
        categorie: "moteur",
        description: "Vidange + filtre selon préconisation constructeur.",
        intervalKm: 10000,
        intervalMonths: 12,
        firstDueKm: 10000,
        firstDueDate: null,
        dueSoonKmThreshold: 700,
        dueSoonDaysThreshold: 30,
        priority: "important"
      },
      {
        titre: "Contrôle chaîne",
        categorie: "transmission",
        description: "Nettoyage, tension et graissage régulier.",
        intervalKm: 1000,
        intervalMonths: 2,
        firstDueKm: 1000,
        firstDueDate: null,
        dueSoonKmThreshold: 120,
        dueSoonDaysThreshold: 10,
        priority: "normal"
      },
      {
        titre: "Contrôle jeu soupapes",
        categorie: "moteur",
        description: "Contrôle périodique du jeu aux soupapes.",
        intervalKm: 24000,
        intervalMonths: 24,
        firstDueKm: 24000,
        firstDueDate: null,
        dueSoonKmThreshold: 1500,
        dueSoonDaysThreshold: 45,
        priority: "important"
      }
    ]
  },
  {
    category: "motos",
    marque: "Yamaha",
    modeleContains: "MT-07",
    profileName: "Yamaha MT-07",
    templates: [
      {
        titre: "Vidange moteur",
        categorie: "moteur",
        description: "Vidange périodique MT-07.",
        intervalKm: 10000,
        intervalMonths: 12,
        firstDueKm: 10000,
        firstDueDate: null,
        dueSoonKmThreshold: 700,
        dueSoonDaysThreshold: 30,
        priority: "important"
      },
      {
        titre: "Contrôle chaîne",
        categorie: "transmission",
        description: "Contrôle tension/alignement chaîne.",
        intervalKm: 1000,
        intervalMonths: 2,
        firstDueKm: 1000,
        firstDueDate: null,
        dueSoonKmThreshold: 150,
        dueSoonDaysThreshold: 10,
        priority: "normal"
      }
    ]
  },
  {
    category: "voitures",
    marque: "Peugeot",
    modeleContains: "308",
    profileName: "Peugeot 308",
    templates: [
      {
        titre: "Vidange moteur",
        categorie: "moteur",
        description: "Vidange selon entretien constructeur Peugeot.",
        intervalKm: 20000,
        intervalMonths: 12,
        firstDueKm: 20000,
        firstDueDate: null,
        dueSoonKmThreshold: 1500,
        dueSoonDaysThreshold: 30,
        priority: "important"
      },
      {
        titre: "Filtre habitacle",
        categorie: "confort",
        description: "Remplacement filtre habitacle annuel.",
        intervalKm: 20000,
        intervalMonths: 12,
        firstDueKm: 20000,
        firstDueDate: null,
        dueSoonKmThreshold: 1200,
        dueSoonDaysThreshold: 30,
        priority: "normal"
      }
    ]
  }
];
