"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { pickEmbed } from "@/lib/supabase/pick-embed";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import {
  parseProjectCreateInput,
  parseProjectUpdateInput,
} from "@/lib/validations/project";
import type { ProjectListRow, ProjectRow, ProjectStatus } from "@/types";

const uuidSchema = z.string().uuid();

type ProjectRowRaw = {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  status: string;
  budget: string | number | null;
  spent: string | number | null;
  start_date: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
};

function normalizeProjectRow(row: ProjectRowRaw): ProjectRow {
  return {
    id: row.id,
    user_id: row.user_id,
    client_id: row.client_id,
    title: row.title,
    status: row.status as ProjectStatus,
    budget:
      row.budget === null || row.budget === undefined
        ? null
        : Number(row.budget),
    spent:
      row.spent === null || row.spent === undefined ? null : Number(row.spent),
    start_date: row.start_date,
    deadline: row.deadline,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeProjectListRow(
  row: ProjectRowRaw & { clients?: unknown },
): ProjectListRow {
  const clientEmbed = pickEmbed(row.clients, "name");
  return {
    ...normalizeProjectRow(row),
    client: clientEmbed
      ? { id: clientEmbed.id, name: clientEmbed.name }
      : null,
  };
}

async function hydrateProjectsWithClients(
  supabase: Awaited<ReturnType<typeof createSupabaseClient>>,
  userId: string,
  projects: ProjectListRow[],
): Promise<ProjectListRow[]> {
  const missingIds = [
    ...new Set(
      projects
        .filter((p) => !p.client && p.client_id)
        .map((p) => p.client_id),
    ),
  ];
  if (missingIds.length === 0) {
    return projects;
  }

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, name")
    .eq("user_id", userId)
    .in("id", missingIds);

  if (error || !clients?.length) {
    return projects;
  }

  const byId = new Map(clients.map((c) => [c.id, c]));
  return projects.map((p) => {
    if (p.client) {
      return p;
    }
    const client = byId.get(p.client_id);
    return client
      ? { ...p, client: { id: client.id, name: client.name } }
      : p;
  });
}

async function clientBelongsToUser(
  supabase: Awaited<ReturnType<typeof createSupabaseClient>>,
  userId: string,
  clientId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("user_id", userId)
    .maybeSingle();

  return !error && !!data;
}

export type ListProjectsResult =
  | { ok: true; projects: ProjectListRow[] }
  | { ok: false; message: string };

const projectSelectWithClient =
  "*, clients:client_id ( id, name )";

export async function listProjects(): Promise<ListProjectsResult> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("projects")
    .select(projectSelectWithClient)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, message: error.message };
  }

  const projects = (data ?? []).map((row) =>
    normalizeProjectListRow(row as ProjectRowRaw & { clients?: unknown }),
  );

  return {
    ok: true,
    projects: await hydrateProjectsWithClients(supabase, user.id, projects),
  };
}

export const getProjectById = cache(async (id: string): Promise<ProjectListRow | null> => {
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return null;
  }

  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("projects")
    .select(projectSelectWithClient)
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const project = normalizeProjectListRow(
    data as ProjectRowRaw & { clients?: unknown },
  );
  const [hydrated] = await hydrateProjectsWithClients(supabase, user.id, [
    project,
  ]);
  return hydrated;
});

export type CreateProjectResult =
  | { ok: true; project: ProjectRow }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function createProject(input: unknown): Promise<CreateProjectResult> {
  const parsed = parseProjectCreateInput(input);
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

  const owned = await clientBelongsToUser(supabase, user.id, parsed.data.client_id);
  if (!owned) {
    return {
      ok: false,
      message: "Client not found or does not belong to your account.",
      fieldErrors: { client_id: ["Invalid client."] },
    };
  }

  const payload = {
    user_id: user.id,
    client_id: parsed.data.client_id,
    title: parsed.data.title,
    status: parsed.data.status,
    budget: parsed.data.budget,
    spent: parsed.data.spent,
    start_date: parsed.data.start_date,
    deadline: parsed.data.deadline,
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select("*")
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: "Project could not be created." };
  }

  revalidatePath("/projects");
  revalidatePath("/projects/new");
  revalidatePath(`/clients/${parsed.data.client_id}`);

  return { ok: true, project: normalizeProjectRow(data as ProjectRowRaw) };
}

export type UpdateProjectResult =
  | { ok: true; project: ProjectRow }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function updateProject(
  id: string,
  input: unknown,
): Promise<UpdateProjectResult> {
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, message: "Invalid project." };
  }

  const parsed = parseProjectUpdateInput(input);
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

  const { data: beforeRow } = await supabase
    .from("projects")
    .select("client_id")
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .maybeSingle();

  if (parsed.data.client_id !== undefined) {
    const owned = await clientBelongsToUser(supabase, user.id, parsed.data.client_id);
    if (!owned) {
      return {
        ok: false,
        message: "Client not found or does not belong to your account.",
        fieldErrors: { client_id: ["Invalid client."] },
      };
    }
  }

  const { data, error } = await supabase
    .from("projects")
    .update(parsed.data)
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: "Project not found or could not be updated." };
  }

  const updated = normalizeProjectRow(data as ProjectRowRaw);
  const prevClientId = beforeRow?.client_id as string | undefined;
  if (prevClientId) {
    revalidatePath(`/clients/${prevClientId}`);
  }
  if (
    updated.client_id &&
    (!prevClientId || updated.client_id !== prevClientId)
  ) {
    revalidatePath(`/clients/${updated.client_id}`);
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${parsedId.data}`);
  revalidatePath(`/projects/${parsedId.data}/edit`);
  revalidatePath("/projects/new");

  return { ok: true, project: updated };
}

export type DeleteProjectResult =
  | { ok: true }
  | { ok: false; message: string };

export async function deleteProject(id: string): Promise<DeleteProjectResult> {
  const parsedId = uuidSchema.safeParse(id);
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

  const { data: beforeDelete } = await supabase
    .from("projects")
    .select("client_id")
    .eq("id", parsedId.data)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error, count } = await supabase
    .from("projects")
    .delete({ count: "exact" })
    .eq("id", parsedId.data)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  if (count === 0) {
    return { ok: false, message: "Project not found." };
  }

  const clientId = beforeDelete?.client_id as string | undefined;
  if (clientId) {
    revalidatePath(`/clients/${clientId}`);
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${parsedId.data}`);
  revalidatePath(`/projects/${parsedId.data}/edit`);
  revalidatePath("/projects/new");

  return { ok: true };
}
