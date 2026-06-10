export type UUID = string;

export type VehicleCategory = "voitures" | "motos" | "scooters" | "utilitaires";

export type Plan = "free" | "premium" | "family";
export type PlanStatus = "active" | "past_due" | "canceled" | "pending";
export type PlanInterval = "monthly" | "yearly";

export interface Profile {
  id: UUID;
  email: string;
  full_name: string | null;
  plan: Plan;
  plan_status: PlanStatus;
  plan_interval: PlanInterval | null;
  plan_renews_at: string | null;
  plan_canceled_at: string | null;
  mollie_customer_id: string | null;
  mollie_subscription_id: string | null;
  mollie_mandate_id: string | null;
  beta_expires_at: string | null;
  beta_feedback_submitted: boolean;
  created_at: string;
  updated_at: string;
}

export interface InviteCode {
  id: UUID;
  code: string;
  used_by: UUID | null;
  used_at: string | null;
  created_at: string;
}

export interface BetaFeedback {
  id: UUID;
  user_id: UUID;
  submitted_at: string;
  overall_rating: number;
  ease_of_use: number;
  most_useful_feature: string;
  improvements: string;
  would_recommend: boolean;
  would_pay: "yes_current" | "yes_cheaper" | "no";
  additional_comments: string | null;
}

export interface Vehicle {
  id: UUID;
  user_id: UUID;
  category: VehicleCategory;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  date_mise_en_circulation: string | null;
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
  maintenance_plan_entry_id: UUID | null;
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
  source: "manual" | "template";
  created_at: string;
}

export type MaintenancePriority = "normal" | "important" | "urgent";
export type MaintenanceStatus = "upcoming" | "due_soon" | "overdue" | "done";
export type MaintenanceSource = "manual" | "template";
export type MaintenanceTemplateSource = "hardcoded" | "ai" | "community" | "approved";

export interface MaintenancePlanEntry {
  id: UUID;
  user_id: UUID;
  vehicle_id: UUID;
  titre: string;
  categorie: string;
  description: string | null;
  interval_km: number | null;
  interval_months: number | null;
  first_due_km: number | null;
  first_due_date: string | null;
  last_done_km: number | null;
  last_done_date: string | null;
  next_due_km: number | null;
  next_due_date: string | null;
  due_soon_km_threshold: number;
  due_soon_days_threshold: number;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  source: MaintenanceSource;
  template_source: MaintenanceTemplateSource | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceTemplateCacheRow {
  id: UUID;
  category: VehicleCategory;
  marque_normalized: string;
  modele_normalized: string;
  annee: number | null;
  profile_name: string;
  templates: unknown;
  source: "ai" | "approved" | "community";
  llm_model: string | null;
  prompt_version: string;
  generated_at: string;
  validated_at: string | null;
  validated_by: UUID | null;
  created_at: string;
  updated_at: string;
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
      maintenance_plan_entries: {
        Row: MaintenancePlanEntry;
        Insert: Omit<MaintenancePlanEntry, "id" | "created_at" | "updated_at"> & {
          id?: UUID;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<MaintenancePlanEntry>;
        Relationships: [];
      };
      maintenance_template_cache: {
        Row: MaintenanceTemplateCacheRow;
        Insert: Omit<MaintenanceTemplateCacheRow, "id" | "created_at" | "updated_at" | "generated_at"> & {
          id?: UUID;
          created_at?: string;
          updated_at?: string;
          generated_at?: string;
        };
        Update: Partial<MaintenanceTemplateCacheRow>;
        Relationships: [];
      };
      invite_codes: {
        Row: InviteCode;
        Insert: Omit<InviteCode, "id" | "created_at"> & { id?: UUID; created_at?: string };
        Update: Partial<InviteCode>;
        Relationships: [];
      };
      beta_feedback: {
        Row: BetaFeedback;
        Insert: Omit<BetaFeedback, "id" | "submitted_at"> & { id?: UUID; submitted_at?: string };
        Update: Partial<BetaFeedback>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
