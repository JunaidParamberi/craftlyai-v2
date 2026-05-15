import { formatCurrency } from "@/lib/utils/format";
import type { DocumentType, NotificationType } from "@/types";

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  invoice: "Invoice",
  quote: "Quote",
  proposal: "Proposal",
  other: "Document",
};

export type DocumentNotificationSource = {
  id: string;
  type: DocumentType;
  title: string;
  invoice_number: string | null;
  quote_number: string | null;
  proposal_number: string | null;
  clientName: string | null;
  amount?: number | null;
};

function docNumber(doc: DocumentNotificationSource): string {
  if (doc.type === "invoice" && doc.invoice_number) return doc.invoice_number;
  if (doc.type === "quote" && doc.quote_number) return doc.quote_number;
  if (doc.type === "proposal" && doc.proposal_number) return doc.proposal_number;
  return doc.title;
}

export function buildDocumentNotificationPayload(
  type: NotificationType,
  doc: DocumentNotificationSource
): { href: string; label: string; entity_id: string } {
  const client = doc.clientName ?? "client";
  const number = docNumber(doc);
  const href = `/documents/${doc.id}`;

  switch (type) {
    case "invoice_paid": {
      const amount =
        doc.amount != null ? ` · ${formatCurrency(doc.amount)}` : "";
      return {
        href,
        entity_id: doc.id,
        label: `Invoice #${number} paid · ${client}${amount}`,
      };
    }
    case "doc_sent": {
      const typeLabel = DOC_TYPE_LABELS[doc.type];
      return {
        href,
        entity_id: doc.id,
        label: `${typeLabel} #${number} sent to ${client}`,
      };
    }
    case "quote_approved":
      return {
        href,
        entity_id: doc.id,
        label: `Quote #${number} approved by ${client}`,
      };
    case "quote_declined":
      return {
        href,
        entity_id: doc.id,
        label: `Quote #${number} declined by ${client}`,
      };
    case "proposal_approved":
      return {
        href,
        entity_id: doc.id,
        label: `Proposal #${number} approved by ${client}`,
      };
    default:
      return {
        href,
        entity_id: doc.id,
        label: `${DOC_TYPE_LABELS[doc.type]} #${number}`,
      };
  }
}
