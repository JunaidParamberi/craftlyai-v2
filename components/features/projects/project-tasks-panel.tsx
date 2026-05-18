"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createTask, updateTask } from "@/lib/tasks/actions";
import { formatProjectDate } from "@/lib/projects/display";
import { isTaskOverdue } from "@/lib/tasks/task-utils";
import { TASK_LIMITS } from "@/lib/validations/task";
import type { TaskPriority, TaskRow, TaskStatus } from "@/types";

import { KanbanBoard } from "@/components/features/tasks/kanban-board";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormDatePicker } from "@/components/shared/form-date-picker";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export type ProjectTaskFilters = {
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  sortBy: "due" | "created";
};

type ProjectTasksPanelProps = {
  projectId: string;
  initialTasks: TaskRow[];
  viewMode: "list" | "board";
  filters: ProjectTaskFilters;
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
  viewMode,
  filters,
}: ProjectTasksPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addOpen, setAddOpen] = useState(false);
  const [addDefaultStatus, setAddDefaultStatus] = useState<TaskStatus>("todo");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskDialogValues>({
    defaultValues: emptyTaskForm,
  });

  const filteredTasks = useMemo(() => {
    let list = [...initialTasks];
    if (filters.status !== "all") {
      list = list.filter((t) => t.status === filters.status);
    }
    if (filters.priority !== "all") {
      list = list.filter((t) => t.priority === filters.priority);
    }
    list.sort((a, b) => {
      if (filters.sortBy === "created") {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
      const ad = a.due_date ? new Date(`${a.due_date}T12:00:00Z`).getTime() : 0;
      const bd = b.due_date ? new Date(`${b.due_date}T12:00:00Z`).getTime() : 0;
      if (ad !== bd) return ad - bd;
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
    return list;
  }, [initialTasks, filters]);

  function refresh() {
    router.refresh();
  }

  function openAddTask(status: TaskStatus = "todo") {
    setFormError(null);
    setAddDefaultStatus(status);
    setAddOpen(true);
  }

  function onAddTask(values: TaskDialogValues) {
    setFormError(null);
    startTransition(async () => {
      const res = await createTask(projectId, {
        title: values.title,
        priority: values.priority,
        due_date: values.due_date,
        status: addDefaultStatus,
        labels: [],
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

  if (viewMode === "board") {
    return (
      <>
        <KanbanBoard
          tasks={initialTasks}
          projectId={projectId}
          onAddTask={openAddTask}
        />
        <AddTaskDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          onSubmit={onAddTask}
          register={register}
          control={control}
          handleSubmit={handleSubmit}
          errors={errors}
          formError={formError}
          isPending={isPending}
          onClose={() => setAddDefaultStatus("todo")}
        />
      </>
    );
  }

  return (
    <div className="min-w-0">
      {filteredTasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="font-medium text-sm">No tasks yet</p>
            <p className="max-w-sm text-muted-foreground text-sm">
              Add tasks to track deliverables and completion for this project.
            </p>
            <Button type="button" size="sm" onClick={() => openAddTask("todo")}>
              <Plus />
              Add task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="tasks-table-head w-8" />
                <TableHead className="tasks-table-head">Task</TableHead>
                <TableHead className="tasks-table-head">Status</TableHead>
                <TableHead className="tasks-table-head">Priority</TableHead>
                <TableHead className="tasks-table-head">Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => {
                const isDone = task.status === "done";
                const overdue = isTaskOverdue(task);
                return (
                  <TableRow key={task.id} className="tasks-table-row">
                    <TableCell className="tasks-table-cell w-8">
                      <input
                        type="checkbox"
                        className="size-4 rounded border border-input accent-primary"
                        checked={isDone}
                        disabled={isPending}
                        onChange={() => toggleDone(task)}
                        aria-label={
                          isDone ? "Mark task as not done" : "Mark task as done"
                        }
                      />
                    </TableCell>
                    <TableCell className="tasks-table-cell">
                      <p
                        className={cn(
                          "font-medium text-sm",
                          isDone && "text-muted-foreground line-through",
                        )}
                      >
                        {task.title}
                      </p>
                    </TableCell>
                    <TableCell className="tasks-table-cell">
                      <StatusBadge status={task.status} dot />
                    </TableCell>
                    <TableCell className="tasks-table-cell">
                      <StatusBadge
                        status={
                          task.priority === "high"
                            ? "high"
                            : task.priority === "medium"
                              ? "med"
                              : "low"
                        }
                      />
                    </TableCell>
                    <TableCell
                      className={cn(
                        "tasks-table-cell tabular-nums text-sm",
                        overdue && !isDone && "text-destructive",
                      )}
                    >
                      {task.due_date ? formatProjectDate(task.due_date) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AddTaskDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={onAddTask}
        register={register}
        control={control}
        handleSubmit={handleSubmit}
        errors={errors}
        formError={formError}
        isPending={isPending}
        onClose={() => setAddDefaultStatus("todo")}
      />
    </div>
  );
}

type AddTaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TaskDialogValues) => void;
  register: ReturnType<typeof useForm<TaskDialogValues>>["register"];
  control: ReturnType<typeof useForm<TaskDialogValues>>["control"];
  handleSubmit: ReturnType<typeof useForm<TaskDialogValues>>["handleSubmit"];
  errors: ReturnType<typeof useForm<TaskDialogValues>>["formState"]["errors"];
  formError: string | null;
  isPending: boolean;
  onClose: () => void;
};

function AddTaskDialog({
  open,
  onOpenChange,
  onSubmit,
  register,
  control,
  handleSubmit,
  errors,
  formError,
  isPending,
  onClose,
}: AddTaskDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) onClose();
      }}
    >
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>
            Add a deliverable or to-do for this project.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
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
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
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
              onClick={() => onOpenChange(false)}
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
  );
}
