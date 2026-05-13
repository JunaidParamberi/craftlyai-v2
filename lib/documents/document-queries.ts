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

  let documents = (data ?? []).map((row) => normalizeDocumentListRow(row));

  const missingClientIds = [
    ...new Set(
      documents
        .filter((d) => !d.client && d.client_id)
        .map((d) => d.client_id as string),
    ),
  ];
  const missingProjectIds = [
    ...new Set(
      documents
        .filter((d) => !d.project && d.project_id)
        .map((d) => d.project_id as string),
    ),
  ];

  if (missingClientIds.length > 0 || missingProjectIds.length > 0) {
    const [clientsRes, projectsRes] = await Promise.all([
      missingClientIds.length > 0
        ? supabase
            .from("clients")
            .select("id, name")
            .eq("user_id", user.id)
            .in("id", missingClientIds)
        : Promise.resolve({ data: [], error: null }),
      missingProjectIds.length > 0
        ? supabase
            .from("projects")
            .select("id, title")
            .eq("user_id", user.id)
            .in("id", missingProjectIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const clientsById = new Map(
      (clientsRes.data ?? []).map((c) => [c.id, c]),
    );
    const projectsById = new Map(
      (projectsRes.data ?? []).map((p) => [p.id, p]),
    );

    documents = documents.map((doc) => {
      let next = doc;
      if (!next.client && doc.client_id) {
        const client = clientsById.get(doc.client_id);
        if (client) {
          next = { ...next, client: { id: client.id, name: client.name } };
        }
      }
      if (!next.project && doc.project_id) {
        const project = projectsById.get(doc.project_id);
        if (project) {
          next = {
            ...next,
            project: { id: project.id, title: project.title },
          };
        }
      }
      return next;
    });
  }

  return {
    ok: true,
    documents,
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
