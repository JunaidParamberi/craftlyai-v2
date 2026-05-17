import Link from "next/link";
import {
  CheckCircle2,
  FolderOpen,
  Send,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatActivityTimestamp } from "@/lib/dashboard/activity-utils";
import type { ActivityEvent, ActivityEventType } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

type Props = {
  events: ActivityEvent[];
};

const EVENT_STYLES: Record<
  ActivityEventType,
  { icon: LucideIcon; container: string; iconClass: string }
> = {
  invoice_paid: {
    icon: CheckCircle2,
    container: "bg-[color-mix(in_srgb,var(--success,#1F8A52)_10%,transparent)]",
    iconClass: "text-[var(--success,#1F8A52)]",
  },
  doc_sent: {
    icon: Send,
    container: "bg-[color-mix(in_srgb,var(--border-focus)_10%,transparent)]",
    iconClass: "text-[var(--border-focus)]",
  },
  quote_approved: {
    icon: ThumbsUp,
    container: "bg-[color-mix(in_srgb,var(--success,#1F8A52)_10%,transparent)]",
    iconClass: "text-[var(--success,#1F8A52)]",
  },
  quote_declined: {
    icon: ThumbsDown,
    container: "bg-destructive/10",
    iconClass: "text-destructive",
  },
  project_status_changed: {
    icon: FolderOpen,
    container: "bg-[color-mix(in_srgb,var(--border-focus)_8%,transparent)]",
    iconClass: "text-[var(--border-focus)]",
  },
};

export function ActivityFeed({ events }: Props) {
  return (
    <Card className="lg:col-span-3" size="sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            Latest updates across clients and documents
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/documents" />}
        >
          View all
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-0 pt-6">
        {events.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground text-sm">
            No recent activity in the last 30 days.
          </p>
        ) : (
          events.map((event, index) => {
            const style = EVENT_STYLES[event.type];
            const Icon = style.icon;
            return (
              <div key={event.id}>
                {index > 0 ? <Separator /> : null}
                <Link
                  href={event.href}
                  className="flex gap-3 py-3 transition-opacity hover:opacity-80"
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-2xl",
                      style.container
                    )}
                  >
                    <Icon className={style.iconClass} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="text-sm font-medium leading-snug">
                      {event.label}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatActivityTimestamp(event.timestamp)}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
