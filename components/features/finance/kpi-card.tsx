import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string;
  subLabel: string;
  icon: LucideIcon;
  accentColor: string;
  iconBg: string;
  iconColor: string;
  subLabelColor?: string;
  index?: number;
  href?: string;
  isActive?: boolean;
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
  href,
  isActive,
}: KpiCardProps) {
  const card = (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-card px-5 py-4",
        "border-l-[3px]",
        accentColor,
        "opacity-0 animate-[fadeUp_0.4s_ease_forwards]",
        href && "cursor-pointer transition-shadow hover:shadow-md",
        isActive && "ring-2 ring-primary ring-offset-1"
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

  if (href) return <Link href={href} className="block">{card}</Link>;
  return card;
}
