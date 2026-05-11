"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateProject } from "@/lib/projects/actions";
import {
  formatProjectDate,
  projectStatusBadgePresentation,
  projectStatusLabel,
} from "@/lib/projects/display";
import type { ProjectListRow, TaskRow } from "@/types";

import { ProjectTasksPanel } from "@/components/features/projects/project-tasks-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  FileText,
  Pencil,
  Timer,
} from "lucide-react";

type ProjectDetailViewProps = {
  project: ProjectListRow;
  tasks: TaskRow[];
};

export function ProjectDetailView({ project, tasks }: ProjectDetailViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState("tasks");

  const clientName = project.client?.name ?? "Client";
  const clientHref = project.client?.id
    ? `/clients/${project.client.id}`
    : `/clients`;
  const badge = projectStatusBadgePresentation(project.status);
  const deadlineLabel = project.deadline
    ? formatProjectDate(project.deadline)
    : "No deadline";

  function markComplete() {
    startTransition(async () => {
      const res = await updateProject(project.id, { status: "completed" });
      if (!res.ok) {
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-sm"
      >
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          <span>Back to projects</span>
        </Link>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <span className="truncate font-medium text-foreground">{project.title}</span>
      </nav>

      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={badge.variant} className={badge.className}>
                  {projectStatusLabel(project.status)}
                </Badge>
                <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Calendar className="size-3.5 shrink-0" aria-hidden />
                  Due {deadlineLabel}
                </span>
              </div>
              <div>
                <CardTitle className="font-heading text-2xl tracking-tight md:text-3xl">
                  {project.title}
                </CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed">
                  Work for{" "}
                  <Link
                    href={clientHref}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {clientName}
                  </Link>
                  {project.deadline
                    ? ` · deadline ${deadlineLabel}.`
                    : ". Set a deadline in edit when you have one."}
                </CardDescription>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href={`/projects/${project.id}/edit`} />}
                className="gap-2"
              >
                <Pencil className="size-4" />
                Edit
              </Button>
              <Button
                type="button"
                disabled={isPending || project.status === "completed"}
                onClick={markComplete}
                className="gap-2"
              >
                <Check className="size-4" />
                {project.status === "completed" ? "Completed" : "Complete"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-6">
            <TabsList
              variant="line"
              className="h-auto w-full min-w-0 flex-wrap justify-start gap-0 bg-transparent p-0"
            >
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="time">Time</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Budget
                  </p>
                  <p className="font-medium text-lg tabular-nums">
                    {project.budget != null
                      ? project.budget.toLocaleString()
                      : "—"}
                  </p>
                </div>
                <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Spent
                  </p>
                  <p className="font-medium text-lg tabular-nums">
                    {project.spent != null ? project.spent.toLocaleString() : "—"}
                  </p>
                </div>
                <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Start
                  </p>
                  <p className="font-medium text-sm">
                    {formatProjectDate(project.start_date)}
                  </p>
                </div>
                <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Deadline
                  </p>
                  <p className="font-medium text-sm">{deadlineLabel}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-0">
              <ProjectTasksPanel projectId={project.id} initialTasks={tasks} />
            </TabsContent>

            <TabsContent value="time" className="mt-0">
              <Card className="border-dashed border-border/80 shadow-none">
                <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                    <Timer className="size-7 text-muted-foreground" />
                  </div>
                  <div className="max-w-md space-y-2">
                    <p className="font-medium text-sm">Time tracking</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Start/stop timers and manual entries will live here in Phase
                      1—coming soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <Card className="border-dashed border-border/80 shadow-none">
                <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                    <FileText className="size-7 text-muted-foreground" />
                  </div>
                  <div className="max-w-md space-y-2">
                    <p className="font-medium text-sm">Documents</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Quotes, proposals, and invoices for this project will appear
                      here with Document Studio (Phase 2).
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
