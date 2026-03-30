import type {
  DocumentItem,
  MaintenanceEntry,
  Modification,
  UpcomingMaintenance,
  Vehicle,
  VehicleCategory
} from "@/types/database";

export const categoryLabels: Record<VehicleCategory, string> = {
  voitures: "Voitures",
  motos: "Motos",
  scooters: "Scooters",
  utilitaires: "Utilitaires"
};

export const demoVehicles: Vehicle[] = [
  {
    id: "v1",
    user_id: "demo-user",
    category: "motos",
    marque: "Yamaha",
    modele: "MT-07",
    annee: 2021,
    kilometrage: 18600,
    date_achat: "2022-04-13",
    carburant: null,
    immatriculation: "FR-451-MT",
    vin: null,
    surnom: "Bleue urbaine",
    photo_url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1200&auto=format&fit=crop",
    created_at: "2025-01-01",
    updated_at: "2025-01-01"
  },
  {
    id: "v2",
    user_id: "demo-user",
    category: "motos",
    marque: "Kawasaki",
    modele: "Z900",
    annee: 2020,
    kilometrage: 24500,
    date_achat: "2021-06-09",
    carburant: null,
    immatriculation: "FR-982-KW",
    vin: null,
    surnom: null,
    photo_url: "https://images.unsplash.com/photo-1635073908681-47aa49dd87f2?q=80&w=1200&auto=format&fit=crop",
    created_at: "2025-01-01",
    updated_at: "2025-01-01"
  },
  {
    id: "v3",
    user_id: "demo-user",
    category: "motos",
    marque: "Ducati",
    modele: "Monster",
    annee: 2023,
    kilometrage: 9200,
    date_achat: "2024-01-17",
    carburant: null,
    immatriculation: "FR-667-DC",
    vin: null,
    surnom: "Rouge",
    photo_url: "https://images.unsplash.com/photo-1558980664-10ea2927821b?q=80&w=1200&auto=format&fit=crop",
    created_at: "2025-01-01",
    updated_at: "2025-01-01"
  },
  {
    id: "v4",
    user_id: "demo-user",
    category: "motos",
    marque: "BMW",
    modele: "R 1250 GS",
    annee: 2022,
    kilometrage: 12840,
    date_achat: "2023-03-20",
    carburant: null,
    immatriculation: "FR-125-GS",
    vin: null,
    surnom: null,
    photo_url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200&auto=format&fit=crop",
    created_at: "2025-01-01",
    updated_at: "2025-01-01"
  },
  {
    id: "v5",
    user_id: "demo-user",
    category: "voitures",
    marque: "Peugeot",
    modele: "308",
    annee: 2019,
    kilometrage: 72300,
    date_achat: "2019-10-02",
    carburant: "Diesel",
    immatriculation: "FR-308-PE",
    vin: null,
    surnom: null,
    photo_url: "https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1200&auto=format&fit=crop",
    created_at: "2025-01-01",
    updated_at: "2025-01-01"
  },
  {
    id: "v6",
    user_id: "demo-user",
    category: "scooters",
    marque: "Piaggio",
    modele: "Beverly 400",
    annee: 2022,
    kilometrage: 8400,
    date_achat: "2022-09-10",
    carburant: null,
    immatriculation: "FR-400-PG",
    vin: null,
    surnom: null,
    photo_url: null,
    created_at: "2025-01-01",
    updated_at: "2025-01-01"
  }
];

export const demoMaintenanceEntries: MaintenanceEntry[] = [
  {
    id: "m1",
    user_id: "demo-user",
    vehicle_id: "v1",
    titre: "Vidange moteur",
    date_entretien: "2025-01-12",
    kilometrage: 16000,
    cout: 119,
    description: "Huile 10W40 + filtre à huile.",
    created_at: "2025-01-12"
  },
  {
    id: "m2",
    user_id: "demo-user",
    vehicle_id: "v1",
    titre: "Remplacement plaquettes avant",
    date_entretien: "2025-05-03",
    kilometrage: 17450,
    cout: 169,
    description: "Plaquettes route premium.",
    created_at: "2025-05-03"
  },
  {
    id: "m3",
    user_id: "demo-user",
    vehicle_id: "v1",
    titre: "Révision annuelle",
    date_entretien: "2025-09-18",
    kilometrage: 18200,
    cout: 259,
    description: "Contrôle complet et réglages.",
    created_at: "2025-09-18"
  }
];

export const demoUpcomingMaintenance: UpcomingMaintenance[] = [
  {
    id: "u1",
    user_id: "demo-user",
    vehicle_id: "v1",
    titre: "Vidange à prévoir",
    due_date: null,
    due_km: 24000,
    niveau_urgence: "normal",
    description: "Prévoir filtre et huile.",
    created_at: "2025-11-02"
  },
  {
    id: "u2",
    user_id: "demo-user",
    vehicle_id: "v1",
    titre: "Révision des freins",
    due_date: "2026-06-01",
    due_km: null,
    niveau_urgence: "normal",
    description: "Purge circuit et contrôle disques.",
    created_at: "2025-11-02"
  },
  {
    id: "u3",
    user_id: "demo-user",
    vehicle_id: "v1",
    titre: "Contrôle pneus",
    due_date: null,
    due_km: 20000,
    niveau_urgence: "urgent",
    description: "Usure proche du témoin sur le pneu arrière.",
    created_at: "2025-11-02"
  }
];

export const demoModifications: Modification[] = [
  {
    id: "mod1",
    user_id: "demo-user",
    vehicle_id: "v1",
    titre: "Support téléphone",
    marque: "Quad Lock",
    modele: "Pro",
    date_pose: "2024-08-22",
    cout: 79,
    facture_url: null,
    created_at: "2024-08-22"
  },
  {
    id: "mod2",
    user_id: "demo-user",
    vehicle_id: "v1",
    titre: "Échappement",
    marque: "Akrapovic",
    modele: "Slip-On",
    date_pose: "2025-02-11",
    cout: 690,
    facture_url: null,
    created_at: "2025-02-11"
  }
];

export const demoDocuments: DocumentItem[] = [
  {
    id: "doc1",
    user_id: "demo-user",
    vehicle_id: "v1",
    nom_fichier: "Facture_vidange_janvier_2025.pdf",
    type_fichier: "PDF",
    url: "#",
    taille: 235000,
    created_at: "2025-01-12"
  },
  {
    id: "doc2",
    user_id: "demo-user",
    vehicle_id: "v1",
    nom_fichier: "Carte_grise_mt07.jpg",
    type_fichier: "Image",
    url: "#",
    taille: 941000,
    created_at: "2024-04-16"
  }
];
