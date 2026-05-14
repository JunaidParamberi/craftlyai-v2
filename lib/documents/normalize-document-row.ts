import { pickEmbed } from "@/lib/supabase/pick-embed";
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
  pdf_url?: string | null;
  sent_at?: string | null;
  viewed_at?: string | null;
  signed_at?: string | null;
  invoice_number?: string | null;
  due_date?: string | null;
  payment_terms?: string | null;
  notes_footer?: string | null;
  paid_at?: string | null;
  pay_token?: string | null;
  discount_value?: number;
  discount_type?: string;
  quote_number?: string | null;
  valid_until?: string | null;
  approval_token?: string | null;
  approved_at?: string | null;
  declined_at?: string | null;
  approval_message?: string | null;
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
    pdf_url: row.pdf_url ?? null,
    sent_at: row.sent_at ?? null,
    viewed_at: row.viewed_at ?? null,
    signed_at: row.signed_at ?? null,
    invoice_number: row.invoice_number ?? null,
    due_date: row.due_date ?? null,
    payment_terms: row.payment_terms ?? null,
    notes_footer: row.notes_footer ?? null,
    paid_at: row.paid_at ?? null,
    pay_token: row.pay_token ?? null,
    discount_value: row.discount_value ?? 0,
    discount_type: (row.discount_type ?? 'percent') as 'percent' | 'flat',
    quote_number: row.quote_number ?? null,
    valid_until: row.valid_until ?? null,
    approval_token: row.approval_token ?? null,
    approved_at: row.approved_at ?? null,
    declined_at: row.declined_at ?? null,
    approval_message: row.approval_message ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
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
