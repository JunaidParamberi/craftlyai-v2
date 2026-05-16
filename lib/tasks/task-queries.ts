import { unstable_cache } from "next/cache";
import { getServerContext } from "@/lib/supabase/get-server-context";
import { pickEmbed } from "@/lib/supabase/pick-embed";
import type { TaskListRow, TaskPriority, TaskRow, TaskStatus } from "@/types";

const TASK_LIST_SELECT =
  "*, project:projects(id, title, clients(id, name))" as const;

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

type TaskListRowRaw = TaskRowRaw & {
  project?:
    | {
        id: string;
        title: string;
        clients?: unknown;
      }
    | {
        id: string;
        title: string;
        clients?: unknown;
      }[]
    | null;
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

function normalizeTaskListRow(row: TaskListRowRaw): TaskListRow | null {
  const base = normalizeTaskRow(row);
  const projectRaw = row.project;
  const projectNode = Array.isArray(projectRaw) ? projectRaw[0] : projectRaw;
  if (!projectNode?.id || !projectNode.title) {
    return null;
  }
  const clientEmbed = pickEmbed(projectNode.clients, "name");
  return {
    ...base,
    project: {
      id: projectNode.id,
      title: projectNode.title,
      client: clientEmbed
        ? { id: clientEmbed.id, name: clientEmbed.name }
        : null,
    },
  };
}

export type ListAllTasksResult =
  | { ok: true; tasks: TaskListRow[] }
  | { ok: false; message: string };

const _cachedListAllTasksForUser = unstable_cache(
  async (userId: string): Promise<ListAllTasksResult> => {
    const { supabase } = await getServerContext();

    const { data, error } = await supabase
      .from("tasks")
      .select(TASK_LIST_SELECT)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });

    if (error) {
      return { ok: false, message: error.message };
    }

    const tasks: TaskListRow[] = [];
    for (const row of data ?? []) {
      const normalized = normalizeTaskListRow(row as TaskListRowRaw);
      if (normalized) {
        tasks.push(normalized);
      }
    }

    return { ok: true, tasks };
  },
  ["tasks-list"],
  { revalidate: 60, tags: ["tasks"] }
);

export async function listAllTasksForUser(): Promise<ListAllTasksResult> {
  const { user } = await getServerContext();
  if (!user) {
    return { ok: false, message: "Not authenticated." };
  }
  return _cachedListAllTasksForUser(user.id);
}
