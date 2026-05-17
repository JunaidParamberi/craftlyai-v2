import type { FinancialSummary } from "@/lib/finance/types";
import { KpiCard } from "@/components/shared/kpi-card";

type Props = {
  summary: FinancialSummary;
  currency: string;
  dateParams: string;
  activeStatus?: string;
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function FinanceSummaryCards({ summary, currency, dateParams, activeStatus }: Props) {
  const {
    totalRevenue,
    outstanding,
    overdue,
    avgPayDays,
    revenueChangePct,
    overdueCount,
    outstandingCount,
  } = summary;

  const revDelta =
    revenueChangePct === null
      ? null
      : `${revenueChangePct >= 0 ? "+" : ""}${revenueChangePct}%`;
  const revTrend =
    revenueChangePct === null ? "flat" : revenueChangePct >= 0 ? "up" : "down";

  const avgSub =
    avgPayDays === null
      ? "No paid invoices yet"
      : avgPayDays <= 30
        ? `${avgPayDays}d — on track`
        : `${avgPayDays}d — above avg`;

  const sep = dateParams ? `${dateParams}&` : "";

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard
        delay={0}
        label="Total Revenue"
        value={formatMoney(totalRevenue, currency)}
        delta={revDelta}
        trend={revTrend}
        sub="vs prev period"
      />
      <KpiCard
        delay={80}
        label="Outstanding"
        value={formatMoney(outstanding, currency)}
        sub={`${outstandingCount} invoice${outstandingCount !== 1 ? "s" : ""} pending`}
        href={`/finance?${sep}status=outstanding`}
        variant={activeStatus === "outstanding" ? "default" : "default"}
      />
      <KpiCard
        delay={160}
        label="Overdue"
        value={formatMoney(overdue, currency)}
        sub={
          overdueCount === 0
            ? "None overdue"
            : `${overdueCount} invoice${overdueCount !== 1 ? "s" : ""} overdue`
        }
        variant={overdueCount > 0 ? "warning" : "default"}
        href={`/finance?${sep}status=overdue`}
      />
      <KpiCard
        delay={240}
        label="Avg Pay Time"
        value={avgPayDays === null ? "—" : `${avgPayDays}d`}
        sub={avgSub}
        trend={avgPayDays !== null && avgPayDays > 30 ? "down" : "flat"}
      />
    </div>
  );
}
