import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpgradeGhostRowProps {
  title: string;
  description: string;
  className?: string;
}

export function UpgradeGhostRow({ title, description, className }: UpgradeGhostRowProps) {
  return (
    <Link
      href="/settings/billing"
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-dashed border-emerald-200 dark:border-emerald-900",
        "bg-emerald-50/50 dark:bg-emerald-950/30 px-4 py-3",
        "transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/50",
        className
      )}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-emerald-300 dark:border-emerald-700 bg-white dark:bg-transparent">
        <Plus className="size-3.5 text-emerald-500" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
          {title}
        </span>
        <span className="text-xs text-emerald-600 dark:text-emerald-400">
          {description}
        </span>
      </div>
      <span className="shrink-0 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-semibold text-white">
        Upgrade →
      </span>
    </Link>
  );
}
