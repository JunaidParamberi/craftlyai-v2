import { describe, expect, it } from "vitest";

import type { TaskListRow } from "@/types";

import {
  filterTasks,
  isTaskOverdue,
  parseTaskListFilters,
  sortTasks,
} from "@/lib/tasks/task-utils";

function task(overrides: Partial<TaskListRow> = {}): TaskListRow {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    project_id: "00000000-0000-4000-8000-000000000010",
    title: "Default task",
    status: "todo",
    due_date: null,
    priority: "medium",
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z",
    project: {
      id: "00000000-0000-4000-8000-000000000010",
      title: "Website",
      client: { id: "c1", name: "Acme" },
    },
    ...overrides,
  };
}

describe("isTaskOverdue", () => {
  it("returns true for open task with past due date", () => {
    expect(
      isTaskOverdue(
        { status: "todo", due_date: "2026-05-01" },
        new Date("2026-05-15T12:00:00.000Z"),
      ),
    ).toBe(true);
  });

  it("returns false for done task with past due date", () => {
    expect(
      isTaskOverdue(
        { status: "done", due_date: "2026-05-01" },
        new Date("2026-05-15T12:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("returns false when no due date", () => {
    expect(isTaskOverdue({ status: "todo", due_date: null })).toBe(false);
  });
});

describe("sortTasks due", () => {
  it("puts overdue open tasks before other open tasks", () => {
    const overdue = task({
      id: "a",
      title: "Overdue",
      due_date: "2026-05-01",
      status: "todo",
    });
    const future = task({
      id: "b",
      title: "Future",
      due_date: "2026-06-01",
      status: "todo",
    });
    const sorted = sortTasks([future, overdue], "due");
    expect(sorted[0]?.id).toBe("a");
  });

  it("puts open tasks before done", () => {
    const open = task({ id: "a", status: "todo", due_date: "2026-06-01" });
    const done = task({ id: "b", status: "done", due_date: "2026-05-01" });
    const sorted = sortTasks([done, open], "due");
    expect(sorted[0]?.id).toBe("a");
  });
});

describe("parseTaskListFilters", () => {
  it("defaults invalid values", () => {
    expect(
      parseTaskListFilters({
        project: "not-a-uuid",
        status: "review",
        priority: "urgent",
        sort: "invalid",
      }),
    ).toEqual({
      project: "all",
      status: "all",
      priority: "all",
      sort: "due",
    });
  });

  it("accepts valid filters", () => {
    const projectId = "11111111-1111-4111-8111-111111111111";
    expect(
      parseTaskListFilters({
        project: projectId,
        status: "in_progress",
        priority: "high",
        sort: "created",
      }),
    ).toEqual({
      project: projectId,
      status: "in_progress",
      priority: "high",
      sort: "created",
    });
  });
});

describe("filterTasks", () => {
  const tasks = [
    task({ id: "1", title: "Wireframes", project_id: "p1" }),
    task({
      id: "2",
      title: "API",
      project_id: "p2",
      project: {
        id: "p2",
        title: "Mobile app",
        client: null,
      },
    }),
  ];

  it("filters by project", () => {
    const result = filterTasks(
      tasks,
      { project: "p1", status: "all", priority: "all", sort: "due" },
      "",
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("1");
  });

  it("filters by search query on client name", () => {
    const result = filterTasks(
      tasks,
      { project: "all", status: "all", priority: "all", sort: "due" },
      "acme",
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("1");
  });
});
