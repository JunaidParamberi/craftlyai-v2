import { describe, expect, it } from "vitest";
import {
  calculateInvoiceBalance,
  getInvoicePaymentStatus,
} from "./payment-balance";

describe("calculateInvoiceBalance", () => {
  it("calculates remaining balance from total, payments, and write-offs", () => {
    const result = calculateInvoiceBalance({
      invoiceTotal: 1000,
      payments: [250, 150],
      writeOffs: [100],
    });

    expect(result.totalPaid).toBe(400);
    expect(result.totalWrittenOff).toBe(100);
    expect(result.balanceDue).toBe(500);
  });

  it("clamps tiny floating point balances to zero", () => {
    const result = calculateInvoiceBalance({
      invoiceTotal: 0.3,
      payments: [0.1, 0.2],
      writeOffs: [],
    });

    expect(result.balanceDue).toBe(0);
  });
});

describe("getInvoicePaymentStatus", () => {
  it("marks invoice paid when payments cover the full balance", () => {
    expect(
      getInvoicePaymentStatus({
        invoiceTotal: 1000,
        totalPaid: 1000,
        totalWrittenOff: 0,
      }),
    ).toBe("paid");
  });

  it("marks invoice partially paid when a balance remains after payment", () => {
    expect(
      getInvoicePaymentStatus({
        invoiceTotal: 1000,
        totalPaid: 400,
        totalWrittenOff: 0,
      }),
    ).toBe("partially_paid");
  });

  it("marks invoice written off when the remaining balance is adjusted away", () => {
    expect(
      getInvoicePaymentStatus({
        invoiceTotal: 1000,
        totalPaid: 400,
        totalWrittenOff: 600,
      }),
    ).toBe("written_off");
  });
});
