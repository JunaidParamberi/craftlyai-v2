import { describe, it, expect } from "vitest";
import { markPaidInputSchema, paymentMethodSchema } from "./payment";

describe("paymentMethodSchema", () => {
  it("accepts valid methods", () => {
    const methods = ["bank_transfer", "cash", "cheque", "card", "other"] as const;
    for (const m of methods) {
      expect(paymentMethodSchema.parse(m)).toBe(m);
    }
  });

  it("rejects invalid method", () => {
    expect(() => paymentMethodSchema.parse("wire")).toThrow();
    expect(() => paymentMethodSchema.parse("")).toThrow();
  });
});

describe("markPaidInputSchema", () => {
  it("accepts method only", () => {
    const result = markPaidInputSchema.parse({ method: "cash" });
    expect(result.method).toBe("cash");
    expect(result.reference).toBeUndefined();
    expect(result.notes).toBeUndefined();
  });

  it("accepts method with reference and notes", () => {
    const result = markPaidInputSchema.parse({
      method: "cheque",
      reference: "CHQ-12345",
      notes: "Paid in full",
    });
    expect(result.method).toBe("cheque");
    expect(result.reference).toBe("CHQ-12345");
    expect(result.notes).toBe("Paid in full");
  });

  it("accepts bank_transfer with long reference", () => {
    const result = markPaidInputSchema.parse({
      method: "bank_transfer",
      reference: "A".repeat(200),
    });
    expect(result.reference).toHaveLength(200);
  });

  it("rejects reference over 200 chars", () => {
    expect(() =>
      markPaidInputSchema.parse({ method: "card", reference: "A".repeat(201) })
    ).toThrow();
  });

  it("rejects notes over 500 chars", () => {
    expect(() =>
      markPaidInputSchema.parse({ method: "other", notes: "N".repeat(501) })
    ).toThrow();
  });

  it("rejects missing method", () => {
    expect(() => markPaidInputSchema.parse({})).toThrow();
  });

  it("rejects invalid method value", () => {
    expect(() => markPaidInputSchema.parse({ method: "paypal" })).toThrow();
  });

  it("rejects non-object input", () => {
    expect(() => markPaidInputSchema.parse(null)).toThrow();
    expect(() => markPaidInputSchema.parse("cash")).toThrow();
  });
});
