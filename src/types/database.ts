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
  founder_premium_lifetime: boolean;
  founder_badge: boolean;
  created_at: string;
  updated_at: string;
}

export type FounderStatusRow = "pending" | "completed" | "expired";

export interface FounderMember {
  user_id: UUID;
  slot: number;
  joined_at: string;
  status: FounderStatusRow;
  completed_at: string | null;
  premium_lifetime: boolean;
  badge: boolean;
}

export interface FounderQuestionnaireResponse {
  id: UUID;
  user_id: UUID;
  slot: number;
  usage: string;
  nps: number;
  frustration: string;
  top_feature: string;
  pricing: string;
  submitted_at: string;
}

export type NotificationKind = "odometer_refresh" | "maintenance_due";

export interface PushSubscriptionRow {
  id: UUID;
  user_id: UUID;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
  last_seen_at: string;
  last_error_at: string | null;
  last_error_reason: string | null;
}

export interface NotificationLogRow {
  id: UUID;
  user_id: UUID;
  vehicle_id: UUID;
  kind: NotificationKind;
  subject_id: UUID | null;
  sent_at: string;
  payload: Record<string, unknown> | null;
}

/** Types métier connus. La colonne DB `notifications.type` reste un text libre. */
export type AppNotificationType = NotificationKind;

export interface NotificationRow {
  id: UUID;
  user_id: UUID;
  vehicle_id: UUID | null;
  type: string;
  title: string;
  body: string;
  href: string | null;
  dedupe_key: string;
  metadata: Record<string, unknown>;
  created_at: string;
  read_at: string | null;
  last_pushed_at: string | null;
}

export interface NotificationDismissalRow {
  user_id: UUID;
  dedupe_key: string;
  dismissed_at: string;
}

/** Profil d'usage déclaré : drive l'estimation du km courant entre deux saisies. */
export type UsageProfile = "daily" | "often" | "occasional" | "rare";

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
  /** Profil d'usage (Tous les jours / Souvent / De temps en temps / Rarement). */
  usage_profile: UsageProfile;
  /** Moyenne km/an dérivée du couple (usage_profile, category). */
  avg_km_per_year: number;
  /** Dernier compteur réel saisi — point de recalage de l'estimation. */
  last_odometer_value: number;
  /** Date du dernier recalage du compteur (ISO YYYY-MM-DD). */
  last_odometer_date: string;
  /** Dernière fois où l'app a invité l'utilisateur à mettre à jour son compteur. */
  last_estimation_reminder_at: string | null;
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
      founder_members: {
        Row: FounderMember;
        Insert: Omit<FounderMember, "joined_at"> & { joined_at?: string };
        Update: Partial<FounderMember>;
        Relationships: [];
      };
      founder_questionnaire_responses: {
        Row: FounderQuestionnaireResponse;
        Insert: Omit<FounderQuestionnaireResponse, "id" | "submitted_at"> & {
          id?: UUID;
          submitted_at?: string;
        };
        Update: Partial<FounderQuestionnaireResponse>;
        Relationships: [];
      };
      push_subscriptions: {
        Row: PushSubscriptionRow;
        Insert: Omit<PushSubscriptionRow, "id" | "created_at" | "last_seen_at"> & {
          id?: UUID;
          created_at?: string;
          last_seen_at?: string;
        };
        Update: Partial<PushSubscriptionRow>;
        Relationships: [];
      };
      notification_log: {
        Row: NotificationLogRow;
        Insert: Omit<NotificationLogRow, "id" | "sent_at"> & {
          id?: UUID;
          sent_at?: string;
        };
        Update: Partial<NotificationLogRow>;
        Relationships: [];
      };
      notification_dismissals: {
        Row: NotificationDismissalRow;
        Insert: Omit<NotificationDismissalRow, "dismissed_at"> & { dismissed_at?: string };
        Update: Partial<NotificationDismissalRow>;
        Relationships: [];
      };
      notifications: {
        Row: NotificationRow;
        Insert: Omit<
          NotificationRow,
          "id" | "created_at" | "metadata" | "read_at" | "last_pushed_at" | "vehicle_id" | "href"
        > & {
          id?: UUID;
          created_at?: string;
          metadata?: Record<string, unknown>;
          read_at?: string | null;
          last_pushed_at?: string | null;
          vehicle_id?: UUID | null;
          href?: string | null;
        };
        Update: Partial<NotificationRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      mark_notification_read: {
        Args: { notification_id: string };
        Returns: unknown;
      };
      mark_all_notifications_read: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      claim_founder_slot: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      submit_founder_questionnaire: {
        Args: {
          p_usage: string;
          p_nps: number;
          p_frustration: string;
          p_top_feature: string;
          p_pricing: string;
        };
        Returns: unknown;
      };
      founder_program_config: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      founder_slots_taken: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
