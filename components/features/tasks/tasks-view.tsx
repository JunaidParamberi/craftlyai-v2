"use client";

import { usePathname, useRouter } from "next/navigation";
import { Suspense, useMemo, useState, type ReactNode } from "react";
import { ListTodo, Plus, Search } from "lucide-react";

import {
  filterTasks,
  sortTasks,
  type TaskListFilters,
} from "@/lib/tasks/task-utils";
import type { ProjectListRow, TaskListRow } from "@/types";

import { QuickAddTaskDialog } from "@/components/features/tasks/quick-add-task-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { TaskFilters } from "@/components/features/tasks/task-filters";
import { TaskRow } from "@/components/features/tasks/task-row";
import { TasksSummaryStrip } from "@/components/features/tasks/tasks-summary-strip";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TasksViewProps = {
  tasks: TaskListRow[];
  projects: ProjectListRow[];
  initialFilters: TaskListFilters;
};

function TasksEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-10 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <ListTodo className="text-muted-foreground" />
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
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    const narrowed = filterTasks(tasks, initialFilters, search);
    return sortTasks(narrowed, initialFilters.sort);
  }, [tasks, initialFilters, search]);

  const hasAnyTasks = tasks.length > 0;
  const hasFilteredResults = filtered.length > 0;

  function clearFilters() {
    setSearch("");
    router.push(pathname);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Work"
        title="Tasks"
        description="All deliverables across your projects."
        actions={
          <Button
            type="button"
            className="shrink-0"
            onClick={() => setAddOpen(true)}
            disabled={projects.length === 0}
          >
            <Plus data-icon="inline-start" />
            Add task
          </Button>
        }
      />

      <TasksSummaryStrip tasks={tasks} />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="font-heading text-base">Task list</CardTitle>
          <CardDescription>
            Overdue items are highlighted. Use filters to focus on a project or
            status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <InputGroup className="shrink-0 xl:w-72">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search tasks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Separator
              orientation="vertical"
              className="hidden h-9 xl:block"
            />
            <Suspense fallback={null}>
              <TaskFilters filters={initialFilters} projects={projects} />
            </Suspense>
          </div>

          {!hasAnyTasks ? (
            <TasksEmptyState
              title="No tasks yet"
              description="Add tasks here or from a project's Tasks tab."
              action={
                projects.length > 0 ? (
                  <Button type="button" size="sm" onClick={() => setAddOpen(true)}>
                    <Plus data-icon="inline-start" />
                    Add task
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
              title="No tasks match these filters"
              description="Try adjusting your filters or search query."
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
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10" />
                  <TableHead>Task</TableHead>
                  <TableHead className="hidden md:table-cell">Project</TableHead>
                  <TableHead className="hidden sm:table-cell">Priority</TableHead>
                  <TableHead className="hidden lg:table-cell">Due</TableHead>
                  <TableHead className="w-12 text-end">
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
          )}
        </CardContent>
      </Card>

      <QuickAddTaskDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        projects={projects}
        defaultProjectId={
          initialFilters.project !== "all" ? initialFilters.project : null
        }
      />
    </div>
  );
}
