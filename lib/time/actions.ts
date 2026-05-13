"use server";

import { revalidatePath } from "next/cache";

import { pickEmbed } from "@/lib/supabase/pick-embed";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import {
  parseTimeEntryManualCompleteInput,
  parseTimeEntryStartInput,
  parseUpdateRunningTimerDescriptionInput,
} from "@/lib/validations/time-entry";
import type { TimeEntryListRow, TimeEntryRow } from "@/types";

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

function revalidateTimePaths() {
  revalidatePath("/time");
}

type TimeEntryRowRaw = {
  id: string;
  user_id: string;
  project_id: string;
  task_id: string | null;
  description: string | null;
  started_at: string;
  ended_at: string | null;
  paused_at: string | null;
  total_paused_seconds: number | string;
  duration_seconds: number | string | null;
  billed: boolean;
  created_at: string;
  updated_at: string;
};

function normalizeTotalPausedSeconds(raw: number | string | null | undefined): number {
  if (raw === null || raw === undefined) {
    return 0;
  }
  return typeof raw === "number" ? raw : Number(raw);
}

/** Billable seconds when stopping: wall time minus completed pauses and current pause segment. */
function computeStoppedDurationSeconds(args: {
  started_at: string;
  ended_at: string;
  total_paused_seconds: number;
  paused_at: string | null;
}): number {
  const endMs = new Date(args.ended_at).getTime();
  const startMs = new Date(args.started_at).getTime();
  const wallSeconds = Math.floor((endMs - startMs) / 1000);
  let paused = args.total_paused_seconds;
  if (args.paused_at) {
    paused += Math.floor(
      (endMs - new Date(args.paused_at).getTime()) / 1000,
    );
  }
  return Math.max(0, wallSeconds - paused);
}

