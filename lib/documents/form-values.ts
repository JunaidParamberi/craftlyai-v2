import { emptyTiptapDoc } from "@/lib/validations/document";
import type { DocumentInputForm } from "@/lib/validations/document";
import type { DocumentRow, DocumentTemplateRow } from "@/types";

export function defaultDocumentFormValues(args?: {
  type?: DocumentInputForm["type"];
  template?: DocumentTemplateRow | null;
  client_id?: string | null;
  project_id?: string | null;
}): DocumentInputForm {
  const template = args?.template ?? null;
  return {
    title: template ? template.name : "",
    type: args?.type ?? template?.type ?? "other",
    status: "draft",
    client_id: args?.client_id ?? "",
    project_id: args?.project_id ?? "",
    content_json: template?.content_json ?? emptyTiptapDoc(),
  };
}

export function documentToFormValues(
  document: DocumentRow,
): DocumentInputForm {
  return {
    title: document.title,
    type: document.type,
    status: document.status,
    client_id: document.client_id ?? "",
    project_id: document.project_id ?? "",
    content_json: document.content_json,
  };
}
