"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PLAN_ORDER, type PlanTier, type PlanConfig } from "@/config/plans";

interface PlanCardProps {
  plan: PlanConfig;
  currentPlan: PlanTier;
  onUpgrade: (plan: PlanTier) => void;
  onDowngrade: () => void;
  loading: boolean;
}

const PLAN_ACCENT: Record<PlanTier, { from: string; to: string; ring: string; badge: string }> = {
  free: {
    from: "from-slate-100/60",
    to: "to-slate-50/30",
    ring: "ring-slate-200",
    badge: "bg-slate-100 text-slate-600",
  },
  starter: {
    from: "from-sky-50/60",
    to: "to-slate-50/30",
    ring: "ring-sky-200",
    badge: "bg-sky-100 text-sky-700",
  },
  pro: {
    from: "from-amber-50/70",
    to: "to-orange-50/40",
    ring: "ring-amber-300",
    badge: "bg-amber-100 text-amber-800",
  },
  agency: {
    from: "from-indigo-50/60",
    to: "to-violet-50/30",
    ring: "ring-indigo-200",
    badge: "bg-indigo-100 text-indigo-700",
  },
};

const PLAN_CHECK_COLOR: Record<PlanTier, string> = {
  free: "text-slate-500",
  starter: "text-sky-500",
  pro: "text-amber-500",
  agency: "text-indigo-500",
};

export function PlanCard({
  plan,
  currentPlan,
  onUpgrade,
  onDowngrade,
  loading,
}: PlanCardProps) {
  const isPro = plan.id === "pro";
  const isCurrent = currentPlan === plan.id;
  const currentIdx = PLAN_ORDER.indexOf(currentPlan);
  const planIdx = PLAN_ORDER.indexOf(plan.id);
  const isUpgrade = planIdx > currentIdx;
  const isDowngrade = planIdx < currentIdx;
  const accentFree = PLAN_ACCENT[plan.id];
  const checkColor = PLAN_CHECK_COLOR[plan.id];

  const annualSavings =
    plan.monthlyPrice > 0
      ? Math.round((plan.monthlyPrice - plan.annualPrice) * 12)
      : 0;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border transition-all duration-300",
        // Base
        "bg-gradient-to-b",
        accentFree.from,
        accentFree.to,
        "backdrop-blur-sm",
        // Border / ring
        isPro
          ? "border-amber-300/70 ring-2 ring-amber-200/60 shadow-xl shadow-amber-100/40"
          : "border-border ring-1",
        accentFree.ring,
        // Elevation for non-current non-pro on hover
        !isCurrent && !isPro && "hover:shadow-md hover:-translate-y-0.5",
        // Pro: always elevated
        isPro && "scale-[1.03] shadow-2xl shadow-amber-200/30 -translate-y-1",
        // Current card: solid bottom border accent
        isCurrent && "ring-2",
      )}
    >
      {/* Pro "Most Popular" badge pinned top-center */}
      {isPro && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 text-[11px] font-semibold text-white shadow-md shadow-amber-300/40 tracking-wide">
            <Sparkles className="size-3 shrink-0" />
            Most Popular
          </span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-6 pt-7">
        {/* Plan header */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={cn(
                "font-display text-lg font-bold tracking-tight",
                isPro ? "text-amber-700" : "text-foreground",
              )}
            >
              {plan.name}
            </h3>
            {isCurrent && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-widest border-0 px-2 py-0.5",
                  accentFree.badge,
                )}
              >
                Current
              </Badge>
            )}
          </div>
          <p className="text-[13px] text-muted-foreground leading-snug">
            {plan.description}
          </p>
        </div>

        {/* Price */}
        <div className="mb-5">
          <div className="flex items-end gap-1">
            {plan.monthlyPrice === 0 ? (
              <span className="font-display text-4xl font-extrabold tracking-tight text-foreground leading-none">
                Free
              </span>
            ) : (
              <>
                <span className="font-display text-4xl font-extrabold tracking-tight text-foreground leading-none">
                  ${plan.monthlyPrice}
                </span>
                <span className="mb-1 text-sm text-muted-foreground font-medium">/mo</span>
              </>
            )}
          </div>
          {annualSavings > 0 && (
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              Save{" "}
              <span className="font-semibold text-emerald-600">
                ${annualSavings}/yr
              </span>{" "}
              with annual billing
            </p>
          )}
        </div>

        {/* Divider */}
        <div
          className={cn(
            "mb-5 h-px",
            isPro ? "bg-gradient-to-r from-amber-200 via-orange-200 to-transparent" : "bg-border",
          )}
        />

        {/* Feature list */}
        <ul className="flex flex-col gap-2.5 flex-1 mb-6">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-[13px]">
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                  isPro ? "bg-amber-100" : "bg-muted",
                )}
              >
                <Check className={cn("size-2.5 stroke-[3]", checkColor)} />
              </span>
              <span className="text-foreground/80 leading-snug">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        {isCurrent ? (
          <Button
            variant="outline"
            disabled
            className="w-full text-[13px] font-medium opacity-60 cursor-default"
          >
            Current Plan
          </Button>
        ) : isUpgrade ? (
          <Button
            onClick={() => onUpgrade(plan.id)}
            disabled={loading}
            className={cn(
              "w-full text-[13px] font-semibold tracking-wide transition-all duration-200",
              "group/btn relative overflow-hidden",
              isPro
                ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-md shadow-amber-300/30 border-0"
                : "bg-foreground text-background hover:bg-foreground/90",
            )}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                Upgrade to {plan.name}
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
              </span>
            )}
          </Button>
        ) : isDowngrade ? (
          <Button
            variant="ghost"
            onClick={onDowngrade}
            disabled={loading}
            className="w-full text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <ChevronDown className="size-3.5" />
                Downgrade to Free
              </span>
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
