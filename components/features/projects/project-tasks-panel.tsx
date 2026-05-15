"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createTask,
  deleteTask,
  updateTask,
} from "@/lib/tasks/actions";
import {
  taskPriorityBadgeVariant,
  taskPriorityLabel,
} from "@/lib/tasks/display";
import { TASK_LIMITS } from "@/lib/validations/task";
import type { TaskPriority, TaskRow, TaskStatus } from "@/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FormDatePicker } from "@/components/shared/form-date-picker";
import { formatProjectDate } from "@/lib/projects/display";
import {
  CircleCheck,
  MoreVertical,
  Plus,
  Sparkles,
} from "lucide-react";

type ProjectTasksPanelProps = {
  projectId: string;
  initialTasks: TaskRow[];
};

type TaskDialogValues = {
  title: string;
  priority: TaskPriority;
  due_date: string;
};

const emptyTaskForm: TaskDialogValues = {
  title: "",
  priority: "medium",
  due_date: "",
};

export function ProjectTasksPanel({
  projectId,
  initialTasks,
}: ProjectTasksPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addOpen, setAddOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"due" | "created">("due");

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskDialogValues>({
    defaultValues: emptyTaskForm,
  });

  const sortedTasks = useMemo(() => {
    const copy = [...initialTasks];
    copy.sort((a, b) => {
      if (sortBy === "created") {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
      const ad = a.due_date ? new Date(`${a.due_date}T12:00:00Z`).getTime() : 0;
      const bd = b.due_date ? new Date(`${b.due_date}T12:00:00Z`).getTime() : 0;
      if (ad !== bd) {
        return ad - bd;
      }
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
    return copy;
  }, [initialTasks, sortBy]);

  const doneCount = initialTasks.filter((t) => t.status === "done").length;
  const total = initialTasks.length;
  const progressPct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  function refresh() {
    router.refresh();
  }

  function onAddTask(values: TaskDialogValues) {
    setFormError(null);
    startTransition(async () => {
      const res = await createTask(projectId, {
        title: values.title,
        priority: values.priority,
        due_date: values.due_date,
        status: "todo",
      });
      if (!res.ok) {
        setFormError(res.message);
        toast.error(res.message ?? "Failed to add task.");
        return;
      }
      toast.success("Task added");
      reset(emptyTaskForm);
      setAddOpen(false);
      refresh();
    });
  }

  function toggleDone(task: TaskRow) {
    startTransition(async () => {
      const next: TaskStatus = task.status === "done" ? "todo" : "done";
      const res = await updateTask(projectId, task.id, { status: next });
      if (!res.ok) {
        toast.error(res.message ?? "Failed to update task.");
        return;
      }
      refresh();
    });
  }

  function removeTask(taskId: string) {
    startTransition(async () => {
      const res = await deleteTask(projectId, taskId);
      if (!res.ok) {
        toast.error(res.message ?? "Failed to delete task.");
        return;
      }
      toast.success("Task deleted");
      refresh();
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(260px,300px)] lg:items-start">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled
              className="pointer-events-none opacity-70"
            >
              Filter
            </Button>
            <Select
              value={sortBy}
              onValueChange={(v) => {
                if (v === "due" || v === "created") {
                  setSortBy(v);
                }
              }}
            >
              <SelectTrigger size="sm" className="w-[min(100%,10rem)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="due">Sort by due date</SelectItem>
                  <SelectItem value="created">Sort by created</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1 self-start sm:self-auto"
            onClick={() => {
              setFormError(null);
              setAddOpen(true);
            }}
          >
            <Plus />
            Add task
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {sortedTasks.length === 0 ? (
            <Card className="border-dashed border-border/80">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="font-medium text-sm">No tasks yet</p>
                <p className="max-w-sm text-muted-foreground text-sm">
                  Add tasks to track deliverables and completion for this project.
                </p>
                <Button type="button" size="sm" onClick={() => setAddOpen(true)}>
                  <Plus />
                  Add task
                </Button>
              </CardContent>
            </Card>
          ) : (
            sortedTasks.map((task) => {
              const isDone = task.status === "done";
              return (
                <Card
                  key={task.id}
                  className="border-border/80 shadow-sm transition-colors"
                >
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4">
                    <div className="flex shrink-0 items-start pt-0.5">
                      <input
                        type="checkbox"
                        className="mt-1 size-4 rounded border border-input accent-primary"
                        checked={isDone}
                        disabled={isPending}
                        onChange={() => toggleDone(task)}
                        aria-label={
                          isDone ? "Mark task as not done" : "Mark task as done"
                        }
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p
                          className={
                            isDone
                              ? "font-medium text-muted-foreground text-sm line-through"
                              : "font-medium text-sm"
                          }
                        >
                          {task.title}
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 shrink-0 rounded-full"
                                aria-label={`Task actions for ${task.title}`}
                              >
                                <MoreVertical className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => removeTask(task.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={taskPriorityBadgeVariant(task.priority)}>
                          {taskPriorityLabel(task.priority)}
                        </Badge>
                        {task.due_date ? (
                          <Badge variant="secondary" className="font-normal">
                            {formatProjectDate(task.due_date)}
                          </Badge>
                        ) : null}
                        {isDone ? (
                          <Badge variant="secondary" className="font-normal">
                            <CircleCheck className="size-3" />
                            Completed
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Task progress</CardTitle>
            <CardDescription>
              {total === 0
                ? "Add tasks to see completion here."
                : `${doneCount} of ${total} completed`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="font-heading text-3xl font-semibold tabular-nums">
              {progressPct}%
            </p>
            <Progress value={progressPct} className="h-2" />
            <Separator />
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                Tracked time
              </p>
              <p className="font-medium text-sm">—</p>
              <p className="text-muted-foreground text-xs">
                Time tracking connects in a later release.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <Sparkles className="size-4 shrink-0 text-muted-foreground" />
            <CardTitle className="text-base">Project insights</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              When the AI layer is on, Craftly will summarize velocity, risks,
              and suggested check-ins for this project.
            </p>
            <Button type="button" variant="outline" size="sm" disabled>
              Draft status update
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
            <DialogDescription>
              Add a deliverable or to-do for this project.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onAddTask)}
          >
            {formError ? (
              <p className="text-destructive text-sm" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="flex flex-col gap-2">
              <Label htmlFor="task_title">Title</Label>
              <Input
                id="task_title"
                maxLength={TASK_LIMITS.title}
                aria-invalid={Boolean(errors.title)}
                {...register("title", { required: "Title is required." })}
              />
              {errors.title ? (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="task_priority">Priority</Label>
                <select
                  id="task_priority"
                  className="flex h-9 w-full rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                  {...register("priority")}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="task_due">Due date</Label>
                <Controller
                  name="due_date"
                  control={control}
                  render={({ field }) => (
                    <FormDatePicker
                      id="task_due"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Due date"
                    />
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adding…" : "Add task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
