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
  month: string;     // "Jan 2026" — display label
  monthKey: string;  // "2026-01" — sort key
  revenue: number;
  isCurrent: boolean;
};

export type DateRange = {
  from: Date;
  to: Date;
};
