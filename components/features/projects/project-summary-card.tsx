"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

import { formatProjectDate } from "@/lib/projects/display";
import {
  isProjectAtRisk,
  projectBudgetProgress,
} from "@/lib/projects/project-utils";
import { formatCurrency } from "@/lib/utils/format";
import type { ProjectListRow } from "@/types";

import { GradientAvatar } from "@/components/shared/gradient-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ProjectSummaryCardProps = {
  project: ProjectListRow;
  currency: string;
  userDisplayName: string;
};

function statusKeyForProject(
  status: ProjectListRow["status"],
): "active" | "planning" | "on_hold" | "done" {
  if (status === "active") return "active";
  if (status === "planning") return "planning";
  if (status === "on_hold") return "on_hold";
  return "done";
}

function ProjectSummaryEditAction({
  projectId,
  className,
}: {
  projectId: string;
  className?: string;
}) {
  const href = `/projects/${projectId}/edit`;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={href}
            className={cn(
              "group flex flex-col items-center gap-1.5 rounded-xl px-2 py-1.5 outline-none",
              "transition-[background,box-shadow] duration-200",
              "hover:bg-[var(--bg-subtle)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              className,
            )}
            aria-label="Edit project"
          >
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-[10px] border border-border bg-background shadow-[var(--shadow-xs)]",
                "transition-[border-color,background-color,transform] duration-200",
                "group-hover:-translate-y-px group-hover:border-[var(--border-focus)]",
                "group-hover:bg-[var(--accent-soft)]",
                "group-hover:shadow-[var(--shadow-sm)]",
              )}
            >
              <Pencil
                className="size-4 text-muted-foreground transition-colors group-hover:text-foreground"
                strokeWidth={1.75}
              />
            </span>
            <span className="eyebrow text-[10px] tracking-[0.08em] text-[var(--fg-3)] transition-colors group-hover:text-[var(--fg-2)]">
              Edit
            </span>
          </Link>
        }
      />
      <TooltipContent side="left">Edit project details</TooltipContent>
    </Tooltip>
  );
}

export function ProjectSummaryCard({
  project,
  currency,
  userDisplayName,
}: ProjectSummaryCardProps) {
  const clientName = project.client?.name ?? "Client";
  const clientHref = project.client?.id
    ? `/clients/${project.client.id}`
    : "/clients";
  const deadlineLabel = formatProjectDate(project.deadline);
  const atRisk = isProjectAtRisk(project);
  const progress = Math.round(projectBudgetProgress(project) * 100);
  const budgetLabel =
    project.budget != null ? formatCurrency(project.budget, currency) : "—";

  return (
    <TooltipProvider delay={300}>
      <section className="fade-up delay-2 rounded-xl border border-border bg-card p-5 shadow-xs">
        <div
          className={cn(
            "grid grid-cols-1 items-center gap-5",
            "sm:grid-cols-2",
            "lg:grid-cols-[minmax(0,1.45fr)_repeat(4,minmax(0,1fr))_auto]",
          )}
        >
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <h2 className="font-heading text-[22px] font-semibold tracking-[-0.02em] text-foreground">
              {project.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--fg-2)]">
              For{" "}
              <Link
                href={clientHref}
                className="font-medium text-[var(--fg-2)] underline-offset-4 hover:underline"
              >
                {clientName}
              </Link>
            </p>
          </div>

          <div>
            <p className="eyebrow mb-1.5">Status</p>
            <StatusBadge status={statusKeyForProject(project.status)} dot />
          </div>

          <div>
            <p className="eyebrow mb-1.5">Deadline</p>
            <p className="font-medium text-sm tabular-nums">{deadlineLabel}</p>
            {atRisk ? (
              <Badge variant="destructive" className="mt-1 text-[10px]">
                At risk
              </Badge>
            ) : null}
          </div>

          <div>
            <p className="eyebrow mb-1.5">Budget</p>
            <p className="font-semibold text-sm tabular-nums">{budgetLabel}</p>
            <p className="mt-0.5 text-[11px] text-[var(--fg-3)] tabular-nums">
              {progress}% complete
            </p>
          </div>

          <div>
            <p className="eyebrow mb-1.5">Team</p>
            <GradientAvatar name={userDisplayName} size={26} />
            <p className="mt-1 text-[11px] text-[var(--fg-3)]">You only</p>
          </div>

          <div
            className={cn(
              "flex justify-end sm:col-span-2 lg:col-span-1 lg:justify-center",
              "border-border/60 sm:border-t sm:pt-4 lg:border-s lg:border-t-0 lg:ps-5 lg:pt-0",
            )}
          >
            <ProjectSummaryEditAction projectId={project.id} />
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}
