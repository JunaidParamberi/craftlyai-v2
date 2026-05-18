import { z } from "zod";

import type { TaskPriority, TaskStatus } from "@/types";

/** Align with DB `title` text and app limits. */
export const TASK_LIMITS = {
  title: 500,
  label: 24,
  labelsMax: 6,
} as const;

const taskLabelsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Label cannot be empty.")
      .max(TASK_LIMITS.label, `Label must be at most ${TASK_LIMITS.label} characters.`),
  )
  .max(TASK_LIMITS.labelsMax, `At most ${TASK_LIMITS.labelsMax} labels.`);

const TASK_STATUSES = [
  "todo",
  "in_progress",
  "done",
  "cancelled",
] as const satisfies readonly TaskStatus[];

const TASK_PRIORITIES = ["low", "medium", "high"] as const satisfies readonly TaskPriority[];

const taskStatusSchema = z.enum(TASK_STATUSES);
const taskPrioritySchema = z.enum(TASK_PRIORITIES);

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

function parseOptionalDueDate(raw: string): string | null {
  const t = raw.trim();
  if (t === "") {
    return null;
  }
  if (!isoDateRegex.test(t)) {
    return "__invalid__";
  }
  const d = new Date(`${t}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) {
    return "__invalid__";
  }
  return t;
}

export const taskCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(TASK_LIMITS.title),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  due_date: z.string(),
  labels: taskLabelsSchema.optional(),
});

/** Form schema for task edit sheet — labels always present in UI state. */
export const taskEditFormSchema = taskCreateSchema.extend({
  labels: taskLabelsSchema,
});

export type TaskEditFormValues = z.infer<typeof taskEditFormSchema>;

export type TaskCreateFormInput = z.input<typeof taskCreateSchema>;

export type TaskCreatePayload = {
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  labels: string[];
};

export function parseTaskCreateInput(
  raw: unknown,
):
  | { success: true; data: TaskCreatePayload }
  | { success: false; error: z.ZodError } {
  const parsed = taskCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const d = parsed.data;
  const due = parseOptionalDueDate(d.due_date);
  if (due === "__invalid__") {
    return {
      success: false,
      error: new z.ZodError([
        { code: "custom", message: "Use YYYY-MM-DD for due date.", path: ["due_date"] },
      ]),
    };
  }

  return {
    success: true,
    data: {
      title: d.title.trim(),
      status: d.status,
      priority: d.priority,
      due_date: due,
      labels: (d.labels ?? []).map((l) => l.trim()),
    },
  };
}

export const taskUpdateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty.")
    .max(TASK_LIMITS.title)
    .optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  due_date: z.string().optional(),
  labels: taskLabelsSchema.optional(),
});

export type TaskUpdateFormInput = z.input<typeof taskUpdateSchema>;

export type TaskUpdatePayload = Partial<{
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  labels: string[];
}>;

export function parseTaskUpdateInput(
  raw: unknown,
):
  | { success: true; data: TaskUpdatePayload }
  | { success: false; error: z.ZodError } {
  const parsed = taskUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const d = parsed.data;
  const keys = Object.keys(d).filter(
    (k) => d[k as keyof typeof d] !== undefined,
  );
  if (keys.length === 0) {
    return {
      success: false,
      error: new z.ZodError([
        {
          code: "custom",
          message: "Provide at least one field to update.",
          path: [],
        },
      ]),
    };
  }

  const out: TaskUpdatePayload = {};

  if (d.title !== undefined) {
    out.title = d.title.trim();
  }
  if (d.status !== undefined) {
    out.status = d.status;
  }
  if (d.priority !== undefined) {
    out.priority = d.priority;
  }

  if (d.due_date !== undefined) {
    const due = parseOptionalDueDate(d.due_date);
    if (due === "__invalid__") {
      return {
        success: false,
        error: new z.ZodError([
          { code: "custom", message: "Use YYYY-MM-DD for due date.", path: ["due_date"] },
        ]),
      };
    }
    out.due_date = due;
  }

  if (d.labels !== undefined) {
    out.labels = d.labels.map((l) => l.trim());
  }

  return { success: true, data: out };
}
