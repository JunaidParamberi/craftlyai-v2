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
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { deleteTask, updateTask } from "@/lib/tasks/actions";
import { taskPriorityLabel } from "@/lib/tasks/display";
import { cn } from "@/lib/utils";
import {
  TASK_LIMITS,
  taskEditFormSchema,
  type TaskEditFormValues,
} from "@/lib/validations/task";
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
    activeBg: "bg-[color-mix(in_srgb,var(--fg-3)_12%,transparent)]",
    activeBorder: "border-[color-mix(in_srgb,var(--fg-3)_35%,transparent)]",
    activeText: "text-[var(--fg-2)]",
    dot: "bg-[var(--fg-3)]",
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
    activeBg: "bg-[color-mix(in_srgb,var(--success)_8%,transparent)]",
    activeBorder: "border-[color-mix(in_srgb,var(--success)_40%,transparent)]",
    activeText: "text-[var(--success)]",
    dot: "bg-[var(--success)]",
  },
  {
    status: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    activeBg: "bg-[color-mix(in_srgb,var(--danger)_8%,transparent)]",
    activeBorder: "border-[color-mix(in_srgb,var(--danger)_40%,transparent)]",
    activeText: "text-[var(--danger)]",
    dot: "bg-[var(--danger)]",
  },
];

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
  const [labelInput, setLabelInput] = useState("");

  const form = useForm<TaskEditFormValues>({
    resolver: zodResolver(taskEditFormSchema),
    values: task
      ? {
          title: task.title,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date ?? "",
          labels: task.labels ?? [],
        }
      : undefined,
  });

  const labels = form.watch("labels") ?? [];

  function addLabel() {
    const next = labelInput.trim();
    if (!next || labels.length >= TASK_LIMITS.labelsMax) {
      return;
    }
    if (labels.includes(next)) {
      setLabelInput("");
      return;
    }
    form.setValue("labels", [...labels, next]);
    setLabelInput("");
  }

  function removeLabel(label: string) {
    form.setValue(
      "labels",
      labels.filter((l) => l !== label),
    );
  }

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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kanban-task-labels" className="text-xs font-medium text-muted-foreground">
                Labels
              </Label>
              {labels.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {labels.map((l) => (
                    <button
                      key={l}
                      type="button"
                      className="task-label-badge inline-flex items-center gap-1"
                      onClick={() => removeLabel(l)}
                      aria-label={`Remove label ${l}`}
                    >
                      {l}
                      <span aria-hidden>×</span>
                    </button>
                  ))}
                </div>
              ) : null}
              <Input
                id="kanban-task-labels"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLabel();
                  }
                }}
                placeholder="Type and press Enter"
                className="h-9 text-sm"
                maxLength={TASK_LIMITS.label}
                disabled={labels.length >= TASK_LIMITS.labelsMax}
              />
              <p className="text-xs text-muted-foreground">
                Up to {TASK_LIMITS.labelsMax} labels, {TASK_LIMITS.label} characters each.
              </p>
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
