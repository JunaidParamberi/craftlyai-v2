import { describe, expect, it } from "vitest";
import {
  calcLineItemsTotal,
  applyDiscount,
  calcAvgPayDays,
  calcRevenueChangePct,
} from "./revenue-calc";

describe("calcLineItemsTotal", () => {
  it("sums quantity * unit_price across all line items", () => {
    const items = [
      { quantity: "2", unit_price: "100.00", tax_rate: "0" },
      { quantity: "1", unit_price: "50.00", tax_rate: "0" },
    ];
    expect(calcLineItemsTotal(items)).toBe(250);
  });

  it("returns 0 for empty line items", () => {
    expect(calcLineItemsTotal([])).toBe(0);
  });
});

describe("applyDiscount", () => {
  it("applies percent discount", () => {
    expect(applyDiscount(200, "percent", 10)).toBe(180);
  });

  it("applies flat discount, clamped to subtotal", () => {
    expect(applyDiscount(200, "flat", 50)).toBe(150);
    expect(applyDiscount(200, "flat", 300)).toBe(0);
  });

  it("returns subtotal unchanged when discount_value is 0", () => {
    expect(applyDiscount(200, "percent", 0)).toBe(200);
    expect(applyDiscount(200, "flat", 0)).toBe(200);
  });
});

describe("calcAvgPayDays", () => {
  it("returns average days between sent_at and paid_at", () => {
    const invoices = [
      { sent_at: "2026-01-01T00:00:00Z", paid_at: "2026-01-15T00:00:00Z" },
      { sent_at: "2026-02-01T00:00:00Z", paid_at: "2026-02-11T00:00:00Z" },
    ];
    expect(calcAvgPayDays(invoices)).toBe(12);
  });

  it("returns null when no paid invoices", () => {
    expect(calcAvgPayDays([])).toBeNull();
  });
});

describe("calcRevenueChangePct", () => {
  it("computes percentage change", () => {
    expect(calcRevenueChangePct(1200, 1000)).toBe(20);
  });

  it("returns null when previous is 0", () => {
    expect(calcRevenueChangePct(500, 0)).toBeNull();
  });
});
