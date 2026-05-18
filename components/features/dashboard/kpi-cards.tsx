import { CountUp } from "@/components/shared/count-up";
import { KpiCard } from "@/components/shared/kpi-card";
import type { FinancialSummary } from "@/lib/finance/types";
import { formatCurrency } from "@/lib/utils/format";

type Props = {
  summary: FinancialSummary;
  currency: string;
};

export function DashboardKpiCards({ summary, currency }: Props) {
  const {
    totalRevenue,
    revenueChangePct,
    outstanding,
    outstandingCount,
    overdue,
    overdueCount,
    avgPayDays,
  } = summary;

  const revDelta =
    revenueChangePct === null
      ? null
      : `${revenueChangePct >= 0 ? "+" : ""}${revenueChangePct}%`;
  const revTrend =
    revenueChangePct === null ? "flat" : revenueChangePct >= 0 ? "up" : "down";

  const outstandingDelta =
    outstandingCount > 0
      ? `${outstandingCount} invoice${outstandingCount !== 1 ? "s" : ""}`
      : null;

  const overdueDelta =
    overdueCount > 0
      ? `${overdueCount} invoice${overdueCount !== 1 ? "s" : ""}`
      : null;

  const avgPayValue =
    avgPayDays !== null ? `${avgPayDays.toFixed(1)} days` : "—";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Revenue this month"
        value={<CountUp value={totalRevenue} format="currency" currency={currency} />}
        delta={revDelta}
        trend={revTrend}
        sub="vs. last month"
        delay={0}
      />
      <KpiCard
        label="Outstanding"
        value={<CountUp value={outstanding} format="currency" currency={currency} />}
        delta={outstandingDelta}
        trend="flat"
        sub={
          outstandingCount > 0
            ? `${formatCurrency(outstanding, currency)} unpaid`
            : "No unpaid invoices"
        }
        delay={60}
      />
      <KpiCard
        label="Overdue"
        value={<CountUp value={overdue} format="currency" currency={currency} />}
        delta={overdueDelta}
        trend={overdueCount > 0 ? "down" : "flat"}
        sub={overdueCount > 0 ? `${overdueCount} at risk` : "All clear"}
        variant={overdueCount > 0 ? "danger" : "default"}
        delay={120}
      />
      <KpiCard
        label="Avg. pay time"
        value={avgPayValue}
        sub={avgPayDays !== null ? "across paid invoices" : "no paid invoices yet"}
        delay={180}
      />
    </div>
  );
}
