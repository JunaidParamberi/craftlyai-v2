import { z } from "zod";

import {
  normalizeDocumentListRow,
  normalizeDocumentRow,
  normalizeTemplateRow,
} from "@/lib/documents/normalize-document-row";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type {
  DocumentListRow,
  DocumentRow,
  DocumentTemplateRow,
} from "@/types";

const uuidSchema = z.string().uuid();

export type ListDocumentsResult =
  | { ok: true; documents: DocumentListRow[] }
  | { ok: false; message: string };

export async function listDocuments(): Promise<ListDocumentsResult> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("documents")
    .select(
      "*, clients:client_id(id, name), projects:project_id(id, title)",
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return { ok: false, message: error.message };
  }

  return {
    ok: true,
    documents: (data ?? []).map((row) => normalizeDocumentListRow(row)),
  };
}

export async function getDocumentById(
  id: string,
): Promise<DocumentRow | null> {
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
    .from("documents")
    .select("*")
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeDocumentRow(data);
}

export type ListTemplatesResult =
  | { ok: true; templates: DocumentTemplateRow[] }
  | { ok: false; message: string };

export async function listDocumentTemplates(): Promise<ListTemplatesResult> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("document_templates")
    .select("*")
    .order("is_system", { ascending: false })
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return { ok: false, message: error.message };
  }

  return {
    ok: true,
    templates: (data ?? []).map((row) => normalizeTemplateRow(row)),
  };
}

export async function getTemplateById(
  id: string,
): Promise<DocumentTemplateRow | null> {
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
    .from("document_templates")
    .select("*")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeTemplateRow(data);
}
