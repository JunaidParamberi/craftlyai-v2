import { AlertTriangle, Clock, DollarSign, Timer } from "lucide-react";

import type { FinancialSummary } from "@/lib/finance/types";
import { KpiCard } from "./kpi-card";

type Props = { summary: FinancialSummary; currency: string };

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function FinanceSummaryCards({ summary, currency }: Props) {
  const {
    totalRevenue,
    outstanding,
    overdue,
    avgPayDays,
    revenueChangePct,
    overdueCount,
    outstandingCount,
  } = summary;

  const changeLabel =
    revenueChangePct === null
      ? "No prior period data"
      : revenueChangePct >= 0
        ? `↑ ${revenueChangePct}% vs prev period`
        : `↓ ${Math.abs(revenueChangePct)}% vs prev period`;

  const changeColor =
    revenueChangePct === null
      ? undefined
      : revenueChangePct >= 0
        ? "text-emerald-600"
        : "text-destructive";

  const avgLabel =
    avgPayDays === null
      ? "No paid invoices yet"
      : avgPayDays <= 30
        ? `${avgPayDays}d — on track`
        : `${avgPayDays}d — above avg`;

  const avgColor =
    avgPayDays === null
      ? undefined
      : avgPayDays <= 30
        ? "text-emerald-600"
        : "text-amber-600";

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard
        index={0}
        label="Total Revenue"
        value={formatMoney(totalRevenue, currency)}
        subLabel={changeLabel}
        icon={DollarSign}
        accentColor="border-l-blue-500"
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        subLabelColor={changeColor}
      />
      <KpiCard
        index={1}
        label="Outstanding"
        value={formatMoney(outstanding, currency)}
        subLabel={`${outstandingCount} invoice${outstandingCount !== 1 ? "s" : ""} pending`}
        icon={Clock}
        accentColor="border-l-emerald-500"
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
      />
      <KpiCard
        index={2}
        label="Overdue"
        value={formatMoney(overdue, currency)}
        subLabel={
          overdueCount === 0
            ? "None overdue"
            : `${overdueCount} invoice${overdueCount !== 1 ? "s" : ""} overdue`
        }
        icon={AlertTriangle}
        accentColor="border-l-amber-500"
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
        subLabelColor={overdueCount > 0 ? "text-amber-600" : undefined}
      />
      <KpiCard
        index={3}
        label="Avg Pay Time"
        value={avgPayDays === null ? "—" : `${avgPayDays}d`}
        subLabel={avgLabel}
        icon={Timer}
        accentColor="border-l-violet-500"
        iconBg="bg-violet-50"
        iconColor="text-violet-600"
        subLabelColor={avgColor}
      />
    </div>
  );
}
