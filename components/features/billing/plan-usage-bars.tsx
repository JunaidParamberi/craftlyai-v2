import Link from "next/link";
import { cn } from "@/lib/utils";
import { getPlanLimit, getUsageRatio, getUsageColor } from "@/lib/plan-usage/helpers";
import type { PlanUsage } from "@/lib/plan-usage/helpers";
import { PLAN_ORDER } from "@/config/plans";
import type { PlanTier } from "@/config/plans";

const COLOR_CLASSES = {
  emerald: {
    bar: "bg-emerald-500",
    track: "bg-emerald-100 dark:bg-emerald-950",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    bar: "bg-amber-500",
    track: "bg-amber-100 dark:bg-amber-950",
    text: "text-amber-600 dark:text-amber-400",
  },
  red: {
    bar: "bg-red-500",
    track: "bg-red-100 dark:bg-red-950",
    text: "text-red-600 dark:text-red-400",
  },
} as const;

interface UsageBarProps {
  label: string;
  used: number;
  limit: number;
}

function UsageBar({ label, used, limit }: UsageBarProps) {
  const ratio = getUsageRatio(used, limit);
  const color = getUsageColor(ratio);
  const classes = COLOR_CLASSES[color];
  const pct = Math.min(ratio * 100, 100);
  const displayLimit = limit === Infinity ? "∞" : String(limit);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("text-xs font-medium tabular-nums", classes.text)}>
          {used} / {displayLimit}
        </span>
      </div>
      <div className={cn("h-1 w-full rounded-full", classes.track)}>
        <div
          className={cn("h-full rounded-full transition-all", classes.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface PlanUsageBarsProps {
  usage: PlanUsage;
}

export function PlanUsageBars({ usage }: PlanUsageBarsProps) {
  const { planTier, clientCount, docCountThisMonth } = usage;

  if (PLAN_ORDER.indexOf(planTier as PlanTier) >= PLAN_ORDER.indexOf("pro")) {
    return null;
  }

  const clientLimit = getPlanLimit(planTier, "clients");
  const docLimit = getPlanLimit(planTier, "docsPerMonth");

  return (
    <div className="flex flex-col gap-2 px-2 py-2">
      <UsageBar label="Clients" used={clientCount} limit={clientLimit} />
      {docLimit !== Infinity && (
        <UsageBar label="Docs / month" used={docCountThisMonth} limit={docLimit} />
      )}
      <Link
        href="/settings/billing"
        className="mt-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Upgrade plan →
      </Link>
    </div>
  );
}
