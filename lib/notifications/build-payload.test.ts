import { describe, expect, it } from "vitest";

import { buildDocumentNotificationPayload } from "./build-payload";

const base = {
  id: "doc-1",
  type: "invoice" as const,
  title: "Untitled",
  invoice_number: "INV-0001",
  quote_number: null,
  proposal_number: null,
  clientName: "Acme Corp",
};

describe("buildDocumentNotificationPayload", () => {
  it("builds invoice_paid label with amount", () => {
    const p = buildDocumentNotificationPayload("invoice_paid", {
      ...base,
      amount: 1500,
    });
    expect(p.label).toContain("INV-0001");
    expect(p.label).toContain("Acme Corp");
    expect(p.href).toBe("/documents/doc-1");
    expect(p.entity_id).toBe("doc-1");
  });

  it("builds quote_approved label", () => {
    const p = buildDocumentNotificationPayload("quote_approved", {
      ...base,
      type: "quote",
      quote_number: "QUO-0002",
      invoice_number: null,
    });
    expect(p.label).toBe("Quote #QUO-0002 approved by Acme Corp");
  });
});
