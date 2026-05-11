import { describe, expect, it } from "vitest";

import { CLIENT_LIMITS, parseClientCreateInput } from "@/lib/validations/client";

function validBase() {
  return {
    name: "Acme Corp",
    email: "",
    phone: "",
    company: "",
    address: "",
    currency: "",
    notes: "",
  };
}

describe("parseClientCreateInput", () => {
  it("accepts name-only payload", () => {
    const result = parseClientCreateInput(validBase());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Acme Corp");
      expect(result.data.email).toBeNull();
      expect(result.data.currency).toBeNull();
    }
  });

  it("normalizes email and trims strings", () => {
    const result = parseClientCreateInput({
      ...validBase(),
      name: "  Jane  ",
      email: "  hello@example.com  ",
      phone: " +1 ",
      company: " Co ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Jane");
      expect(result.data.email).toBe("hello@example.com");
      expect(result.data.phone).toBe("+1");
      expect(result.data.company).toBe("Co");
    }
  });

  it("rejects invalid email when non-empty", () => {
    const result = parseClientCreateInput({
      ...validBase(),
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("uppercases currency and accepts lowercase input", () => {
    const result = parseClientCreateInput({
      ...validBase(),
      currency: "usd",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("USD");
    }
  });

  it("rejects invalid currency code", () => {
    const result = parseClientCreateInput({
      ...validBase(),
      currency: "US",
    });
    expect(result.success).toBe(false);
  });

  it("maps empty optional fields to null", () => {
    const result = parseClientCreateInput(validBase());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeNull();
      expect(result.data.notes).toBeNull();
    }
  });

  it("rejects name over max length", () => {
    const result = parseClientCreateInput({
      ...validBase(),
      name: "x".repeat(CLIENT_LIMITS.name + 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = parseClientCreateInput({
      ...validBase(),
      name: "   ",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameIssue = result.error.flatten().fieldErrors.name?.[0];
      expect(nameIssue).toBe("Display name is required.");
    }
  });
});
