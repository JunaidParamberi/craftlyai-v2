"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import {
  taskPriorityBadgeVariant,
  taskPriorityLabel,
  taskStatusBadgeVariant,
  taskStatusLabel,
} from "@/lib/tasks/display";
import { deleteTask, updateTask } from "@/lib/tasks/actions";
import { isTaskOverdue } from "@/lib/tasks/task-utils";
import { formatProjectDate } from "@/lib/projects/display";
import type { TaskListRow } from "@/types";

import { Badge } from "@/components/ui/badge";
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
  const showStatusBadge =
    task.status === "in_progress" || task.status === "cancelled";

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
        overdue && "bg-destructive/[0.04] hover:bg-destructive/[0.06]",
      )}
      data-state={isDone ? "done" : undefined}
    >
      <TableCell className="w-10 pe-0">
        <Checkbox
          checked={isDone}
          disabled={isPending}
          onCheckedChange={toggleDone}
          aria-label={
            isDone ? "Mark task as not done" : "Mark task as done"
          }
        />
      </TableCell>
      <TableCell className="min-w-[12rem] whitespace-normal">
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "font-medium leading-snug",
              isDone && "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {showStatusBadge ? (
              <Badge
                variant={taskStatusBadgeVariant(task.status)}
                className="font-normal"
              >
                {taskStatusLabel(task.status)}
              </Badge>
            ) : null}
            {isDone ? (
              <Badge variant="secondary" className="font-normal">
                Done
              </Badge>
            ) : null}
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden min-w-[10rem] whitespace-normal md:table-cell">
        <div className="flex flex-col gap-0.5">
          <Link
            href={`/projects/${task.project.id}`}
            className="font-medium text-foreground text-sm underline-offset-4 hover:text-primary hover:underline"
          >
            {task.project.title}
          </Link>
          {task.project.client ? (
            <span className="text-muted-foreground text-xs">
              {task.project.client.name}
            </span>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant={taskPriorityBadgeVariant(task.priority)}>
          {taskPriorityLabel(task.priority)}
        </Badge>
      </TableCell>
      <TableCell className="hidden text-muted-foreground text-sm lg:table-cell">
        {task.due_date ? (
          <Badge
            variant={overdue ? "destructive" : "outline"}
            className="font-normal tabular-nums"
          >
            {formatProjectDate(task.due_date)}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-end">
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
