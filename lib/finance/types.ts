import type { DocumentStatus } from "@/types";
import type { DocumentListRow } from "@/types";

export type FinancialSummary = {
  totalRevenue: number;
  outstanding: number;
  overdue: number;
  avgPayDays: number | null;
  revenueChangePct: number | null;
  overdueCount: number;
  outstandingCount: number;
};

export type MonthlyRevenuePoint = {
  month: string;
  monthKey: string;
  revenue: number;
  isCurrent: boolean;
};

export type DateRange = {
  from: Date;
  to: Date;
};

export type SortKey =
  | "date_asc"
  | "date_desc"
  | "amount_asc"
  | "amount_desc"
  | "client_asc"
  | "client_desc"
  | "status_asc"
  | "status_desc";

export type StatusFilter = DocumentStatus | "overdue" | "outstanding";

export type InvoiceFilters = {
  dateRange: DateRange;
  page: number;
  pageSize: number;
  sort: SortKey;
  search?: string;
  status?: StatusFilter;
};

export type FinanceInvoiceRow = DocumentListRow & { computedTotal: number };

export type PaginatedInvoices = {
  invoices: FinanceInvoiceRow[];
  total: number;
  pageCount: number;
};

export type AgingBucket = {
  label: string;
  count: number;
  total: number;
};

export type AgingReport = {
  current: AgingBucket;
  overdue1to30: AgingBucket;
  overdue31to60: AgingBucket;
  overdue60plus: AgingBucket;
  grandTotal: number;
};
