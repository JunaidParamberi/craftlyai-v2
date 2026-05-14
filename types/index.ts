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
  default_currency: string;
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

/**
 * Row shape for `public.time_entries` (see supabase/migrations/*_time_entries.sql).
 */
export type TimeEntryRow = {
  id: string;
  user_id: string;
  project_id: string;
  task_id: string | null;
  description: string | null;
  started_at: string;
  ended_at: string | null;
  paused_at: string | null;
  total_paused_seconds: number;
  duration_seconds: number | null;
  billed: boolean;
  created_at: string;
  updated_at: string;
};

/** Time entry with joined project/task titles from list queries. */
export type TimeEntryListRow = TimeEntryRow & {
  project: { id: string; title: string } | null;
  task: { id: string; title: string } | null;
};

/** Matches `document_type` enum in `*_documents.sql`. */
export type DocumentType = "proposal" | "quote" | "invoice" | "other";

/** Matches `document_status` enum in `*_documents.sql`. */
export type DocumentStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "signed"
  | "paid"
  | "archived"
  | "approved"
  | "declined";

/**
 * Tiptap JSON document shape. Loosely typed; full validation happens inside
 * the editor. Stored verbatim in `documents.content_json` / `document_templates.content_json`.
 */
export type TiptapDoc = {
  type: string;
  content?: TiptapNode[];
  [key: string]: unknown;
};

export type TiptapNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  [key: string]: unknown;
};

/**
 * Row shape for `public.documents` (see supabase/migrations/*_documents.sql).
 */
export type DocumentRow = {
  id: string;
  user_id: string;
  client_id: string | null;
  project_id: string | null;
  type: DocumentType;
  status: DocumentStatus;
  title: string;
  content_json: TiptapDoc;
  pdf_url: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  invoice_number: string | null;
  due_date: string | null;
  payment_terms: string | null;
  notes_footer: string | null;
  paid_at: string | null;
  pay_token: string | null;
  discount_value: number;
  discount_type: 'percent' | 'flat';
  quote_number: string | null;
  valid_until: string | null;
  approval_token: string | null;
  approved_at: string | null;
  declined_at: string | null;
  approval_message: string | null;
  created_at: string;
  updated_at: string;
};

/** Document row with joined client/project labels from list queries. */
export type DocumentListRow = DocumentRow & {
  client: { id: string; name: string } | null;
  project: { id: string; title: string } | null;
};

/**
 * Row shape for `public.line_items` (see supabase/migrations/*_invoice_line_items.sql).
 */
export type LineItemRow = {
  id: string;
  document_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** DocumentRow extended with invoice-specific fields and embedded line items. */
export type InvoiceDocumentRow = DocumentRow & {
  invoice_number: string | null;
  due_date: string | null;
  payment_terms: string | null;
  notes_footer: string | null;
  paid_at: string | null;
  pay_token: string | null;
  line_items: LineItemRow[];
};

/** DocumentRow extended with embedded line items for quotes. */
export type QuoteDocumentRow = DocumentRow & {
  line_items: LineItemRow[];
};

/**
 * Row shape for `public.document_templates` (see supabase/migrations/*_document_templates.sql).
 * `user_id` is null for system templates (is_system = true).
 */
export type DocumentTemplateRow = {
  id: string;
  user_id: string | null;
  type: DocumentType;
  name: string;
  description: string | null;
  content_json: TiptapDoc;
  is_system: boolean;
  created_at: string;
  updated_at: string;
};
