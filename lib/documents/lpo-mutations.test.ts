import { describe, it, expect } from "vitest";
import { lpoMetaSchema } from "@/lib/validations/document";

describe("lpoMetaSchema", () => {
  it("accepts valid LPO metadata", () => {
    const result = lpoMetaSchema.safeParse({
      lpo_number: "LPO-2026-001",
      lpo_validity_date: "2026-12-31",
      lpo_amount: 5000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty lpo_number", () => {
    const result = lpoMetaSchema.safeParse({
      lpo_number: "",
      lpo_validity_date: null,
      lpo_amount: null,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("LPO number is required.");
  });

  it("rejects negative lpo_amount", () => {
    const result = lpoMetaSchema.safeParse({
      lpo_number: "LPO-001",
      lpo_amount: -100,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Amount must be positive.");
  });

  it("allows undefined optional fields", () => {
    const result = lpoMetaSchema.safeParse({
      lpo_number: "LPO-001",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lpo_validity_date).toBeUndefined();
      expect(result.data.lpo_amount).toBeUndefined();
    }
  });
});
