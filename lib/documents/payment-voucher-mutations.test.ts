import { describe, expect, it } from "vitest";
import { formatVoucherNumber } from "./payment-voucher-mutations";

describe("formatVoucherNumber", () => {
  it("pads single digit with leading zeros", () => {
    expect(formatVoucherNumber(0)).toBe("VCH-0001");
  });

  it("increments count correctly", () => {
    expect(formatVoucherNumber(1)).toBe("VCH-0002");
    expect(formatVoucherNumber(9)).toBe("VCH-0010");
  });

  it("handles 3-digit count", () => {
    expect(formatVoucherNumber(99)).toBe("VCH-0100");
  });

  it("handles 4-digit count without truncation", () => {
    expect(formatVoucherNumber(9999)).toBe("VCH-10000");
  });
});
