import { describe, expect, it } from "vitest";
import {
  currentMonthRange,
  lastNMonthsRange,
  yearToDateRange,
  previousPeriodRange,
  parseDateRangeParams,
  formatDateParam,
} from "./date-utils";

describe("currentMonthRange", () => {
  it("returns start of current month as from and now as to", () => {
    const { from, to } = currentMonthRange();
    expect(from.getDate()).toBe(1);
    expect(from.getHours()).toBe(0);
    expect(to.getTime()).toBeLessThanOrEqual(Date.now() + 1000);
  });
});

describe("lastNMonthsRange", () => {
  it("returns a range spanning exactly N months back from today", () => {
    const { from, to } = lastNMonthsRange(3);
    const diffMs = to.getTime() - from.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThan(80);
    expect(diffDays).toBeLessThan(95);
  });
});

describe("yearToDateRange", () => {
  it("starts on Jan 1 of the current year", () => {
    const { from } = yearToDateRange();
    expect(from.getMonth()).toBe(0);
    expect(from.getDate()).toBe(1);
    expect(from.getFullYear()).toBe(new Date().getFullYear());
  });
});

describe("parseDateRangeParams", () => {
  it("returns currentMonthRange when both params are absent", () => {
    const range = parseDateRangeParams(undefined, undefined);
    expect(range.from.getDate()).toBe(1);
  });

  it("parses valid ISO date strings", () => {
    const range = parseDateRangeParams("2026-01-01", "2026-03-31");
    expect(range.from.getFullYear()).toBe(2026);
    expect(range.from.getMonth()).toBe(0);
    expect(range.to.getMonth()).toBe(2);
  });

  it("falls back to currentMonthRange when params are invalid", () => {
    const range = parseDateRangeParams("not-a-date", "also-bad");
    expect(range.from.getDate()).toBe(1);
  });
});

describe("previousPeriodRange", () => {
  it("returns a range of equal duration immediately before the given range", () => {
    const from = new Date("2026-03-01T00:00:00Z");
    const to = new Date("2026-03-31T00:00:00Z");
    const prev = previousPeriodRange({ from, to });
    const duration = to.getTime() - from.getTime();
    expect(prev.to.getTime()).toBe(from.getTime());
    expect(prev.to.getTime() - prev.from.getTime()).toBe(duration);
  });
});

describe("formatDateParam", () => {
  it("formats a date as YYYY-MM-DD", () => {
    const d = new Date(2026, 0, 15); // Jan 15 2026
    expect(formatDateParam(d)).toBe("2026-01-15");
  });
});
