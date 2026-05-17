import { Clock } from "lucide-react";

import { CountUp } from "@/components/shared/count-up";
import { KpiCard } from "@/components/shared/kpi-card";
import type { DashboardCounts } from "@/lib/dashboard/types";
import type { FinancialSummary } from "@/lib/finance/types";
import { formatCurrency } from "@/lib/utils/format";

type Props = {
  summary: FinancialSummary;
  counts: DashboardCounts;
};

export function DashboardKpiCards({ summary, counts }: Props) {
  const {
    totalRevenue,
    revenueChangePct,
    outstanding,
    outstandingCount,
    overdue,
    overdueCount,
  } = summary;

  const deltaPct =
    revenueChangePct === null
      ? null
      : `${revenueChangePct >= 0 ? "+" : ""}${revenueChangePct}%`;

  const revTrend =
    revenueChangePct === null ? "flat" : revenueChangePct >= 0 ? "up" : "down";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Monthly revenue"
        value={<CountUp value={totalRevenue} format="currency" />}
        delta={deltaPct}
        trend={revTrend}
        sub="vs last month"
        delay={0}
      />
      <KpiCard
        label="Active projects"
        value={<CountUp value={counts.activeProjectsCount} />}
        sub={
          counts.nearingDeadlineCount > 0 ? (
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              {counts.nearingDeadlineCount} nearing deadline
            </span>
          ) : (
            "None nearing deadline"
          )
        }
        variant={counts.nearingDeadlineCount > 0 ? "warning" : "default"}
        delay={60}
      />
      <KpiCard
        label="Outstanding"
        value={<CountUp value={outstanding} format="currency" />}
        sub={`${outstandingCount} unpaid invoice${outstandingCount !== 1 ? "s" : ""}`}
        delay={120}
      />
      <KpiCard
        label="Overdue"
        value={<CountUp value={overdueCount} />}
        sub={
          overdueCount > 0 ? `${formatCurrency(overdue)} at risk` : "All clear"
        }
        variant={overdueCount > 0 ? "danger" : "default"}
        delay={180}
      />
    </div>
  );
}
