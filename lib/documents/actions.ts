/**
 * Document data access. Prefer importing mutations from `./document-mutations`
 * inside Client Components so the client bundle does not pull query modules.
 */
export type {
  ListDocumentsResult,
  ListTemplatesResult,
} from "./document-queries";
export {
  getDocumentById,
  getTemplateById,
  listDocumentTemplates,
  listDocuments,
} from "./document-queries";

export type {
  CreateDocumentResult,
  DeleteDocumentResult,
  DeleteTemplateResult,
  SaveAsTemplateResult,
  UpdateDocumentResult,
} from "./document-mutations";
export {
  createDocument,
  deleteDocument,
  deleteTemplate,
  saveAsTemplate,
  updateDocument,
} from "./document-mutations";
