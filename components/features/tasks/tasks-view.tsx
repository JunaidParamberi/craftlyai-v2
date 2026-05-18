"use client";

import { usePathname, useRouter } from "next/navigation";
import { Suspense, useMemo, useState, type ReactNode } from "react";
import { ListTodo, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  countDistinctProjectsWithOpenTasks,
  countOpenTasks,
  countOverdueTasks,
  filterTasks,
  sortTasks,
  type TaskListFilters,
} from "@/lib/tasks/task-utils";
import { useTaskFilters } from "@/lib/tasks/use-task-filters";
import type { ProjectListRow, TaskListRow } from "@/types";

import { QuickAddTaskDialog } from "@/components/features/tasks/quick-add-task-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { TaskFilters } from "@/components/features/tasks/task-filters";
import { TaskRow } from "@/components/features/tasks/task-row";
import { TasksSummaryStrip } from "@/components/features/tasks/tasks-summary-strip";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type TasksViewProps = {
  tasks: TaskListRow[];
  projects: ProjectListRow[];
  initialFilters: TaskListFilters;
};

function TasksEmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-border py-12 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
        <ListTodo className="size-5 text-muted-foreground" strokeWidth={1.6} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium text-sm">{title}</p>
        <p className="max-w-sm text-muted-foreground text-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function TasksView({
  tasks,
  projects,
  initialFilters,
}: TasksViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [addOpen, setAddOpen] = useState(false);
  const filters = useTaskFilters(initialFilters);

  const filtered = useMemo(() => {
    const narrowed = filterTasks(tasks, filters, "");
    return sortTasks(narrowed, filters.sort);
  }, [tasks, filters]);

  const open = countOpenTasks(tasks);
  const overdue = countOverdueTasks(tasks);
  const projectCount = countDistinctProjectsWithOpenTasks(tasks);

  const subtitle = `${open} open across ${projectCount} ${projectCount === 1 ? "project" : "projects"} · ${overdue} overdue`;

  const hasAnyTasks = tasks.length > 0;
  const hasFilteredResults = filtered.length > 0;

  function clearFilters() {
    router.push(pathname);
  }

  function planMyWeek() {
    toast.info("Plan my week is coming soon.");
  }

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-col">
      <PageHeader
        className="mb-7 [&_h1]:text-[28px] [&_h1]:tracking-[-0.025em] md:[&_h1]:text-[30px] [&_p]:mt-1.5"
        title="Tasks"
        description={subtitle}
        actions={
          <>
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 border border-border shadow-[var(--shadow-xs)]"
              onClick={planMyWeek}
            >
              <Sparkles data-icon="inline-start" strokeWidth={1.6} />
              Plan my week
            </Button>
            <Button
              type="button"
              className="shrink-0"
              onClick={() => setAddOpen(true)}
              disabled={projects.length === 0}
            >
              <Plus data-icon="inline-start" strokeWidth={1.6} />
              New task
            </Button>
          </>
        }
      />

      <TasksSummaryStrip tasks={tasks} filters={filters} />

      <section className="flex flex-col">
        <Suspense fallback={null}>
          <TaskFilters
            filters={filters}
            projects={projects}
            tasks={tasks}
          />
        </Suspense>

        {!hasAnyTasks ? (
          <TasksEmptyState
            className="mt-5"
            title="No tasks yet"
            description="Add tasks here or from a project's Tasks tab."
            action={
              projects.length > 0 ? (
                <Button type="button" size="sm" onClick={() => setAddOpen(true)}>
                  <Plus data-icon="inline-start" />
                  New task
                </Button>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Create a project first to attach tasks.
                </p>
              )
            }
          />
        ) : !hasFilteredResults ? (
          <TasksEmptyState
            className="mt-5"
            title="No tasks match these filters"
            description="Try adjusting your filters or choose another summary tile."
            action={
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-xs)]">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="tasks-table-head w-10 ps-[18px] pe-0" />
                  <TableHead className="tasks-table-head min-w-[12rem]">
                    Task
                  </TableHead>
                  <TableHead className="tasks-table-head hidden md:table-cell">
                    Project
                  </TableHead>
                  <TableHead className="tasks-table-head hidden sm:table-cell">
                    Status
                  </TableHead>
                  <TableHead className="tasks-table-head hidden sm:table-cell">
                    Priority
                  </TableHead>
                  <TableHead className="tasks-table-head hidden lg:table-cell">
                    Due
                  </TableHead>
                  <TableHead className="tasks-table-head w-12 pe-[18px] text-end">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <QuickAddTaskDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        projects={projects}
        defaultProjectId={
          filters.project !== "all" ? filters.project : null
        }
      />
    </div>
  );
}
