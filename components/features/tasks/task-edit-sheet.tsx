"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { deleteTask, updateTask } from "@/lib/tasks/actions";
import {
  taskPriorityLabel,
  taskStatusLabel,
} from "@/lib/tasks/display";
import { TASK_LIMITS, taskCreateSchema } from "@/lib/validations/task";
import type { TaskPriority, TaskRow, TaskStatus } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const STATUSES = ["todo", "in_progress", "done", "cancelled"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;

type TaskEditFormValues = z.infer<typeof taskCreateSchema>;

type TaskEditSheetProps = {
  task: TaskRow | null;
  projectId: string;
  open: boolean;
  onClose: () => void;
  onSaved: (task: TaskRow) => void;
  onDeleted: (taskId: string) => void;
};

export function TaskEditSheet({
  task,
  projectId,
  open,
  onClose,
  onSaved,
  onDeleted,
}: TaskEditSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<TaskEditFormValues>({
    resolver: zodResolver(taskCreateSchema),
    values: task
      ? {
          title: task.title,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date ?? "",
        }
      : undefined,
  });

  function onSubmit(data: TaskEditFormValues) {
    if (!task) return;
    startTransition(async () => {
      const res = await updateTask(projectId, task.id, data);
      if (!res.ok) {
        toast.error(res.message ?? "Failed to update task.");
        return;
      }
      toast.success("Task updated");
      onSaved(res.task);
      onClose();
      router.refresh();
    });
  }

  function onDelete() {
    if (!task) return;
    if (!window.confirm("Delete this task?")) return;
    startTransition(async () => {
      const res = await deleteTask(projectId, task.id);
      if (!res.ok) {
        toast.error(res.message ?? "Failed to delete task.");
        return;
      }
      toast.success("Task deleted");
      onDeleted(task.id);
      onClose();
      router.refresh();
    });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-[400px] sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle>Edit task</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 flex flex-col gap-5 px-1"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kanban-task-title">Title</Label>
            <Input
              id="kanban-task-title"
              maxLength={TASK_LIMITS.title}
              {...form.register("title")}
            />
            {form.formState.errors.title ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(v) =>
                form.setValue("status", v as TaskStatus)
              }
            >
              <SelectTrigger>
                <SelectValue>
                  {taskStatusLabel(form.watch("status"))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {taskStatusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Priority</Label>
            <Select
              value={form.watch("priority")}
              onValueChange={(v) =>
                form.setValue("priority", v as TaskPriority)
              }
            >
              <SelectTrigger>
                <SelectValue>
                  {taskPriorityLabel(form.watch("priority"))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {taskPriorityLabel(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kanban-task-due">Due date</Label>
            <Input
              id="kanban-task-due"
              type="date"
              {...form.register("due_date")}
            />
          </div>

          <SheetFooter className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isPending}
              className="mr-auto"
            >
              Delete
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
