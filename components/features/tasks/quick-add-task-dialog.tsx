"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createTask } from "@/lib/tasks/actions";
import { TASK_LIMITS } from "@/lib/validations/task";
import type { ProjectListRow, TaskPriority } from "@/types";

import { FormDatePicker } from "@/components/shared/form-date-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROJECT_PLACEHOLDER = "__select_project__";

type QuickAddFormValues = {
  project_id: string;
  title: string;
  priority: TaskPriority;
  due_date: string;
};

const emptyForm: QuickAddFormValues = {
  project_id: PROJECT_PLACEHOLDER,
  title: "",
  priority: "medium",
  due_date: "",
};

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

type QuickAddTaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: ProjectListRow[];
  defaultProjectId?: string | null;
};

export function QuickAddTaskDialog({
  open,
  onOpenChange,
  projects,
  defaultProjectId,
}: QuickAddTaskDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuickAddFormValues>({
    defaultValues: {
      ...emptyForm,
      project_id: defaultProjectId ?? PROJECT_PLACEHOLDER,
    },
  });

  const projectId = watch("project_id");
  const priority = watch("priority");
  const projectLabel =
    projects.find((p) => p.id === projectId)?.title ?? "Select project";

  function onSubmit(values: QuickAddFormValues) {
    setFormError(null);
    if (
      values.project_id === PROJECT_PLACEHOLDER ||
      !values.project_id.trim()
    ) {
      setFormError("Choose a project for this task.");
      return;
    }

    startTransition(async () => {
      const res = await createTask(values.project_id, {
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
      reset({
        ...emptyForm,
        project_id: defaultProjectId ?? PROJECT_PLACEHOLDER,
      });
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>
            Add a deliverable and link it to a project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            {formError ? (
              <p className="text-destructive text-sm" role="alert">
                {formError}
              </p>
            ) : null}

            <Field data-invalid={projectId === PROJECT_PLACEHOLDER && Boolean(formError)}>
              <FieldLabel>Project</FieldLabel>
              <input type="hidden" {...register("project_id")} />
              <Select
                value={projectId}
                onValueChange={(v) => {
                  if (v) setValue("project_id", v, { shouldValidate: true });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {projectId === PROJECT_PLACEHOLDER
                      ? "Select project"
                      : projectLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field data-invalid={Boolean(errors.title)}>
              <FieldLabel htmlFor="global_task_title">Title</FieldLabel>
              <Input
                id="global_task_title"
                maxLength={TASK_LIMITS.title}
                aria-invalid={Boolean(errors.title)}
                {...register("title", { required: "Title is required." })}
              />
              {errors.title ? (
                <FieldError>{errors.title.message}</FieldError>
              ) : null}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Priority</FieldLabel>
                <input type="hidden" {...register("priority")} />
                <Select
                  value={priority}
                  onValueChange={(v) => {
                    if (v === "low" || v === "medium" || v === "high") {
                      setValue("priority", v, { shouldValidate: true });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {PRIORITY_OPTIONS.find((o) => o.value === priority)
                        ?.label ?? "Medium"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PRIORITY_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="global_task_due">Due date</FieldLabel>
                <Controller
                  name="due_date"
                  control={control}
                  render={({ field }) => (
                    <FormDatePicker
                      id="global_task_due"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Optional"
                    />
                  )}
                />
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter className="mt-6">
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
