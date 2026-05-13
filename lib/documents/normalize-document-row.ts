import type {
  DocumentListRow,
  DocumentRow,
  DocumentStatus,
  DocumentTemplateRow,
  DocumentType,
  TiptapDoc,
} from "@/types";

type DocumentRowRaw = {
  id: string;
  user_id: string;
  client_id: string | null;
  project_id: string | null;
  type: string;
  status: string;
  title: string;
  content_json: unknown;
  created_at: string;
  updated_at: string;
};

function coerceContent(raw: unknown): TiptapDoc {
  if (raw && typeof raw === "object" && (raw as { type?: unknown }).type === "doc") {
    return raw as TiptapDoc;
  }
  return { type: "doc", content: [{ type: "paragraph" }] };
}

export function normalizeDocumentRow(row: DocumentRowRaw): DocumentRow {
  return {
    id: row.id,
    user_id: row.user_id,
    client_id: row.client_id,
    project_id: row.project_id,
    type: row.type as DocumentType,
    status: row.status as DocumentStatus,
    title: row.title,
    content_json: coerceContent(row.content_json),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function pickEmbed<TKey extends string>(
  raw: unknown,
  labelKey: TKey,
): { id: string; [k: string]: string } | null {
  if (raw == null) {
    return null;
  }
  const node = Array.isArray(raw) ? raw[0] : raw;
  if (
    node &&
    typeof node === "object" &&
    "id" in node &&
    labelKey in node
  ) {
    return {
      id: String((node as Record<string, unknown>).id),
      [labelKey]: String((node as Record<string, unknown>)[labelKey]),
    } as { id: string; [k: string]: string };
  }
  return null;
}

export function normalizeDocumentListRow(
  row: DocumentRowRaw & { clients?: unknown; projects?: unknown },
): DocumentListRow {
  const base = normalizeDocumentRow(row);
  const clientEmbed = pickEmbed(row.clients, "name");
  const projectEmbed = pickEmbed(row.projects, "title");
  return {
    ...base,
    client: clientEmbed
      ? { id: clientEmbed.id, name: clientEmbed.name }
      : null,
    project: projectEmbed
      ? { id: projectEmbed.id, title: projectEmbed.title }
      : null,
  };
}

type TemplateRowRaw = {
  id: string;
  user_id: string | null;
  type: string;
  name: string;
  description: string | null;
  content_json: unknown;
  is_system: boolean;
  created_at: string;
  updated_at: string;
};

export function normalizeTemplateRow(
  row: TemplateRowRaw,
): DocumentTemplateRow {
  return {
    id: row.id,
    user_id: row.user_id,
    type: row.type as DocumentType,
    name: row.name,
    description: row.description,
    content_json: coerceContent(row.content_json),
    is_system: row.is_system,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
