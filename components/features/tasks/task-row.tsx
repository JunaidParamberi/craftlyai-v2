"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import {
  formatTaskDueDisplay,
  taskPriorityStatusKey,
} from "@/lib/tasks/display";
import { deleteTask, updateTask } from "@/lib/tasks/actions";
import { isTaskOverdue } from "@/lib/tasks/task-utils";
import type { TaskListRow } from "@/types";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type TaskRowProps = {
  task: TaskListRow;
};

export function TaskRow({ task }: TaskRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isDone = task.status === "done";
  const overdue = isTaskOverdue(task);
  const due = formatTaskDueDisplay(task);

  function refresh() {
    router.refresh();
  }

  function toggleDone() {
    startTransition(async () => {
      const next = task.status === "done" ? "todo" : "done";
      const res = await updateTask(task.project_id, task.id, { status: next });
      if (!res.ok) {
        toast.error(res.message ?? "Failed to update task.");
        return;
      }
      refresh();
    });
  }

  function removeTask() {
    startTransition(async () => {
      const res = await deleteTask(task.project_id, task.id);
      if (!res.ok) {
        toast.error(res.message ?? "Failed to delete task.");
        return;
      }
      toast.success("Task deleted");
      refresh();
    });
  }

  return (
    <TableRow
      className={cn(
        "tasks-table-row border-b border-border",
        overdue &&
          "bg-[color-mix(in_srgb,var(--danger)_6%,transparent)] hover:bg-[color-mix(in_srgb,var(--danger)_8%,transparent)]",
      )}
      data-state={isDone ? "done" : undefined}
    >
      <TableCell className="tasks-table-cell w-10 pe-0">
        <Checkbox
          checked={isDone}
          disabled={isPending}
          onCheckedChange={toggleDone}
          aria-label={
            isDone ? "Mark task as not done" : "Mark task as done"
          }
        />
      </TableCell>
      <TableCell className="tasks-table-cell min-w-[12rem] whitespace-normal">
        <div className="flex flex-col gap-1.5">
          <span
            className={cn(
              "text-sm font-medium leading-snug",
              isDone && "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </span>
          <div className="flex flex-wrap items-center gap-1.5 md:hidden">
            <Link
              href={`/projects/${task.project.id}`}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {task.project.title}
            </Link>
            <StatusBadge status={task.status} dot />
            <StatusBadge status={taskPriorityStatusKey(task.priority)} dot />
            <span className={cn("text-xs tabular-nums", due.className)}>
              {due.label}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="tasks-table-cell hidden min-w-[10rem] whitespace-normal md:table-cell">
        <Link
          href={`/projects/${task.project.id}`}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {task.project.title}
        </Link>
      </TableCell>
      <TableCell className="tasks-table-cell hidden sm:table-cell">
        <StatusBadge status={task.status} dot />
      </TableCell>
      <TableCell className="tasks-table-cell hidden sm:table-cell">
        <StatusBadge status={taskPriorityStatusKey(task.priority)} dot />
      </TableCell>
      <TableCell
        className={cn(
          "tasks-table-cell hidden text-sm lg:table-cell",
          due.className,
        )}
      >
        {due.label}
      </TableCell>
      <TableCell className="tasks-table-cell text-end">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${task.title}`}
              >
                <MoreHorizontal data-icon="inline-start" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              render={
                <Link href={`/projects/${task.project.id}`} />
              }
            >
              View project
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={removeTask}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
