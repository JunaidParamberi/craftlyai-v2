import Link from "next/link";
import {
  CheckCircle2,
  DollarSign,
  Eye,
  FileText,
  FolderOpen,
  Send,
  ThumbsDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatActivityTimestamp } from "@/lib/dashboard/activity-utils";
import type { ActivityEvent, ActivityEventType } from "@/lib/dashboard/types";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type Props = {
  events: ActivityEvent[];
  currency: string;
};

type Tone = {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

const TONE: Record<ActivityEventType, Tone> = {
  invoice_paid: {
    icon: DollarSign,
    iconBg: "color-mix(in srgb, var(--success) 12%, transparent)",
    iconColor: "var(--success)",
  },
  doc_sent: {
    icon: FileText,
    iconBg: "var(--bg-subtle)",
    iconColor: "var(--fg-2)",
  },
  quote_approved: {
    icon: CheckCircle2,
    iconBg: "color-mix(in srgb, var(--success) 12%, transparent)",
    iconColor: "var(--success)",
  },
  quote_declined: {
    icon: ThumbsDown,
    iconBg: "color-mix(in srgb, var(--danger) 12%, transparent)",
    iconColor: "var(--danger)",
  },
  project_status_changed: {
    icon: FolderOpen,
    iconBg: "var(--bg-subtle)",
    iconColor: "var(--fg-2)",
  },
};

function VIEW_ICON_TONE(): Tone {
  return {
    icon: Eye,
    iconBg: "color-mix(in srgb, var(--info) 12%, transparent)",
    iconColor: "var(--info)",
  };
}

export function ActivityFeed({ events, currency }: Props) {
  return (
    <Card size="sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <CardTitle>Activity</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/documents" />}
        >
          View all
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-0 pt-0">
        {events.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground text-sm">
            No recent activity in the last 30 days.
          </p>
        ) : (
          events.map((event, index) => {
            const tone = TONE[event.type] ?? VIEW_ICON_TONE();
            const Icon = tone.icon;
            const amountText =
              event.amount !== null && event.amount !== undefined
                ? formatCurrency(event.amount, currency)
                : null;
            return (
              <Link
                key={event.id}
                href={event.href}
                className={cn(
                  "flex items-center gap-3 py-3 transition-opacity hover:opacity-80",
                  index !== events.length - 1 && "border-b border-border/60",
                )}
              >
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: tone.iconBg,
                    color: tone.iconColor,
                  }}
                >
                  <Icon size={14} strokeWidth={1.6} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="truncate text-[13px] leading-snug">
                    <span className="font-medium text-foreground">
                      {event.who}
                    </span>{" "}
                    <span className="text-muted-foreground">{event.text}</span>
                    {amountText && (
                      <span className="text-muted-foreground">
                        {" · "}
                        <span className="tabular-nums">{amountText}</span>
                      </span>
                    )}
                    {event.metaSuffix && (
                      <span className="text-[var(--fg-3)]">
                        {" · "}
                        {event.metaSuffix}
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-[var(--fg-3)]">
                    {formatActivityTimestamp(event.timestamp)}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
