"use server";

import { getServerContext } from "@/lib/supabase/get-server-context";
import { mergeAndValidateProfile } from "@/lib/validations/profile";
import type { ProfileRow } from "@/types";

function normalizeProfileRow(row: {
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
  default_currency?: string | null;
  brand_kit_id?: string | null;
  onboarding_brand_skipped?: boolean;
  onboarding_completed_at?: string | null;
  plan_tier?: string | null;
  created_at: string;
  updated_at: string;
}): ProfileRow {
  return {
    ...row,
    brand_kit_id: row.brand_kit_id ?? null,
    onboarding_brand_skipped: row.onboarding_brand_skipped ?? false,
    onboarding_completed_at: row.onboarding_completed_at ?? null,
    address_country: row.address_country ? row.address_country.trim().toUpperCase() : null,
    default_currency: row.default_currency ?? "USD",
    plan_tier: (row.plan_tier ?? "free") as "free" | "starter" | "pro" | "agency",
  };
}

export type GetProfileResult =
  | { ok: true; profile: ProfileRow }
  | { ok: true; profile: null; reason: "no_session" | "no_row" }
  | { ok: false; message: string };

/**
 * Loads the authenticated user's profile row (server components & server actions).
 */
export async function getProfile(): Promise<GetProfileResult> {
  const { supabase, user } = await getServerContext();
  if (!user) {
    return { ok: true, profile: null, reason: "no_session" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: true, profile: null, reason: "no_row" };
  }

  return { ok: true, profile: normalizeProfileRow(data) };
}

export type UpdateProfileResult =
  | { ok: true; profile: ProfileRow }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
      formErrors?: string[];
    };

/**
 * Validates and upserts profile fields for the current user.
 */
export async function updateProfile(patchInput: unknown): Promise<UpdateProfileResult> {
  const { supabase, user } = await getServerContext();
  if (!user) {
    return { ok: false, message: "Not authenticated." };
  }

  const existingResult = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existingResult.error) {
    return { ok: false, message: existingResult.error.message };
  }

  const merged = mergeAndValidateProfile(
    existingResult.data ? normalizeProfileRow(existingResult.data) : null,
    patchInput,
  );

  if (!merged.success) {
    const flattened = merged.error.flatten();
    return {
      ok: false,
      message: "Validation failed.",
      fieldErrors: flattened.fieldErrors,
      formErrors: flattened.formErrors,
    };
  }

  const payload = {
    full_name: merged.data.full_name,
    company_name: merged.data.company_name,
    vat_registered: merged.data.vat_registered,
    vat_number: merged.data.vat_number,
    address_line1: merged.data.address_line1,
    address_line2: merged.data.address_line2,
    address_city: merged.data.address_city,
    address_region: merged.data.address_region,
    address_postal_code: merged.data.address_postal_code,
    address_country: merged.data.address_country,
    default_currency: merged.data.default_currency,
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...payload }, { onConflict: "id" })
    .select("*")
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: "Profile could not be saved." };
  }

  return { ok: true, profile: normalizeProfileRow(data) };
}
