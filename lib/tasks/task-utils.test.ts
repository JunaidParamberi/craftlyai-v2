import { describe, expect, it } from "vitest";

import type { TaskListRow } from "@/types";

import {
  countDueTodayTasks,
  countDoneThisMonthTasks,
  filterTasks,
  isDueToday,
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

describe("isDueToday", () => {
  it("returns true when due date is today and status is open", () => {
    expect(
      isDueToday(
        { status: "todo", due_date: "2026-05-15" },
        new Date("2026-05-15T12:00:00.000Z"),
      ),
    ).toBe(true);
  });

  it("returns false for done tasks due today", () => {
    expect(
      isDueToday(
        { status: "done", due_date: "2026-05-15" },
        new Date("2026-05-15T12:00:00.000Z"),
      ),
    ).toBe(false);
  });
});

describe("countDueTodayTasks", () => {
  it("counts only open tasks due today", () => {
    const tasks = [
      task({ id: "a", due_date: "2026-05-15", status: "todo" }),
      task({ id: "b", due_date: "2026-05-15", status: "done" }),
      task({ id: "c", due_date: "2026-05-16", status: "todo" }),
    ];
    expect(
      countDueTodayTasks(tasks, new Date("2026-05-15T12:00:00.000Z")),
    ).toBe(1);
  });
});

describe("countDoneThisMonthTasks", () => {
  it("counts done tasks updated in the same month", () => {
    const tasks = [
      task({
        id: "a",
        status: "done",
        updated_at: "2026-05-10T00:00:00.000Z",
      }),
      task({
        id: "b",
        status: "done",
        updated_at: "2026-04-10T00:00:00.000Z",
      }),
      task({ id: "c", status: "todo", updated_at: "2026-05-10T00:00:00.000Z" }),
    ];
    expect(
      countDoneThisMonthTasks(tasks, new Date("2026-05-15T12:00:00.000Z")),
    ).toBe(1);
  });
});

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
      view: "all",
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
        view: "overdue",
      }),
    ).toEqual({
      project: projectId,
      status: "in_progress",
      priority: "high",
      sort: "created",
      view: "overdue",
    });
  });
});

describe("filterTasks view", () => {
  const base = {
    project: "all" as const,
    status: "all" as const,
    priority: "all" as const,
    sort: "due" as const,
  };

  it("view all includes done tasks", () => {
    const tasks = [
      task({ id: "a", status: "todo" }),
      task({ id: "b", status: "done" }),
    ];
    const result = filterTasks(tasks, { ...base, view: "all" }, "");
    expect(result).toHaveLength(2);
  });

  it("view open excludes done but keeps cancelled", () => {
    const tasks = [
      task({ id: "a", status: "done" }),
      task({ id: "b", status: "cancelled" }),
      task({ id: "c", status: "todo" }),
    ];
    const result = filterTasks(tasks, { ...base, view: "open" }, "");
    expect(result.map((t) => t.id)).toEqual(["b", "c"]);
  });

  it("filters overdue view", () => {
    const tasks = [
      task({
        id: "a",
        due_date: "2026-05-01",
        status: "todo",
      }),
      task({
        id: "b",
        due_date: "2026-06-01",
        status: "todo",
      }),
    ];
    const result = filterTasks(
      tasks,
      { ...base, view: "overdue" },
      "",
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("a");
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
      { project: "p1", status: "all", priority: "all", sort: "due", view: "open" },
      "",
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("1");
  });

  it("filters by search query on client name", () => {
    const result = filterTasks(
      tasks,
      { project: "all", status: "all", priority: "all", sort: "due", view: "open" },
      "acme",
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("1");
  });
});
