export type DashboardCounts = {
  activeProjectsCount: number;
  nearingDeadlineCount: number;
};

export type AttentionItemType =
  | "overdue_invoice"
  | "expiring_quote"
  | "project_deadline"
  | "quote_no_response";

export type AttentionItem = {
  type: AttentionItemType;
  id: string;
  href: string;
  label: string;
  urgencyDays: number;
};

export type ActivityEventType =
  | "invoice_paid"
  | "doc_sent"
  | "quote_approved"
  | "quote_declined"
  | "project_status_changed";

export type ActivityEvent = {
  type: ActivityEventType;
  id: string;
  href: string;
  label: string;
  timestamp: Date | string;
};

export type PipelineProject = {
  id: string;
  title: string;
  clientName: string | null;
  deadline: Date | null;
  risk: "overdue" | "at_risk" | "watch" | "on_track";
  daysLabel: string;
  statusLabel: string;
};

export type ActivePipelineResult = {
  projects: PipelineProject[];
  totalCount: number;
};
