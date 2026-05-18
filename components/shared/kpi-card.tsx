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
      ? "text-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]"
      : variant === "warning"
        ? "text-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)]"
        : trend === "up"
          ? "text-[var(--success)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)]"
          : trend === "down"
            ? "text-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]"
            : "text-muted-foreground bg-muted";

  const subClass =
    variant === "danger"
      ? "text-[var(--danger)]"
      : variant === "warning"
        ? "text-[var(--warning)]"
        : "text-muted-foreground";

  const card = (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-card px-4 py-4",
        "opacity-0 animate-[fadeUp_0.45s_ease_forwards]",
        variant === "danger" &&
          "border-[color-mix(in_srgb,var(--danger)_25%,var(--border))]",
        variant === "warning" &&
          "border-[color-mix(in_srgb,var(--warning)_25%,var(--border))]",
        href &&
          "cursor-pointer transition-[border-color,box-shadow] hover:border-[var(--border-focus)] hover:shadow-[var(--shadow-sm,0_1px_4px_rgba(0,0,0,0.06))]",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-2 text-[13px] text-muted-foreground leading-tight">
        {label}
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="font-heading text-[28px] font-semibold tabular-nums tracking-[-0.02em] text-foreground leading-none">
          {value}
        </p>
        {delta && (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1",
              "text-[11px] font-medium tabular-nums",
              deltaClass
            )}
          >
            <TrendIcon size={11} strokeWidth={2} />
            {delta}
          </span>
        )}
      </div>
      {sub != null && (
        <p className={cn("mt-2 text-[12px] leading-snug", subClass)}>{sub}</p>
      )}
    </div>
  );

  if (href) return <Link href={href} className="block">{card}</Link>;
  return card;
}
