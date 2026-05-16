"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthlyRevenuePoint } from "@/lib/finance/types";

type Props = {
  data: MonthlyRevenuePoint[];
  currency: string;
};

function formatYAxis(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
}

function makeTooltip(currency: string) {
  return function ChartTooltip({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: MonthlyRevenuePoint }>;
  }) {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload;
    return (
      <div className="rounded-lg bg-card px-3 py-2.5 shadow-lg shadow-black/8 ring-1 ring-border/50">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {point.month}
        </p>
        <p className="mt-0.5 font-heading text-base font-semibold tabular-nums text-foreground">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
          }).format(point.revenue)}
        </p>
        {point.isCurrent && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">Partial month</p>
        )}
      </div>
    );
  };
}

function getPrevMonthLabel(monthLabel: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [mon, year] = monthLabel.split(" ");
  const idx = months.indexOf(mon);
  if (idx === -1 || !year) return `Prev ${year ?? ""}`.trim();
  const prevIdx = (idx - 1 + 12) % 12;
  const prevYear = idx === 0 ? String(Number(year) - 1) : year;
  return `${months[prevIdx]} ${prevYear}`;
}

export function RevenueAreaChart({ data, currency }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-sm text-muted-foreground">No revenue data for this period</p>
      </div>
    );
  }

  // Recharts needs ≥2 points to draw line/area; pad with a leading zero when needed
  const chartData: MonthlyRevenuePoint[] =
    data.length === 1
      ? [{ month: getPrevMonthLabel(data[0].month), revenue: 0, isCurrent: false }, ...data]
      : data;

  const fewPoints = chartData.length <= 3;
  const ChartTooltip = makeTooltip(currency);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
        data={chartData}
        margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
            <stop offset="80%" stopColor="#3b82f6" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          strokeOpacity={0.5}
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 400 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: string) => v.split(" ")[0]}
          dy={4}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatYAxis}
          width={44}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={2.5}
          fill="url(#revenueGradient)"
          dot={fewPoints ? { r: 4, fill: "#3b82f6", stroke: "white", strokeWidth: 2 } : false}
          activeDot={{
            r: 4,
            fill: "#3b82f6",
            stroke: "white",
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
