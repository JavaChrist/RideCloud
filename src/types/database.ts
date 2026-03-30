export type UUID = string;

export type VehicleCategory = "voitures" | "motos" | "scooters" | "utilitaires";

export interface Profile {
  id: UUID;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: UUID;
  user_id: UUID;
  category: VehicleCategory;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  date_achat: string | null;
  carburant: string | null;
  immatriculation: string | null;
  vin: string | null;
  surnom: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceEntry {
  id: UUID;
  user_id: UUID;
  vehicle_id: UUID;
  titre: string;
  date_entretien: string;
  kilometrage: number;
  cout: number | null;
  description: string | null;
  created_at: string;
}

export interface UpcomingMaintenance {
  id: UUID;
  user_id: UUID;
  vehicle_id: UUID;
  titre: string;
  due_date: string | null;
  due_km: number | null;
  niveau_urgence: "normal" | "urgent";
  description: string | null;
  created_at: string;
}

export interface Modification {
  id: UUID;
  user_id: UUID;
  vehicle_id: UUID;
  titre: string;
  marque: string | null;
  modele: string | null;
  date_pose: string | null;
  cout: number | null;
  facture_url: string | null;
  created_at: string;
}

export interface DocumentItem {
  id: UUID;
  user_id: UUID;
  vehicle_id: UUID;
  nom_fichier: string;
  type_fichier: string;
  url: string;
  taille: number | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
        Relationships: [];
      };
      vehicles: {
        Row: Vehicle;
        Insert: Omit<Vehicle, "id" | "created_at" | "updated_at"> & {
          id?: UUID;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Vehicle>;
        Relationships: [];
      };
      maintenance_entries: {
        Row: MaintenanceEntry;
        Insert: Omit<MaintenanceEntry, "id" | "created_at"> & {
          id?: UUID;
          created_at?: string;
        };
        Update: Partial<MaintenanceEntry>;
        Relationships: [];
      };
      upcoming_maintenance: {
        Row: UpcomingMaintenance;
        Insert: Omit<UpcomingMaintenance, "id" | "created_at"> & {
          id?: UUID;
          created_at?: string;
        };
        Update: Partial<UpcomingMaintenance>;
        Relationships: [];
      };
      modifications: {
        Row: Modification;
        Insert: Omit<Modification, "id" | "created_at"> & {
          id?: UUID;
          created_at?: string;
        };
        Update: Partial<Modification>;
        Relationships: [];
      };
      documents: {
        Row: DocumentItem;
        Insert: Omit<DocumentItem, "id" | "created_at"> & {
          id?: UUID;
          created_at?: string;
        };
        Update: Partial<DocumentItem>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
