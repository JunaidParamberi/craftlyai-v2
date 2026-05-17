"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  CheckIcon,
  Circle,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { deleteTask, updateTask } from "@/lib/tasks/actions";
import { taskPriorityLabel } from "@/lib/tasks/display";
import { cn } from "@/lib/utils";
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

const PRIORITIES = ["low", "medium", "high"] as const;

type StatusConfig = {
  status: TaskStatus;
  label: string;
  icon: React.ElementType;
  activeBg: string;
  activeBorder: string;
  activeText: string;
  dot: string;
};

const STATUS_CONFIG: StatusConfig[] = [
  {
    status: "todo",
    label: "To Do",
    icon: Circle,
    activeBg: "bg-slate-100 dark:bg-slate-800",
    activeBorder: "border-slate-300 dark:border-slate-600",
    activeText: "text-slate-700 dark:text-slate-200",
    dot: "bg-slate-400 dark:bg-slate-500",
  },
  {
    status: "in_progress",
    label: "In Progress",
    icon: RotateCcw,
    activeBg: "bg-[color-mix(in_srgb,var(--border-focus)_8%,transparent)]",
    activeBorder: "border-[color-mix(in_srgb,var(--border-focus)_40%,transparent)]",
    activeText: "text-[var(--border-focus)]",
    dot: "bg-[var(--border-focus)]",
  },
  {
    status: "done",
    label: "Done",
    icon: CheckCircle2,
    activeBg: "bg-[color-mix(in_srgb,var(--success,#1F8A52)_8%,transparent)]",
    activeBorder: "border-[color-mix(in_srgb,var(--success,#1F8A52)_40%,transparent)]",
    activeText: "text-[var(--success,#1F8A52)]",
    dot: "bg-[var(--success,#1F8A52)]",
  },
  {
    status: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    activeBg: "bg-[color-mix(in_srgb,var(--danger,#C13838)_8%,transparent)]",
    activeBorder: "border-[color-mix(in_srgb,var(--danger,#C13838)_40%,transparent)]",
    activeText: "text-[var(--danger,#C13838)]",
    dot: "bg-[var(--danger,#C13838)]",
  },
];

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

  function handleMoveTo(s: TaskStatus) {
    if (!task) return;
    startTransition(async () => {
      const res = await updateTask(projectId, task.id, { status: s });
      if (!res.ok) {
        toast.error(res.message ?? "Failed to update task.");
        return;
      }
      const cfg = STATUS_CONFIG.find((c) => c.status === s);
      toast.success(`Moved to ${cfg?.label ?? s}`);
      onSaved(res.task);
      onClose();
    });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="flex w-full max-w-[360px] flex-col gap-0 p-0 sm:max-w-[360px]">
        {/* Header */}
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="text-base font-semibold leading-tight line-clamp-2">
            {task?.title ?? "Edit task"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-0 overflow-y-auto flex-1">
          {/* Move to section */}
          {task ? (
            <div className="px-5 py-4 border-b border-border">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Move to
              </p>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_CONFIG.map(({ status: s, label, icon: Icon, activeBg, activeBorder, activeText, dot }) => {
                  const isCurrent = task.status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={isCurrent || isPending}
                      onClick={() => handleMoveTo(s)}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-all duration-150",
                        isCurrent
                          ? cn("cursor-default", activeBg, activeBorder, activeText)
                          : "border-border bg-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground active:scale-[0.98]",
                      )}
                    >
                      <span
                        className={cn(
                          "h-2 w-2 shrink-0 rounded-full",
                          isCurrent ? dot : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50",
                        )}
                      />
                      <span className="flex-1 truncate">{label}</span>
                      {isCurrent && (
                        <CheckIcon className="ml-auto h-3.5 w-3.5 shrink-0 opacity-70" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Edit form */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 px-5 py-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kanban-task-title" className="text-xs font-medium text-muted-foreground">
                Title
              </Label>
              <Input
                id="kanban-task-title"
                maxLength={TASK_LIMITS.title}
                className="h-9 text-sm"
                {...form.register("title")}
              />
              {form.formState.errors.title ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Priority</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(v) => form.setValue("priority", v as TaskPriority)}
              >
                <SelectTrigger className="h-9 text-sm">
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
              <Label htmlFor="kanban-task-due" className="text-xs font-medium text-muted-foreground">
                Due date
              </Label>
              <Input
                id="kanban-task-due"
                type="date"
                className="h-9 text-sm"
                {...form.register("due_date")}
              />
            </div>

            <SheetFooter className="mt-2 flex-row gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDelete}
                disabled={isPending}
                className="mr-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                Delete
              </Button>
              <Button type="submit" size="sm" disabled={isPending} className="px-5">
                {isPending ? "Saving…" : "Save"}
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
