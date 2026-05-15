import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string;
  subLabel: string;
  icon: LucideIcon;
  accentColor: string;   // Tailwind border-l color class e.g. "border-blue-500"
  iconBg: string;        // Tailwind bg class e.g. "bg-blue-50"
  iconColor: string;     // Tailwind text class e.g. "text-blue-600"
  subLabelColor?: string;
  index?: number;        // for staggered animation delay
};

export function KpiCard({
  label,
  value,
  subLabel,
  icon: Icon,
  accentColor,
  iconBg,
  iconColor,
  subLabelColor = "text-muted-foreground",
  index = 0,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-card px-5 py-4",
        "border-l-[3px]",
        accentColor,
        "opacity-0 animate-[fadeUp_0.4s_ease_forwards]"
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </span>
        <div className={cn("flex size-7 items-center justify-center rounded-md", iconBg)}>
          <Icon className={cn("size-3.5", iconColor)} />
        </div>
      </div>
      <p className="font-heading text-[1.6rem] font-semibold tabular-nums tracking-tight text-foreground leading-none">
        {value}
      </p>
      <p className={cn("mt-2 text-[11px]", subLabelColor)}>{subLabel}</p>
    </div>
  );
}
