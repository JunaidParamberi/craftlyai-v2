import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { riskIndicatorLabel } from "@/lib/dashboard/attention-utils";
import type { ActivePipelineResult, PipelineProject } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

type Props = {
  pipeline: ActivePipelineResult;
};

const RISK_BORDER: Record<PipelineProject["risk"], string> = {
  overdue: "border-l-destructive",
  at_risk: "border-l-destructive",
  watch: "border-l-amber-500",
  on_track: "border-l-emerald-500",
};

const RISK_DOT: Record<PipelineProject["risk"], string> = {
  overdue: "bg-destructive",
  at_risk: "bg-destructive",
  watch: "bg-amber-500",
  on_track: "bg-emerald-500",
};

const RISK_TEXT: Record<PipelineProject["risk"], string> = {
  overdue: "text-destructive",
  at_risk: "text-destructive",
  watch: "text-amber-600 dark:text-amber-500",
  on_track: "text-emerald-600 dark:text-emerald-500",
};

function PipelineRow({ project }: { project: PipelineProject }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className={cn(
        "block rounded-[12px] border border-border/60 border-l-2 bg-card/50 px-3 py-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1",
        RISK_BORDER[project.risk]
      )}
    >
      <p className="truncate font-medium text-sm leading-snug">{project.title}</p>
      {project.clientName ? (
        <p className="mt-0.5 truncate text-muted-foreground text-xs">
          {project.clientName}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">{project.daysLabel}</p>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium",
            RISK_TEXT[project.risk]
          )}
        >
          <span
            className={cn("size-1.5 shrink-0 rounded-full", RISK_DOT[project.risk])}
            aria-hidden
          />
          {riskIndicatorLabel(project.risk)}
        </span>
      </div>
    </Link>
  );
}

export function PipelinePanel({ pipeline }: Props) {
  const { projects, totalCount } = pipeline;
  const moreCount = Math.max(0, totalCount - projects.length);

  return (
    <Card className="lg:col-span-2" size="sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Active pipeline</CardTitle>
          <CardDescription>
            Projects in motion, sorted by deadline
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/projects" />}
        >
          View all
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-6">
        {projects.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground text-sm">
            No active projects yet.
          </p>
        ) : (
          <>
            {projects.map((project) => (
              <PipelineRow key={project.id} project={project} />
            ))}
            {moreCount > 0 ? (
              <p className="text-center text-muted-foreground text-xs">
                <Link
                  href="/projects"
                  className="font-medium text-primary hover:underline"
                >
                  +{moreCount} more
                </Link>
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
