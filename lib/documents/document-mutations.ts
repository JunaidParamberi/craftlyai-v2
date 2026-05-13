"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  normalizeDocumentRow,
  normalizeTemplateRow,
} from "@/lib/documents/normalize-document-row";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import {
  parseDocumentInput,
  parseTemplateInput,
} from "@/lib/validations/document";
import type { DocumentRow, DocumentTemplateRow } from "@/types";

const uuidSchema = z.string().uuid();

type FieldErrors = Record<string, string[] | undefined>;

export type CreateDocumentResult =
  | { ok: true; document: DocumentRow }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

export async function createDocument(
  input: unknown,
): Promise<CreateDocumentResult> {
  const parsed = parseDocumentInput(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as FieldErrors,
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

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      type: parsed.data.type,
      status: parsed.data.status,
      client_id: parsed.data.client_id,
      project_id: parsed.data.project_id,
      content_json: parsed.data.content_json,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }
  if (!data) {
    return { ok: false, message: "Document could not be created." };
  }

  revalidatePath("/documents");

  return { ok: true, document: normalizeDocumentRow(data) };
}

export type UpdateDocumentResult =
  | { ok: true; document: DocumentRow }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

export async function updateDocument(
  id: string,
  input: unknown,
): Promise<UpdateDocumentResult> {
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, message: "Invalid document." };
  }

  const parsed = parseDocumentInput(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as FieldErrors,
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

  const { data, error } = await supabase
    .from("documents")
    .update({
      title: parsed.data.title,
      type: parsed.data.type,
      status: parsed.data.status,
      client_id: parsed.data.client_id,
      project_id: parsed.data.project_id,
      content_json: parsed.data.content_json,
    })
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }
  if (!data) {
    return { ok: false, message: "Document not found or could not be updated." };
  }

  revalidatePath("/documents");
  revalidatePath(`/documents/${parsedId.data}`);
  revalidatePath(`/documents/${parsedId.data}/edit`);

  return { ok: true, document: normalizeDocumentRow(data) };
}

export type DeleteDocumentResult =
  | { ok: true }
  | { ok: false; message: string };

export async function deleteDocument(
  id: string,
): Promise<DeleteDocumentResult> {
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, message: "Invalid document." };
  }

  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const { error, count } = await supabase
    .from("documents")
    .delete({ count: "exact" })
    .eq("id", parsedId.data)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }
  if (count === 0) {
    return { ok: false, message: "Document not found." };
  }

  revalidatePath("/documents");

  return { ok: true };
}

export type SaveAsTemplateResult =
  | { ok: true; template: DocumentTemplateRow }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

export async function saveAsTemplate(
  input: unknown,
): Promise<SaveAsTemplateResult> {
  const parsed = parseTemplateInput(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as FieldErrors,
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

  const { data, error } = await supabase
    .from("document_templates")
    .insert({
      user_id: user.id,
      type: parsed.data.type,
      name: parsed.data.name,
      description: parsed.data.description,
      content_json: parsed.data.content_json,
      is_system: false,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }
  if (!data) {
    return { ok: false, message: "Template could not be saved." };
  }

  revalidatePath("/documents/new");

  return { ok: true, template: normalizeTemplateRow(data) };
}

export type DeleteTemplateResult =
  | { ok: true }
  | { ok: false; message: string };

export async function deleteTemplate(
  id: string,
): Promise<DeleteTemplateResult> {
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, message: "Invalid template." };
  }

  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const { error, count } = await supabase
    .from("document_templates")
    .delete({ count: "exact" })
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .eq("is_system", false);

  if (error) {
    return { ok: false, message: error.message };
  }
  if (count === 0) {
    return { ok: false, message: "Template not found." };
  }

  revalidatePath("/documents/new");

  return { ok: true };
}
