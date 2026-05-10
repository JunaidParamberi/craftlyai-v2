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
