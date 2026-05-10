"use server";

import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { parseClientCreateInput } from "@/lib/validations/client";
import type { ClientRow } from "@/types";

function normalizeClientRow(row: {
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
}): ClientRow {
  return {
    ...row,
    currency: row.currency?.trim().toUpperCase() ?? null,
  };
}

export type ListClientsResult =
  | { ok: true; clients: ClientRow[] }
  | { ok: false; message: string };

export async function listClients(): Promise<ListClientsResult> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, message: error.message };
  }

  return {
    ok: true,
    clients: (data ?? []).map((row) => normalizeClientRow(row)),
  };
}

export type CreateClientResult =
  | { ok: true; client: ClientRow }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function createClient(input: unknown): Promise<CreateClientResult> {
  const parsed = parseClientCreateInput(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      message: "Validation failed.",
      fieldErrors: flat.fieldErrors as Record<string, string[] | undefined>,
    };
  }

  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const payload = {
    user_id: user.id,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    company: parsed.data.company,
    address: parsed.data.address,
    currency: parsed.data.currency,
    notes: parsed.data.notes,
  };

  const { data, error } = await supabase
    .from("clients")
    .insert(payload)
    .select("*")
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: "Client could not be created." };
  }

  return { ok: true, client: normalizeClientRow(data) };
}
