import type { DocumentStatus, DocumentType } from "@/types";

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  proposal: "Proposal",
  quote: "Quote",
  invoice: "Invoice",
  payment_voucher: "Payment Voucher",
  local_purchase_order: "Local Purchase Order",
  other: "Document",
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  signed: "Signed",
  paid: "Paid",
  partially_paid: "Partially Paid",
  written_off: "Written Off",
  archived: "Archived",
  approved: "Approved",
  declined: "Declined",
};

export type DocumentStatusVariant =
  | "default"
  | "secondary"
  | "outline"
  | "destructive";

export const DOCUMENT_STATUS_VARIANTS: Record<
  DocumentStatus,
  DocumentStatusVariant
> = {
  draft: "outline",
  sent: "secondary",
  viewed: "secondary",
  signed: "default",
  paid: "default",
  partially_paid: "secondary",
  written_off: "outline",
  archived: "outline",
  approved: "default",
  declined: "destructive",
};

export function documentTypeLabel(type: DocumentType): string {
  return DOCUMENT_TYPE_LABELS[type];
}

export function documentStatusLabel(status: DocumentStatus): string {
  return DOCUMENT_STATUS_LABELS[status];
}

export function documentStatusVariant(
  status: DocumentStatus,
): DocumentStatusVariant {
  return DOCUMENT_STATUS_VARIANTS[status];
}
