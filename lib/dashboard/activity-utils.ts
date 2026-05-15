import { format, formatDistanceToNow, parseISO } from "date-fns";

import { formatCurrency } from "@/lib/utils/format";
import type { DocumentType } from "@/types";
import type { ActivityEvent, ActivityEventType } from "./types";

export type DocumentActivitySource = {
  id: string;
  type: DocumentType;
  sent_at: string | null;
  paid_at: string | null;
  approved_at: string | null;
  declined_at: string | null;
  invoice_number: string | null;
  quote_number: string | null;
  title: string;
  clientName: string | null;
  amount: number | null;
};

export type ProjectActivitySource = {
  id: string;
  title: string;
  status: string;
  updated_at: string;
  clientName: string | null;
};

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  invoice: "Invoice",
  quote: "Quote",
  proposal: "Proposal",
  other: "Document",
};

function docNumber(doc: DocumentActivitySource): string {
  if (doc.type === "invoice" && doc.invoice_number) return doc.invoice_number;
  if (doc.type === "quote" && doc.quote_number) return doc.quote_number;
  return doc.title;
}

function eventId(docId: string, type: ActivityEventType): string {
  return `${docId}:${type}`;
}

export function extractDocumentEvents(doc: DocumentActivitySource): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const client = doc.clientName ?? "client";
  const number = docNumber(doc);

  if (doc.paid_at) {
    const amount =
      doc.amount !== null ? ` · ${formatCurrency(doc.amount)}` : "";
    events.push({
      type: "invoice_paid",
      id: eventId(doc.id, "invoice_paid"),
      href: `/documents/${doc.id}`,
      label: `Invoice #${number} paid · ${client}${amount}`,
      timestamp: parseISO(doc.paid_at),
    });
  }

  if (doc.sent_at) {
    const typeLabel = DOC_TYPE_LABELS[doc.type];
    events.push({
      type: "doc_sent",
      id: eventId(doc.id, "doc_sent"),
      href: `/documents/${doc.id}`,
      label: `${typeLabel} #${number} sent to ${client}`,
      timestamp: parseISO(doc.sent_at),
    });
  }

  if (doc.approved_at) {
    events.push({
      type: "quote_approved",
      id: eventId(doc.id, "quote_approved"),
      href: `/documents/${doc.id}`,
      label: `Quote #${number} approved by ${client}`,
      timestamp: parseISO(doc.approved_at),
    });
  }

  if (doc.declined_at) {
    events.push({
      type: "quote_declined",
      id: eventId(doc.id, "quote_declined"),
      href: `/documents/${doc.id}`,
      label: `Quote #${number} declined by ${client}`,
      timestamp: parseISO(doc.declined_at),
    });
  }

  return events;
}

export function extractProjectEvents(project: ProjectActivitySource): ActivityEvent[] {
  return [
    {
      type: "project_status_changed",
      id: `${project.id}:status`,
      href: `/projects/${project.id}`,
      label: `${project.title} marked ${project.status.replace(/_/g, " ")}`,
      timestamp: parseISO(project.updated_at),
    },
  ];
}

export function mergeAndSortEvents(
  events: ActivityEvent[],
  limit: number
): ActivityEvent[] {
  return [...events]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

export function formatActivityTimestamp(date: Date, now = new Date()): string {
  const days = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days > 7) {
    return format(date, "MMM d");
  }
  return formatDistanceToNow(date, { addSuffix: true });
}
