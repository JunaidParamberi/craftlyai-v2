/**
 * Row shape for `public.profiles` (see supabase/migrations/*_profiles.sql).
 */
export type ProfileRow = {
  id: string;
  full_name: string | null;
  company_name: string | null;
  vat_registered: boolean;
  vat_number: string | null;
  address_line1: string | null;
  address_line2: string | null;
  address_city: string | null;
  address_region: string | null;
  address_postal_code: string | null;
  address_country: string | null;
  brand_kit_id: string | null;
  onboarding_brand_skipped: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Row shape for `public.brand_kits` (see supabase/migrations/*_brand_kits.sql).
 */
export type BrandKitRow = {
  id: string;
  user_id: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  font: string;
  email_signature: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Row shape for `public.clients` (see supabase/migrations/*_clients.sql).
 */
export type ClientRow = {
  id: string;
  user_id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  currency: string | null;
  notes: string | null;
  health_score: number | null;
  created_at: string;
  updated_at: string;
};

/** Matches `projects_status_check` in `*_projects_tasks.sql`. */
export type ProjectStatus =
  | "planning"
  | "active"
  | "on_hold"
  | "completed"
  | "archived";

/**
 * Row shape for `public.projects` (see supabase/migrations/*_projects_tasks.sql).
 */
export type ProjectRow = {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  status: ProjectStatus;
  budget: number | null;
  spent: number | null;
  start_date: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
};

/** Project row with embedded CRM client (see `listProjects` / `getProjectById` select). */
export type ProjectListRow = ProjectRow & {
  client: { id: string; name: string } | null;
};

/** Matches `tasks_status_check` in `*_projects_tasks.sql`. */
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

/** Matches `tasks_priority_check` in `*_projects_tasks.sql`. */
export type TaskPriority = "low" | "medium" | "high";

/**
 * Row shape for `public.tasks` (see supabase/migrations/*_projects_tasks.sql).
 */
export type TaskRow = {
  id: string;
  project_id: string;
  title: string;
  status: TaskStatus;
  due_date: string | null;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
};
