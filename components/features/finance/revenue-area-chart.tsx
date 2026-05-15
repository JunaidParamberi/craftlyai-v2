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

export function RevenueAreaChart({ data, currency }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-sm text-muted-foreground">No revenue data for this period</p>
      </div>
    );
  }

  const ChartTooltip = makeTooltip(currency);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.18} />
            <stop offset="85%" stopColor="#3b82f6" stopOpacity={0.02} />
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
          dot={false}
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
