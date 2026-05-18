import {
  differenceInCalendarDays,
  isSameMonth,
  parseISO,
  startOfDay,
} from "date-fns";
import { z } from "zod";

import type { TaskListRow, TaskPriority, TaskStatus } from "@/types";

export type TaskSortKey = "due" | "created" | "priority";

export type TaskViewKey = "all" | "open" | "today" | "overdue" | "done";

export const TASK_VIEW_KEYS = [
  "all",
  "open",
  "today",
  "overdue",
  "done",
] as const;

export type TaskListFilters = {
  project: string;
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  sort: TaskSortKey;
  view: TaskViewKey;
};

export const TASK_SORT_KEYS = ["due", "created", "priority"] as const;

const uuidSchema = z.string().uuid();
const TASK_STATUSES = ["todo", "in_progress", "done", "cancelled"] as const;
const TASK_PRIORITIES = ["low", "medium", "high"] as const;

const PRIORITY_RANK: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

type TaskOverdueInput = {
  due_date: string | null;
  status: TaskStatus;
};

function parseDueDateStart(dueDate: string): Date | null {
  const t = dueDate.trim();
  if (!t) return null;
  const d = parseISO(t.length === 10 ? `${t}T12:00:00.000Z` : t);
  if (Number.isNaN(d.getTime())) return null;
  return startOfDay(d);
}

function isOpenStatus(status: TaskStatus): boolean {
  return status === "todo" || status === "in_progress";
}

/** Due date is today (calendar) and task is still open. */
export function isDueToday(
  task: TaskOverdueInput,
  now = new Date(),
): boolean {
  if (!isOpenStatus(task.status)) {
    return false;
  }
  const due = task.due_date ? parseDueDateStart(task.due_date) : null;
  if (!due) {
    return false;
  }
  const today = startOfDay(now);
  return differenceInCalendarDays(due, today) === 0;
}

/** Due date before today and not terminal status. */
export function isTaskOverdue(task: TaskOverdueInput, now = new Date()): boolean {
  if (!isOpenStatus(task.status)) {
    return false;
  }
  const due = task.due_date ? parseDueDateStart(task.due_date) : null;
  if (!due) {
    return false;
  }
  const today = startOfDay(now);
  return differenceInCalendarDays(due, today) < 0;
}

function dueSortKey(task: TaskListRow): number {
  if (!task.due_date) {
    return Number.POSITIVE_INFINITY;
  }
  const d = parseDueDateStart(task.due_date);
  return d ? d.getTime() : Number.POSITIVE_INFINITY;
}

