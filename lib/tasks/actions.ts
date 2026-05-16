"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { parseTaskCreateInput, parseTaskUpdateInput } from "@/lib/validations/task";
import type { TaskPriority, TaskRow, TaskStatus } from "@/types";

const uuidSchema = z.string().uuid();

type TaskRowRaw = {
  id: string;
  project_id: string;
  title: string;
  status: string;
  due_date: string | null;
  priority: string;
  created_at: string;
  updated_at: string;
};

function normalizeTaskRow(row: TaskRowRaw): TaskRow {
  return {
    id: row.id,
    project_id: row.project_id,
    title: row.title,
    status: row.status as TaskStatus,
    due_date: row.due_date,
    priority: row.priority as TaskPriority,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function projectBelongsToUser(
  supabase: Awaited<ReturnType<typeof createSupabaseClient>>,
  userId: string,
  projectId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  return !error && !!data;
}

function revalidateTaskPaths(projectId: string) {
  revalidatePath("/tasks");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/edit`);
  revalidatePath("/projects/new");
  revalidateTag("tasks");
  revalidateTag("dashboard");
}

export type ListTasksForProjectResult =
  | { ok: true; tasks: TaskRow[] }
  | { ok: false; message: string };

export async function listTasksForProject(
  projectId: string,
): Promise<ListTasksForProjectResult> {
  const parsedId = uuidSchema.safeParse(projectId);
  if (!parsedId.success) {
    return { ok: false, message: "Invalid project." };
  }

  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const owned = await projectBelongsToUser(supabase, user.id, parsedId.data);
  if (!owned) {
    return { ok: false, message: "Project not found." };
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", parsedId.data)
    .order("created_at", { ascending: true });

  if (error) {
    return { ok: false, message: error.message };
  }

  return {
    ok: true,
    tasks: (data ?? []).map((row) => normalizeTaskRow(row as TaskRowRaw)),
  };
}

export type CreateTaskResult =
  | { ok: true; task: TaskRow }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function createTask(
  projectId: string,
  input: unknown,
): Promise<CreateTaskResult> {
  const parsedProjectId = uuidSchema.safeParse(projectId);
  if (!parsedProjectId.success) {
    return { ok: false, message: "Invalid project." };
  }

  const parsed = parseTaskCreateInput(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      message: "Validation failed.",
      fieldErrors: flat.fieldErrors as Record<string, string[] | undefined>,
    };
  }

  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const owned = await projectBelongsToUser(
    supabase,
    user.id,
    parsedProjectId.data,
  );
  if (!owned) {
    return { ok: false, message: "Project not found." };
  }

  const payload = {
    project_id: parsedProjectId.data,
    title: parsed.data.title,
    status: parsed.data.status,
    priority: parsed.data.priority,
    due_date: parsed.data.due_date,
  };

  const { data, error } = await supabase
    .from("tasks")
    .insert(payload)
    .select("*")
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: "Task could not be created." };
  }

  revalidateTaskPaths(parsedProjectId.data);

  return { ok: true, task: normalizeTaskRow(data as TaskRowRaw) };
}

export type UpdateTaskResult =
  | { ok: true; task: TaskRow }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function updateTask(
  projectId: string,
  taskId: string,
  input: unknown,
): Promise<UpdateTaskResult> {
  const parsedProjectId = uuidSchema.safeParse(projectId);
  const parsedTaskId = uuidSchema.safeParse(taskId);
  if (!parsedProjectId.success || !parsedTaskId.success) {
    return { ok: false, message: "Invalid project or task." };
  }

  const parsed = parseTaskUpdateInput(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      message: "Validation failed.",
      fieldErrors: flat.fieldErrors as Record<string, string[] | undefined>,
    };
  }

  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const owned = await projectBelongsToUser(
    supabase,
    user.id,
    parsedProjectId.data,
  );
  if (!owned) {
    return { ok: false, message: "Project not found." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("tasks")
    .select("id")
    .eq("id", parsedTaskId.data)
    .eq("project_id", parsedProjectId.data)
    .maybeSingle();

  if (fetchError || !existing) {
    return { ok: false, message: "Task not found." };
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(parsed.data)
    .eq("id", parsedTaskId.data)
    .eq("project_id", parsedProjectId.data)
    .select("*")
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: "Task not found or could not be updated." };
  }

  revalidateTaskPaths(parsedProjectId.data);

  return { ok: true, task: normalizeTaskRow(data as TaskRowRaw) };
}

export type DeleteTaskResult =
  | { ok: true }
  | { ok: false; message: string };

export async function deleteTask(
  projectId: string,
  taskId: string,
): Promise<DeleteTaskResult> {
  const parsedProjectId = uuidSchema.safeParse(projectId);
  const parsedTaskId = uuidSchema.safeParse(taskId);
  if (!parsedProjectId.success || !parsedTaskId.success) {
    return { ok: false, message: "Invalid project or task." };
  }

  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const owned = await projectBelongsToUser(
    supabase,
    user.id,
    parsedProjectId.data,
  );
  if (!owned) {
    return { ok: false, message: "Project not found." };
  }

  const { error, count } = await supabase
    .from("tasks")
    .delete({ count: "exact" })
    .eq("id", parsedTaskId.data)
    .eq("project_id", parsedProjectId.data);

  if (error) {
    return { ok: false, message: error.message };
  }

  if (count === 0) {
    return { ok: false, message: "Task not found." };
  }

  revalidateTaskPaths(parsedProjectId.data);

  return { ok: true };
}
