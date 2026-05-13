import { cache } from "react";
import { z } from "zod";

import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { ClientRow } from "@/types";

import { normalizeClientRow } from "@/lib/clients/normalize-client-row";

const uuidSchema = z.string().uuid();

export type ListClientsResult =
  | { ok: true; clients: ClientRow[] }
  | { ok: false; message: string };

export const getClientById = cache(async (id: string): Promise<ClientRow | null> => {
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return null;
  }

  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeClientRow(data);
});

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
