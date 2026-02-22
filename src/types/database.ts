// =============================================================
// bee-doo Portal – TypeScript Types
// =============================================================

export type ProjectStatus =
  | 'consultation'
  | 'contract'
  | 'grid_application'
  | 'installation'
  | 'commissioning'
  | 'feed_in'
  | 'completed';

export type MilestoneStatus = 'pending' | 'active' | 'done';

export type DocumentCategory =
  | 'offer'
  | 'contract'
  | 'grid_application'
  | 'installation_protocol'
  | 'commissioning_protocol'
  | 'feed_in_confirmation'
  | 'warranty'
  | 'other';

export type NotificationType = 'info' | 'success' | 'warning' | 'action';

// ─── Database row types ────────────────────────────────────────

export interface Customer {
  id: string;
  user_id: string | null;
  customer_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  street: string | null;
  zip: string | null;
  city: string | null;
  referral_code: string;
  referred_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  customer_id: string;
  project_number: string;
  status: ProjectStatus;
  capacity_kwp: number | null;
  storage_kwh: number | null;
  module_count: number | null;
  module_model: string | null;
  inverter_model: string | null;
  orientation: string | null;
  annual_yield_kwh: number | null;
  total_price_gross: number | null;
  deposit_paid: number | null;
  consultation_date: string | null;
  contract_date: string | null;
  installation_date: string | null;
  commissioning_date: string | null;
  enpal_system_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  key: string;
  title: string;
  status: MilestoneStatus;
  planned_date: string | null;
  done_date: string | null;
  note: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  category: DocumentCategory;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  uploaded_at: string;
  // computed
  download_url?: string;
}

export interface MonitoringMonthly {
  id: string;
  project_id: string;
  month: string;           // ISO date string, first of month
  production_kwh: number;
  feed_in_kwh: number;
  self_use_kwh: number;
  co2_saved_kg: number;   // computed column
  revenue_eur: number | null;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_email: string;
  referred_customer: string | null;
  status: 'pending' | 'converted' | 'bonus_paid';
  bonus_amount: number;
  converted_at: string | null;
  bonus_paid_at: string | null;
  created_at: string;
}

export interface NpsResponse {
  id: string;
  customer_id: string;
  score: number;
  comment: string | null;
  trigger: string;
  created_at: string;
}

export interface Notification {
  id: string;
  customer_id: string;
  title: string;
  body: string | null;
  type: NotificationType;
  read_at: string | null;
  action_url: string | null;
  created_at: string;
}

// ─── View type (v_customer_portal) ────────────────────────────

export interface CustomerPortalView {
  customer_id: string;
  user_id: string | null;
  customer_number: string;
  first_name: string;
  last_name: string;
  email: string;
  referral_code: string;
  project_id: string | null;
  project_number: string | null;
  project_status: ProjectStatus | null;
  capacity_kwp: number | null;
  storage_kwh: number | null;
  module_count: number | null;
  module_model: string | null;
  inverter_model: string | null;
  orientation: string | null;
  annual_yield_kwh: number | null;
  installation_date: string | null;
  commissioning_date: string | null;
  total_kwh: number;
  total_co2_kg: number;
  total_revenue_eur: number;
  referral_count: number;
  referral_bonus_total: number;
}

// ─── Supabase Database type map ────────────────────────────────

export interface Database {
  public: {
    Tables: {
      customers:          { Row: Customer };
      projects:           { Row: Project };
      milestones:         { Row: Milestone };
      documents:          { Row: Document };
      monitoring_monthly: { Row: MonitoringMonthly };
      monitoring_daily:   { Row: { id: string; project_id: string; day: string; production_kwh: number; feed_in_kwh: number | null; self_use_kwh: number | null; created_at: string } };
      referrals:          { Row: Referral };
      nps_responses:      { Row: NpsResponse };
      notifications:      { Row: Notification };
    };
    Views: {
      v_customer_portal: { Row: CustomerPortalView };
    };
    Functions: {
      my_customer_id: { Returns: string };
      my_project_id:  { Returns: string };
      seed_milestones: { Args: { p_project_id: string }; Returns: void };
    };
  };
}
