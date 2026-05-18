import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import type {
  ActivePipelineResult,
  PipelineProject,
} from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";

type Props = {
  pipeline: ActivePipelineResult;
  currency: string;
};

const RISK_DOT: Record<PipelineProject["risk"], string> = {
  overdue: "bg-[var(--danger)]",
  at_risk: "bg-[var(--danger)]",
  watch: "bg-[var(--warning)]",
  on_track: "bg-[var(--fg-3)]",
};

function deadlineLabel(p: PipelineProject): string {
  if (!p.deadline) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(p.deadline instanceof Date ? p.deadline : new Date(p.deadline));
}

export function PipelinePanel({ pipeline, currency }: Props) {
  const { projects, totalCount } = pipeline;

  return (
    <Card size="sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <CardTitle>Active pipeline</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/projects" />}
        >
          All projects
          <ChevronRight />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {projects.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground text-sm">
            No active projects yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Project
                </TableHead>
                <TableHead className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Client
                </TableHead>
                <TableHead className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="w-[200px] text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Progress
                </TableHead>
                <TableHead className="text-right text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Value
                </TableHead>
                <TableHead className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  Deadline
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => {
                const pct = p.progress !== null ? Math.round(p.progress * 100) : null;
                return (
                  <TableRow key={p.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link
                        href={`/projects/${p.id}`}
                        className="flex items-center gap-2.5 hover:underline"
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            RISK_DOT[p.risk],
                          )}
                        />
                        <span className="truncate">{p.title}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.clientName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>
                      {pct !== null ? (
                        <div className="flex items-center gap-2.5">
                          <Progress value={pct} className="h-1.5 flex-1" />
                          <span className="min-w-[30px] text-[11px] tabular-nums text-muted-foreground">
                            {pct}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {p.budget !== null ? formatCurrency(p.budget, currency) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.daysLabel || deadlineLabel(p)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {totalCount > projects.length && (
          <p className="border-t border-border/60 py-3 text-center text-xs">
            <Link
              href="/projects"
              className="font-medium text-primary hover:underline"
            >
              +{totalCount - projects.length} more
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
