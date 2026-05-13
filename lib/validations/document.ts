import { z } from "zod";

import type {
  DocumentStatus,
  DocumentType,
  TiptapDoc,
} from "@/types";

/** Align with DB constraints (migration `*_documents.sql`). */
export const DOCUMENT_LIMITS = {
  title: 300,
  template_name: 200,
  template_description: 500,
} as const;

export const DOCUMENT_TYPES = [
  "proposal",
  "quote",
  "invoice",
  "other",
] as const satisfies readonly DocumentType[];

export const DOCUMENT_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "signed",
  "paid",
  "archived",
] as const satisfies readonly DocumentStatus[];

export const documentTypeSchema = z.enum(DOCUMENT_TYPES);
export const documentStatusSchema = z.enum(DOCUMENT_STATUSES);

const uuidOrEmpty = z
  .string()
  .trim()
  .refine((v) => v === "" || /^[0-9a-f-]{36}$/i.test(v), {
    message: "Invalid id.",
  });

/**
 * Tiptap content schema. We accept any object whose root `type` is "doc" and
 * whose `content` (if present) is an array. Full validation lives in the
 * editor; we just block obviously bad payloads from hitting the DB.
 */
export const tiptapDocSchema: z.ZodType<TiptapDoc> = z
  .object({
    type: z.string().min(1),
  })
  .catchall(z.unknown())
  .refine(
    (doc) => doc.type === "doc",
    { message: "Tiptap document root must be of type 'doc'." },
  )
  .refine(
    (doc) => {
      const content = (doc as { content?: unknown }).content;
      return content === undefined || Array.isArray(content);
    },
    { message: "Tiptap content must be an array." },
  ) as unknown as z.ZodType<TiptapDoc>;

export const documentInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(DOCUMENT_LIMITS.title, `Title must be ${DOCUMENT_LIMITS.title} characters or fewer.`),
  type: documentTypeSchema,
  status: documentStatusSchema.optional(),
  client_id: uuidOrEmpty.optional(),
  project_id: uuidOrEmpty.optional(),
  content_json: tiptapDocSchema,
});

export type DocumentInputForm = z.input<typeof documentInputSchema>;

export type DocumentInputPayload = {
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  client_id: string | null;
  project_id: string | null;
  content_json: TiptapDoc;
};

const EMPTY_DOC: TiptapDoc = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function emptyTiptapDoc(): TiptapDoc {
  // Deep copy so callers can mutate freely.
  return JSON.parse(JSON.stringify(EMPTY_DOC)) as TiptapDoc;
}

export function parseDocumentInput(
  raw: unknown,
):
  | { success: true; data: DocumentInputPayload }
  | { success: false; error: z.ZodError } {
  const parsed = documentInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const d = parsed.data;
  const clientId =
    d.client_id && d.client_id.trim() !== "" ? d.client_id.trim() : null;
  const projectId =
    d.project_id && d.project_id.trim() !== "" ? d.project_id.trim() : null;

  return {
    success: true,
    data: {
      title: d.title.trim(),
      type: d.type,
      status: d.status ?? "draft",
      client_id: clientId,
      project_id: projectId,
      content_json: d.content_json,
    },
  };
}

/** Subset accepted when a user saves a document as a new template. */
export const templateInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Template name is required.")
    .max(
      DOCUMENT_LIMITS.template_name,
      `Name must be ${DOCUMENT_LIMITS.template_name} characters or fewer.`,
    ),
  description: z
    .string()
    .trim()
    .max(
      DOCUMENT_LIMITS.template_description,
      `Description must be ${DOCUMENT_LIMITS.template_description} characters or fewer.`,
    )
    .optional(),
  type: documentTypeSchema,
  content_json: tiptapDocSchema,
});

export type TemplateInputForm = z.input<typeof templateInputSchema>;

export type TemplateInputPayload = {
  name: string;
  description: string | null;
  type: DocumentType;
  content_json: TiptapDoc;
};

export function parseTemplateInput(
  raw: unknown,
):
  | { success: true; data: TemplateInputPayload }
  | { success: false; error: z.ZodError } {
  const parsed = templateInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const d = parsed.data;
  const description =
    d.description && d.description.trim() !== "" ? d.description.trim() : null;

  return {
    success: true,
    data: {
      name: d.name.trim(),
      description,
      type: d.type,
      content_json: d.content_json,
    },
  };
}
