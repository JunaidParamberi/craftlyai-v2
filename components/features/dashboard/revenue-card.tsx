import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RevenueAreaChart } from "@/components/features/finance/revenue-area-chart";
import type { MonthlyRevenuePoint } from "@/lib/finance/types";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type Props = {
  data: MonthlyRevenuePoint[];
  currency: string;
};

function computeStats(data: MonthlyRevenuePoint[]) {
  if (data.length === 0) {
    return { total: 0, avg: 0, bestLabel: "—", bestValue: 0 };
  }
  const total = data.reduce((s, p) => s + p.revenue, 0);
  const avg = total / data.length;
  const best = data.reduce((b, p) => (p.revenue > b.revenue ? p : b), data[0]);
  return { total, avg, bestLabel: best.month, bestValue: best.revenue };
}

const RANGE_OPTIONS = [
  { id: "6m", label: "6M", active: true },
  { id: "1y", label: "1Y", active: false },
  { id: "all", label: "All", active: false },
] as const;

export function RevenueCard({ data, currency }: Props) {
  const stats = computeStats(data);

  return (
    <Card size="sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Last 6 months</CardDescription>
        </div>
        <div
          role="group"
          aria-label="Range"
          className="flex items-center gap-1 rounded-md bg-[var(--bg-subtle)] p-0.5"
        >
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={opt.active}
              disabled={!opt.active}
              className={cn(
                "h-6 rounded-[5px] px-2.5 text-[11.5px] font-medium transition-colors",
                opt.active
                  ? "bg-[var(--bg-surface)] text-[var(--fg)] shadow-[var(--shadow-xs)]"
                  : "cursor-not-allowed text-[var(--fg-3)] opacity-60",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <RevenueAreaChart data={data} currency={currency} />
      </CardContent>
      <div className="flex flex-wrap gap-6 border-t border-border/60 px-6 py-4 text-[12px]">
        <div className="flex flex-col gap-0.5">
          <span className="text-[var(--fg-3)]">Total · last 6mo</span>
          <span className="font-semibold tabular-nums text-[15px]">
            {formatCurrency(stats.total, currency)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[var(--fg-3)]">Avg monthly</span>
          <span className="font-semibold tabular-nums text-[15px]">
            {formatCurrency(stats.avg, currency)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[var(--fg-3)]">Best month</span>
          <span className="font-semibold tabular-nums text-[15px]">
            {stats.bestLabel} · {formatCurrency(stats.bestValue, currency)}
          </span>
        </div>
      </div>
    </Card>
  );
}