function normalizeTimeEntryRow(row: TimeEntryRowRaw): TimeEntryRow {
  const dur = row.duration_seconds;
  return {
    id: row.id,
    user_id: row.user_id,
    project_id: row.project_id,
    task_id: row.task_id,
    description: row.description ?? null,
    started_at: row.started_at,
    ended_at: row.ended_at,
    paused_at: row.paused_at ?? null,
    total_paused_seconds: normalizeTotalPausedSeconds(row.total_paused_seconds),
    duration_seconds:
      dur === null || dur === undefined
        ? null
        : typeof dur === "number"
          ? dur
          : Number(dur),
    billed: row.billed,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeTimeEntryListRow(
  raw: TimeEntryRowRaw & {
    projects?: unknown;
    tasks?: unknown;
  },
): TimeEntryListRow {
  const base = normalizeTimeEntryRow(raw);
  const projectEmbed = pickEmbed(raw.projects, "title");
  const taskEmbed = pickEmbed(raw.tasks, "title");
  return {
    ...base,
    project: projectEmbed
      ? { id: projectEmbed.id, title: projectEmbed.title }
      : null,
    task: taskEmbed ? { id: taskEmbed.id, title: taskEmbed.title } : null,
  };
}

async function hydrateTimeEntriesWithRelations(
  supabase: Awaited<ReturnType<typeof createSupabaseClient>>,
  userId: string,
  entries: TimeEntryListRow[],
): Promise<TimeEntryListRow[]> {
  const missingProjectIds = [
    ...new Set(
      entries
        .filter((e) => !e.project && e.project_id)
        .map((e) => e.project_id),
    ),
  ];
  const missingTaskIds = [
    ...new Set(
      entries
        .filter((e) => !e.task && e.task_id)
        .map((e) => e.task_id as string),
    ),
  ];

  if (missingProjectIds.length === 0 && missingTaskIds.length === 0) {
    return entries;
  }

  const [projectsRes, tasksRes] = await Promise.all([
    missingProjectIds.length > 0
      ? supabase
          .from("projects")
          .select("id, title")
          .eq("user_id", userId)
          .in("id", missingProjectIds)
      : Promise.resolve({ data: [], error: null }),
    missingTaskIds.length > 0
      ? supabase.from("tasks").select("id, title").in("id", missingTaskIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const projectsById = new Map(
    (projectsRes.data ?? []).map((p) => [p.id, p]),
  );
  const tasksById = new Map((tasksRes.data ?? []).map((t) => [t.id, t]));

  return entries.map((entry) => {
    let next = entry;
    if (!next.project) {
      const project = projectsById.get(entry.project_id);
      if (project) {
        next = {
          ...next,
          project: { id: project.id, title: project.title },
        };
      }
    }
    if (!next.task && entry.task_id) {
      const task = tasksById.get(entry.task_id);
      if (task) {
        next = { ...next, task: { id: task.id, title: task.title } };
      }
    }
    return next;
  });
}

async function normalizeHydratedTimeEntry(
  supabase: Awaited<ReturnType<typeof createSupabaseClient>>,
  userId: string,
  raw: TimeEntryRowRaw & { projects?: unknown; tasks?: unknown },
): Promise<TimeEntryListRow> {
  const entry = normalizeTimeEntryListRow(raw);
  const [hydrated] = await hydrateTimeEntriesWithRelations(supabase, userId, [
    entry,
  ]);
  return hydrated;
}

const timeEntrySelect = `
  *,
  projects:project_id ( id, title ),
  tasks:task_id ( id, title )
`;

export type ListTimeEntriesResult =
  | { ok: true; entries: TimeEntryListRow[] }
  | { ok: false; message: string };

export async function listTimeEntries(): Promise<ListTimeEntriesResult> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("time_entries")
    .select(timeEntrySelect)
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  if (error) {
    return { ok: false, message: error.message };
  }

  const entries = (data ?? []).map((row) =>
    normalizeTimeEntryListRow(
      row as TimeEntryRowRaw & { projects?: unknown; tasks?: unknown },
    ),
  );

  return {
    ok: true,
    entries: await hydrateTimeEntriesWithRelations(supabase, user.id, entries),
  };
}

export type CreateManualTimeEntryResult =
  | { ok: true; entry: TimeEntryListRow }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function createManualTimeEntry(
  input: unknown,
): Promise<CreateManualTimeEntryResult> {
  const parsed = parseTimeEntryManualCompleteInput(input);
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
    parsed.data.project_id,
  );
  if (!owned) {
    return { ok: false, message: "Project not found." };
  }

  const insertPayload = {
    user_id: user.id,
    project_id: parsed.data.project_id,
    task_id: parsed.data.task_id,
    description: parsed.data.description,
    started_at: parsed.data.started_at,
    ended_at: parsed.data.ended_at,
    duration_seconds: parsed.data.duration_seconds,
    billed: false,
  };

  const { data, error } = await supabase
    .from("time_entries")
    .insert(insertPayload)
    .select(timeEntrySelect)
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: "Time entry could not be created." };
  }

  revalidateTimePaths();

  return {
    ok: true,
    entry: await normalizeHydratedTimeEntry(
      supabase,
      user.id,
      data as TimeEntryRowRaw & { projects?: unknown; tasks?: unknown },
    ),
  };
}

export type StartTimerResult =
  | { ok: true; entry: TimeEntryListRow }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function startTimer(input: unknown): Promise<StartTimerResult> {
  const parsed = parseTimeEntryStartInput(input);
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
    parsed.data.project_id,
  );
  if (!owned) {
    return { ok: false, message: "Project not found." };
  }

  const insertPayload = {
    user_id: user.id,
    project_id: parsed.data.project_id,
    task_id: parsed.data.task_id,
    description: parsed.data.description,
    started_at: parsed.data.started_at,
    ended_at: null,
    paused_at: null,
    total_paused_seconds: 0,
    duration_seconds: null,
    billed: false,
  };

  const { data, error } = await supabase
    .from("time_entries")
    .insert(insertPayload)
    .select(timeEntrySelect)
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        message: "You already have a timer running. Stop it before starting another.",
      };
    }
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: "Timer could not be started." };
  }

  revalidateTimePaths();

  return {
    ok: true,
    entry: await normalizeHydratedTimeEntry(
      supabase,
      user.id,
      data as TimeEntryRowRaw & { projects?: unknown; tasks?: unknown },
    ),
  };
}

export type StopTimerResult =
  | { ok: true; entry: TimeEntryListRow }
  | { ok: false; message: string };

