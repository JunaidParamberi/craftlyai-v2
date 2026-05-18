import { describe, expect, it } from "vitest";

import { TASK_LIMITS, parseTaskCreateInput, parseTaskUpdateInput } from "@/lib/validations/task";

function validCreate() {
  return {
    title: "Kickoff call",
    status: "todo" as const,
    priority: "high" as const,
    due_date: "",
    labels: [] as string[],
  };
}

describe("parseTaskCreateInput", () => {
  it("accepts minimal payload", () => {
    const result = parseTaskCreateInput(validCreate());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Kickoff call");
      expect(result.data.status).toBe("todo");
      expect(result.data.priority).toBe("high");
      expect(result.data.due_date).toBeNull();
    }
  });

  it("parses due date", () => {
    const result = parseTaskCreateInput({
      ...validCreate(),
      due_date: "2026-05-20",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.due_date).toBe("2026-05-20");
    }
  });

  it("rejects invalid status", () => {
    const result = parseTaskCreateInput({
      ...validCreate(),
      status: "pending",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid priority", () => {
    const result = parseTaskCreateInput({
      ...validCreate(),
      priority: "urgent",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = parseTaskCreateInput({
      ...validCreate(),
      title: "  ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects title over max length", () => {
    const result = parseTaskCreateInput({
      ...validCreate(),
      title: "x".repeat(TASK_LIMITS.title + 1),
    });
    expect(result.success).toBe(false);
  });

  it("accepts labels array", () => {
    const result = parseTaskCreateInput({
      ...validCreate(),
      labels: ["design", "copy"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.labels).toEqual(["design", "copy"]);
    }
  });

  it("rejects too many labels", () => {
    const result = parseTaskCreateInput({
      ...validCreate(),
      labels: Array.from({ length: TASK_LIMITS.labelsMax + 1 }, (_, i) => `l${i}`),
    });
    expect(result.success).toBe(false);
  });
});

describe("parseTaskUpdateInput", () => {
  it("accepts partial update", () => {
    const result = parseTaskUpdateInput({ status: "done" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("done");
    }
  });

  it("rejects empty update object", () => {
    const result = parseTaskUpdateInput({});
    expect(result.success).toBe(false);
  });

  it("accepts labels update", () => {
    const result = parseTaskUpdateInput({ labels: ["finance"] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.labels).toEqual(["finance"]);
    }
  });
});
