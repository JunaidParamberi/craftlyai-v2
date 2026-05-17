"use client";

import type { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type KpiCardProps = {
  label: string;
  value: ReactNode;
  delta?: string | null;
  trend?: "up" | "down" | "flat";
  sub?: ReactNode | null;
  delay?: number;
  href?: string;
  variant?: "default" | "warning" | "danger";
  className?: string;
};

export function KpiCard({
  label,
  value,
  delta,
  trend = "flat",
  sub,
  delay = 0,
  href,
  variant = "default",
  className,
}: KpiCardProps) {
  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  const deltaClass =
    variant === "danger"
      ? "text-[var(--danger,#C13838)] bg-[color-mix(in_srgb,var(--danger,#C13838)_10%,transparent)]"
      : variant === "warning"
        ? "text-[var(--warning,#B36A12)] bg-[color-mix(in_srgb,var(--warning,#B36A12)_10%,transparent)]"
        : trend === "up"
          ? "text-[var(--success,#1F8A52)] bg-[color-mix(in_srgb,var(--success,#1F8A52)_10%,transparent)]"
          : trend === "down"
            ? "text-[var(--danger,#C13838)] bg-[color-mix(in_srgb,var(--danger,#C13838)_10%,transparent)]"
            : "text-muted-foreground bg-muted";

  const subClass =
    variant === "danger"
      ? "text-[var(--danger,#C13838)]"
      : variant === "warning"
        ? "text-[var(--warning,#B36A12)]"
        : "text-muted-foreground";

  const card = (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-card px-4 py-4",
        "opacity-0 animate-[fadeUp_0.45s_ease_forwards]",
        variant === "danger" &&
          "border-[color-mix(in_srgb,var(--danger,#C13838)_25%,var(--border))]",
        variant === "warning" &&
          "border-[color-mix(in_srgb,var(--warning,#B36A12)_25%,var(--border))]",
        href &&
          "cursor-pointer transition-[border-color,box-shadow] hover:border-[var(--border-focus)] hover:shadow-[var(--shadow-sm,0_1px_4px_rgba(0,0,0,0.06))]",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground leading-tight">
          {label}
        </span>
        {delta && (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5",
              "text-[10px] font-semibold tabular-nums",
              deltaClass
            )}
          >
            <TrendIcon size={10} strokeWidth={2.5} />
            {delta}
          </span>
        )}
      </div>
      <p className="font-heading text-[26px] font-bold tabular-nums tracking-[-0.025em] text-foreground leading-none">
        {value}
      </p>
      {sub != null && (
        <p className={cn("mt-2 text-[11px] leading-snug", subClass)}>{sub}</p>
      )}
    </div>
  );

  if (href) return <Link href={href} className="block">{card}</Link>;
  return card;
}
