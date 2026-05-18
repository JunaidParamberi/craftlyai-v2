import { describe, expect, it } from "vitest";

import {
  getProjectChipRisk,
  isProjectAtRisk,
  projectBudgetProgress,
  projectsHubSubtitle,
} from "@/lib/projects/project-utils";
import type { ProjectListRow } from "@/types";

function project(
  overrides: Partial<ProjectListRow> = {},
): ProjectListRow {
  return {
    id: "p1",
    user_id: "u1",
    client_id: "c1",
    title: "Test",
    status: "active",
    budget: 10000,
    spent: 6800,
    start_date: null,
    deadline: null,
    created_at: "",
    updated_at: "",
    client: { id: "c1", name: "Client" },
    ...overrides,
  };
}

describe("isProjectAtRisk", () => {
  it("returns false when not active", () => {
    expect(
      isProjectAtRisk(project({ status: "planning", deadline: "2026-05-20" })),
    ).toBe(false);
  });

  it("returns true when active and deadline within 7 days", () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);
    const iso = soon.toISOString().slice(0, 10);
    expect(isProjectAtRisk(project({ status: "active", deadline: iso }))).toBe(
      true,
    );
  });
});

describe("getProjectChipRisk", () => {
  it("returns danger when at risk", () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 2);
    expect(
      getProjectChipRisk(
        project({ status: "active", deadline: soon.toISOString().slice(0, 10) }),
      ),
    ).toBe("danger");
  });

  it("returns warning for on_hold", () => {
    expect(getProjectChipRisk(project({ status: "on_hold" }))).toBe("warning");
  });
});

describe("projectBudgetProgress", () => {
  it("computes spent over budget", () => {
    expect(projectBudgetProgress(project({ budget: 100, spent: 68 }))).toBe(0.68);
  });

  it("returns 0 when no budget", () => {
    expect(projectBudgetProgress(project({ budget: null, spent: 50 }))).toBe(0);
  });
});

describe("projectsHubSubtitle", () => {
  it("counts active and at-risk projects", () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 2);
    const result = projectsHubSubtitle(
      [
        project({ status: "active", budget: 1000, spent: 500 }),
        project({
          status: "active",
          budget: 2000,
          spent: 0,
          deadline: soon.toISOString().slice(0, 10),
        }),
        project({ status: "completed" }),
      ],
      "AED",
    );
    expect(result.activeCount).toBe(2);
    expect(result.atRiskCount).toBe(1);
    expect(result.inFlightLabel).toContain("AED");
  });
});
