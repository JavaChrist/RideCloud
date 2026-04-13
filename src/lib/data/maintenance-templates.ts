import type { MaintenanceTemplateByCategory } from "@/types/maintenance";

export const maintenanceTemplates: MaintenanceTemplateByCategory = {
  motos: [
    {
      titre: "Révision rodage",
      categorie: "moteur",
      description: "Première révision après rodage constructeur.",
      intervalKm: null,
      intervalMonths: null,
      firstDueKm: 1000,
      firstDueDate: null,
      dueSoonKmThreshold: 200,
      dueSoonDaysThreshold: 15,
      priority: "important"
    },
    {
      titre: "Vidange moteur",
      categorie: "moteur",
      description: "Vidange + filtre à huile.",
      intervalKm: 6000,
      intervalMonths: 12,
      firstDueKm: 6000,
      firstDueDate: null,
      dueSoonKmThreshold: 600,
      dueSoonDaysThreshold: 30,
      priority: "important"
    },
    {
      titre: "Contrôle chaîne",
      categorie: "transmission",
      description: "Nettoyage, tension et graissage.",
      intervalKm: 1000,
      intervalMonths: 3,
      firstDueKm: 1000,
      firstDueDate: null,
      dueSoonKmThreshold: 150,
      dueSoonDaysThreshold: 15,
      priority: "normal"
    },
    {
      titre: "Liquide de frein",
      categorie: "freinage",
      description: "Remplacement liquide DOT.",
      intervalKm: null,
      intervalMonths: 24,
      firstDueKm: null,
      firstDueDate: null,
      dueSoonDaysThreshold: 45,
      priority: "important"
    },
    {
      titre: "Contrôle pneus",
      categorie: "pneumatiques",
      description: "Pression et usure.",
      intervalKm: 2000,
      intervalMonths: 2,
      firstDueKm: 2000,
      firstDueDate: null,
      dueSoonKmThreshold: 250,
      dueSoonDaysThreshold: 15,
      priority: "normal"
    }
  ],
  voitures: [
    {
      titre: "Vidange moteur",
      categorie: "moteur",
      description: "Vidange + filtre à huile.",
      intervalKm: 15000,
      intervalMonths: 12,
      firstDueKm: 15000,
      firstDueDate: null,
      dueSoonKmThreshold: 1200,
      dueSoonDaysThreshold: 30,
      priority: "important"
    },
    {
      titre: "Filtre habitacle",
      categorie: "confort",
      description: "Remplacement filtre cabine.",
      intervalKm: 15000,
      intervalMonths: 12,
      firstDueKm: 15000,
      firstDueDate: null,
      dueSoonKmThreshold: 1200,
      dueSoonDaysThreshold: 30,
      priority: "normal"
    },
    {
      titre: "Liquide de frein",
      categorie: "freinage",
      description: "Purge et remplacement.",
      intervalKm: null,
      intervalMonths: 24,
      firstDueKm: null,
      firstDueDate: null,
      dueSoonDaysThreshold: 45,
      priority: "important"
    },
    {
      titre: "Contrôle technique",
      categorie: "réglementaire",
      description: "Contrôle technique périodique.",
      intervalKm: null,
      intervalMonths: 24,
      firstDueKm: null,
      firstDueDate: null,
      dueSoonDaysThreshold: 60,
      priority: "urgent"
    },
    {
      titre: "Contrôle pneus",
      categorie: "pneumatiques",
      description: "Pression, géométrie et usure.",
      intervalKm: 5000,
      intervalMonths: 3,
      firstDueKm: 5000,
      firstDueDate: null,
      dueSoonKmThreshold: 500,
      dueSoonDaysThreshold: 20,
      priority: "normal"
    }
  ],
  scooters: [
    {
      titre: "Vidange moteur",
      categorie: "moteur",
      description: "Vidange périodique scooter.",
      intervalKm: 5000,
      intervalMonths: 12,
      firstDueKm: 5000,
      firstDueDate: null,
      dueSoonKmThreshold: 500,
      dueSoonDaysThreshold: 30,
      priority: "important"
    },
    {
      titre: "Transmission variateur/courroie",
      categorie: "transmission",
      description: "Contrôle courroie et galets.",
      intervalKm: 10000,
      intervalMonths: 18,
      firstDueKm: 10000,
      firstDueDate: null,
      dueSoonKmThreshold: 700,
      dueSoonDaysThreshold: 30,
      priority: "important"
    },
    {
      titre: "Liquide de frein",
      categorie: "freinage",
      description: "Remplacement liquide.",
      intervalKm: null,
      intervalMonths: 24,
      firstDueKm: null,
      firstDueDate: null,
      dueSoonDaysThreshold: 45,
      priority: "important"
    },
    {
      titre: "Contrôle pneus",
      categorie: "pneumatiques",
      description: "Pression et usure.",
      intervalKm: 2000,
      intervalMonths: 2,
      firstDueKm: 2000,
      firstDueDate: null,
      dueSoonKmThreshold: 250,
      dueSoonDaysThreshold: 15,
      priority: "normal"
    }
  ],
  utilitaires: [
    {
      titre: "Vidange moteur",
      categorie: "moteur",
      description: "Vidange moteur usage utilitaire.",
      intervalKm: 20000,
      intervalMonths: 12,
      firstDueKm: 20000,
      firstDueDate: null,
      dueSoonKmThreshold: 1500,
      dueSoonDaysThreshold: 30,
      priority: "important"
    },
    {
      titre: "Filtre carburant",
      categorie: "moteur",
      description: "Remplacement filtre carburant.",
      intervalKm: 30000,
      intervalMonths: 18,
      firstDueKm: 30000,
      firstDueDate: null,
      dueSoonKmThreshold: 2000,
      dueSoonDaysThreshold: 30,
      priority: "normal"
    },
    {
      titre: "Freinage complet",
      categorie: "freinage",
      description: "Contrôle disques, plaquettes, liquide.",
      intervalKm: 25000,
      intervalMonths: 12,
      firstDueKm: 25000,
      firstDueDate: null,
      dueSoonKmThreshold: 1500,
      dueSoonDaysThreshold: 30,
      priority: "important"
    },
    {
      titre: "Contrôle pneus",
      categorie: "pneumatiques",
      description: "Contrôle charge/usure/pression.",
      intervalKm: 5000,
      intervalMonths: 3,
      firstDueKm: 5000,
      firstDueDate: null,
      dueSoonKmThreshold: 500,
      dueSoonDaysThreshold: 20,
      priority: "normal"
    },
    {
      titre: "Contrôle technique utilitaire",
      categorie: "réglementaire",
      description: "Suivi périodique réglementaire.",
      intervalKm: null,
      intervalMonths: 12,
      firstDueKm: null,
      firstDueDate: null,
      dueSoonDaysThreshold: 45,
      priority: "urgent"
    }
  ]
};
