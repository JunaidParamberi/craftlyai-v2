import { describe, it, expect } from "vitest";
import { upgradePlanSchema } from "./billing";

describe("upgradePlanSchema", () => {
  it("accepts valid plans", () => {
    expect(upgradePlanSchema.parse({ plan: "starter" })).toEqual({ plan: "starter" });
    expect(upgradePlanSchema.parse({ plan: "pro" })).toEqual({ plan: "pro" });
    expect(upgradePlanSchema.parse({ plan: "agency" })).toEqual({ plan: "agency" });
  });

  it("rejects free plan (can't upgrade to free)", () => {
    expect(() => upgradePlanSchema.parse({ plan: "free" })).toThrow();
  });

  it("rejects unknown plan", () => {
    expect(() => upgradePlanSchema.parse({ plan: "enterprise" })).toThrow();
  });

  it("rejects missing plan", () => {
    expect(() => upgradePlanSchema.parse({})).toThrow();
  });
});