export async function stopTimer(): Promise<StopTimerResult> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const { data: open, error: fetchError } = await supabase
    .from("time_entries")
    .select("id, started_at, paused_at, total_paused_seconds")
    .eq("user_id", user.id)
    .is("ended_at", null)
    .maybeSingle();

  if (fetchError) {
    return { ok: false, message: fetchError.message };
  }

  if (!open) {
    return { ok: false, message: "No running timer." };
  }

  const endedAt = new Date().toISOString();
  const duration_seconds = computeStoppedDurationSeconds({
    started_at: open.started_at,
    ended_at: endedAt,
    total_paused_seconds: normalizeTotalPausedSeconds(
      open.total_paused_seconds,
    ),
    paused_at: open.paused_at,
  });

  const { data, error } = await supabase
    .from("time_entries")
    .update({
      ended_at: endedAt,
      duration_seconds,
      paused_at: null,
    })
    .eq("id", open.id)
    .select(timeEntrySelect)
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: "Timer could not be stopped." };
  }

  revalidateTimePaths();

  return {
    ok: true,
    entry: await normalizeHydratedTimeEntry(
      supabase,
      user.id,
      data as TimeEntryRowRaw & { projects?: unknown; tasks?: unknown },
    ),
  };
}

export type UpdateRunningTimerDescriptionResult =
  | { ok: true; entry: TimeEntryListRow }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function updateRunningTimerDescription(
  input: unknown,
): Promise<UpdateRunningTimerDescriptionResult> {
  const parsed = parseUpdateRunningTimerDescriptionInput(input);
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

  const { data: open, error: fetchError } = await supabase
    .from("time_entries")
    .select("id")
    .eq("user_id", user.id)
    .is("ended_at", null)
    .maybeSingle();

  if (fetchError) {
    return { ok: false, message: fetchError.message };
  }

  if (!open) {
    return { ok: false, message: "No running timer." };
  }

  const { data, error } = await supabase
    .from("time_entries")
    .update({ description: parsed.data.description })
    .eq("id", open.id)
    .select(timeEntrySelect)
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: "Note could not be saved." };
  }

  revalidateTimePaths();

  return {
    ok: true,
    entry: await normalizeHydratedTimeEntry(
      supabase,
      user.id,
      data as TimeEntryRowRaw & { projects?: unknown; tasks?: unknown },
    ),
  };
}

export type PauseTimerResult =
  | { ok: true; entry: TimeEntryListRow }
  | { ok: false; message: string };

export async function pauseTimer(): Promise<PauseTimerResult> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const { data: open, error: fetchError } = await supabase
    .from("time_entries")
    .select("id, paused_at")
    .eq("user_id", user.id)
    .is("ended_at", null)
    .maybeSingle();

  if (fetchError) {
    return { ok: false, message: fetchError.message };
  }

  if (!open) {
    return { ok: false, message: "No running timer." };
  }

  if (open.paused_at) {
    return { ok: false, message: "Timer is already paused." };
  }

  const pausedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("time_entries")
    .update({ paused_at: pausedAt })
    .eq("id", open.id)
    .select(timeEntrySelect)
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: "Could not pause timer." };
  }

  revalidateTimePaths();

  return {
    ok: true,
    entry: await normalizeHydratedTimeEntry(
      supabase,
      user.id,
      data as TimeEntryRowRaw & { projects?: unknown; tasks?: unknown },
    ),
  };
}

export type ResumeTimerResult =
  | { ok: true; entry: TimeEntryListRow }
  | { ok: false; message: string };

export async function resumeTimer(): Promise<ResumeTimerResult> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, message: "Not authenticated." };
  }

  const { data: open, error: fetchError } = await supabase
    .from("time_entries")
    .select("id, paused_at, total_paused_seconds")
    .eq("user_id", user.id)
    .is("ended_at", null)
    .maybeSingle();

  if (fetchError) {
    return { ok: false, message: fetchError.message };
  }

  if (!open) {
    return { ok: false, message: "No running timer." };
  }

  if (!open.paused_at) {
    return { ok: false, message: "Timer is not paused." };
  }

  const nowMs = Date.now();
  const pauseSegmentSeconds = Math.floor(
    (nowMs - new Date(open.paused_at).getTime()) / 1000,
  );
  const newTotal =
    normalizeTotalPausedSeconds(open.total_paused_seconds) +
    pauseSegmentSeconds;

  const { data, error } = await supabase
    .from("time_entries")
    .update({
      paused_at: null,
      total_paused_seconds: newTotal,
    })
    .eq("id", open.id)
    .select(timeEntrySelect)
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: "Could not resume timer." };
  }

  revalidateTimePaths();

  return {
    ok: true,
    entry: await normalizeHydratedTimeEntry(
      supabase,
      user.id,
      data as TimeEntryRowRaw & { projects?: unknown; tasks?: unknown },
    ),
  };
}