function compareDueSort(a: TaskListRow, b: TaskListRow): number {
  const aOpen = isOpenStatus(a.status);
  const bOpen = isOpenStatus(b.status);
  const aOverdue = aOpen && isTaskOverdue(a);
  const bOverdue = bOpen && isTaskOverdue(b);

  if (aOverdue !== bOverdue) {
    return aOverdue ? -1 : 1;
  }

  if (aOpen !== bOpen) {
    return aOpen ? -1 : 1;
  }

  if (aOpen && bOpen) {
    const aDue = dueSortKey(a);
    const bDue = dueSortKey(b);
    if (aDue !== bDue) {
      return aDue - bDue;
    }
    if (aDue === Number.POSITIVE_INFINITY && bDue === Number.POSITIVE_INFINITY) {
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
    return 0;
  }

  const aDue = dueSortKey(a);
  const bDue = dueSortKey(b);
  if (aDue !== bDue) {
    return bDue - aDue;
  }
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export function sortTasks<T extends TaskListRow>(tasks: T[], sort: TaskSortKey): T[] {
  const copy = [...tasks];
  if (sort === "due") {
    copy.sort(compareDueSort);
    return copy;
  }
  if (sort === "created") {
    copy.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    return copy;
  }
  copy.sort((a, b) => {
    const pr =
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (pr !== 0) return pr;
    return compareDueSort(a, b);
  });
  return copy;
}

export function parseTaskListFilters(
  searchParams: Record<string, string | string[] | undefined>,
): TaskListFilters {
  const raw = (key: string): string | undefined => {
    const v = searchParams[key];
    if (Array.isArray(v)) return v[0];
    return v;
  };

  const projectRaw = raw("project")?.trim() ?? "all";
  const project =
    projectRaw === "all" || uuidSchema.safeParse(projectRaw).success
      ? projectRaw
      : "all";

  const statusRaw = raw("status")?.trim() ?? "all";
  const status = (
    TASK_STATUSES as readonly string[]
  ).includes(statusRaw)
    ? (statusRaw as TaskStatus)
    : "all";

  const priorityRaw = raw("priority")?.trim() ?? "all";
  const priority = (
    TASK_PRIORITIES as readonly string[]
  ).includes(priorityRaw)
    ? (priorityRaw as TaskPriority)
    : "all";

  const sortRaw = raw("sort")?.trim() ?? "due";
  const sort = (TASK_SORT_KEYS as readonly string[]).includes(sortRaw)
    ? (sortRaw as TaskSortKey)
    : "due";

  const viewRaw = raw("view")?.trim() ?? "all";
  const view = (TASK_VIEW_KEYS as readonly string[]).includes(viewRaw)
    ? (viewRaw as TaskViewKey)
    : "all";

  return { project, status, priority, sort, view };
}

function isDoneThisMonth(task: TaskListRow, now = new Date()): boolean {
  if (task.status !== "done") {
    return false;
  }
  const updated = parseISO(task.updated_at);
  return !Number.isNaN(updated.getTime()) && isSameMonth(updated, now);
}

function matchesViewFilter<T extends TaskListRow>(
  task: T,
  view: TaskViewKey,
  now = new Date(),
): boolean {
  switch (view) {
    case "all":
      return true;
    case "open":
      return task.status !== "done";
    case "today":
      return isDueToday(task, now);
    case "overdue":
      return isTaskOverdue(task, now);
    case "done":
      return isDoneThisMonth(task, now);
    default:
      return true;
  }
}

export function filterTasks<T extends TaskListRow>(
  tasks: T[],
  filters: TaskListFilters,
  searchQuery: string,
): T[] {
  const q = searchQuery.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filters.project !== "all" && task.project_id !== filters.project) {
      return false;
    }
    if (filters.status !== "all" && task.status !== filters.status) {
      return false;
    }
    if (filters.priority !== "all" && task.priority !== filters.priority) {
      return false;
    }
    if (!matchesViewFilter(task, filters.view)) {
      return false;
    }
    if (!q) {
      return true;
    }
    const hay = [
      task.title,
      task.project.title,
      task.project.client?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function countOpenTasks(tasks: TaskListRow[]): number {
  return tasks.filter((t) => isOpenStatus(t.status)).length;
}

export function countOverdueTasks(tasks: TaskListRow[]): number {
  return tasks.filter((t) => isTaskOverdue(t)).length;
}

export function countDoneTasks(tasks: TaskListRow[]): number {
  return tasks.filter((t) => t.status === "done").length;
}

export function countDueTodayTasks(
  tasks: TaskListRow[],
  now = new Date(),
): number {
  return tasks.filter((t) => isDueToday(t, now)).length;
}

/** Done tasks with `updated_at` in the current calendar month. */
export function countDoneThisMonthTasks(
  tasks: TaskListRow[],
  now = new Date(),
): number {
  return tasks.filter((t) => {
    if (t.status !== "done") {
      return false;
    }
    const updated = parseISO(t.updated_at);
    return !Number.isNaN(updated.getTime()) && isSameMonth(updated, now);
  }).length;
}

export function countDistinctProjectsWithOpenTasks(
  tasks: TaskListRow[],
): number {
  const ids = new Set<string>();
  for (const t of tasks) {
    if (isOpenStatus(t.status)) {
      ids.add(t.project_id);
    }
  }
  return ids.size;
}

/** Build `/tasks` query string; omits default values. */
export function buildTasksHref(
  patch: Partial<TaskListFilters>,
  base?: TaskListFilters,
): string {
  const merged: TaskListFilters = {
    project: "all",
    status: "all",
    priority: "all",
    sort: "due",
    view: "all",
    ...base,
    ...patch,
  };

  const params = new URLSearchParams();
  if (merged.project !== "all") {
    params.set("project", merged.project);
  }
  if (merged.status !== "all") {
    params.set("status", merged.status);
  }
  if (merged.priority !== "all") {
    params.set("priority", merged.priority);
  }
  if (merged.sort !== "due") {
    params.set("sort", merged.sort);
  }
  if (merged.view !== "all") {
    params.set("view", merged.view);
  }

  const qs = params.toString();
  return qs ? `/tasks?${qs}` : "/tasks";
}
