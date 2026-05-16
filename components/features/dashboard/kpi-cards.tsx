import { ArrowDownRight, ArrowUpRight, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardCounts } from "@/lib/dashboard/types";
import type { FinancialSummary } from "@/lib/finance/types";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

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

  const changeLabel =
    revenueChangePct === null
      ? null
      : revenueChangePct >= 0
        ? `+${revenueChangePct}% vs last month`
        : `${revenueChangePct}% vs last month`;

  const nearingLabel =
    counts.nearingDeadlineCount > 0
      ? `${counts.nearingDeadlineCount} nearing deadline`
      : "None nearing deadline";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card size="sm" className="opacity-0 animate-[fadeUp_0.45s_ease_forwards]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            Monthly revenue
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0">
          <p className="text-[22px] font-bold tabular-nums tracking-tight text-foreground leading-none mt-1">
            {formatCurrency(totalRevenue)}
          </p>
          {changeLabel !== null ? (
            <Badge
              variant="secondary"
              className={cn(
                "w-fit gap-1 border-0 font-medium text-xs",
                revenueChangePct !== null && revenueChangePct >= 0
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {revenueChangePct !== null && revenueChangePct >= 0 ? (
                <ArrowUpRight data-icon="inline-start" />
              ) : (
                <ArrowDownRight data-icon="inline-start" />
              )}
              {changeLabel}
            </Badge>
          ) : null}
        </CardContent>
      </Card>

      <Card
        size="sm"
        className="opacity-0 animate-[fadeUp_0.45s_ease_forwards] [animation-delay:60ms]"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            Active projects
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-0">
          <p className="text-[22px] font-bold tabular-nums tracking-tight text-foreground leading-none mt-1">
            {counts.activeProjectsCount}
          </p>
          <p
            className={cn(
              "flex items-center gap-2 text-xs",
              counts.nearingDeadlineCount > 0
                ? "text-amber-600 dark:text-amber-500"
                : "text-muted-foreground"
            )}
          >
            <Clock />
            {nearingLabel}
          </p>
        </CardContent>
      </Card>

      <Card
        size="sm"
        className="opacity-0 animate-[fadeUp_0.45s_ease_forwards] [animation-delay:120ms]"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            Outstanding
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-0">
          <p className="text-[22px] font-bold tabular-nums tracking-tight text-foreground leading-none mt-1">
            {formatCurrency(outstanding)}
          </p>
          <p className="text-muted-foreground text-xs">
            {outstandingCount} unpaid invoice
            {outstandingCount !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <Card
        size="sm"
        className={cn(
          "opacity-0 animate-[fadeUp_0.45s_ease_forwards] [animation-delay:180ms]",
          overdueCount > 0 && "border-destructive/30 bg-destructive/5"
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            Overdue
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-0">
          <p className="text-[22px] font-bold tabular-nums tracking-tight text-foreground leading-none mt-1">
            {overdueCount}
          </p>
          <p
            className={cn(
              "text-xs",
              overdueCount > 0 ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {overdueCount > 0
              ? `${formatCurrency(overdue)} at risk`
              : "All clear"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
