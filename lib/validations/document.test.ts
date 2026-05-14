import { describe, expect, it } from "vitest";

import {
  DOCUMENT_LIMITS,
  emptyTiptapDoc,
  invoiceMetaSchema,
  parseDocumentInput,
  parseTemplateInput,
  proposalMetaSchema,
  quoteMetaSchema,
} from "@/lib/validations/document";

function validDocBase() {
  return {
    title: "New proposal",
    type: "proposal" as const,
    content_json: emptyTiptapDoc(),
  };
}

describe("parseDocumentInput", () => {
  it("accepts the minimum required payload", () => {
    const result = parseDocumentInput(validDocBase());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("New proposal");
      expect(result.data.type).toBe("proposal");
      expect(result.data.status).toBe("draft");
      expect(result.data.client_id).toBeNull();
      expect(result.data.project_id).toBeNull();
    }
  });

  it("trims the title", () => {
    const result = parseDocumentInput({
      ...validDocBase(),
      title: "   Padded title   ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Padded title");
    }
  });

  it("rejects an empty title", () => {
    const result = parseDocumentInput({ ...validDocBase(), title: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects a title over the max length", () => {
    const result = parseDocumentInput({
      ...validDocBase(),
      title: "x".repeat(DOCUMENT_LIMITS.title + 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown document type", () => {
    const result = parseDocumentInput({
      ...validDocBase(),
      type: "blog-post",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-doc content_json root", () => {
    const result = parseDocumentInput({
      ...validDocBase(),
      content_json: { type: "paragraph", content: [] },
    });
    expect(result.success).toBe(false);
  });

  it("maps empty client/project id strings to null", () => {
    const result = parseDocumentInput({
      ...validDocBase(),
      client_id: "",
      project_id: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.client_id).toBeNull();
      expect(result.data.project_id).toBeNull();
    }
  });

  it("preserves a valid client_id uuid", () => {
    const id = "11111111-1111-1111-1111-111111111111";
    const result = parseDocumentInput({
      ...validDocBase(),
      client_id: id,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.client_id).toBe(id);
    }
  });

  it("rejects a malformed client_id", () => {
    const result = parseDocumentInput({
      ...validDocBase(),
      client_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("honors a custom status when provided", () => {
    const result = parseDocumentInput({
      ...validDocBase(),
      status: "sent",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("sent");
    }
  });

  it("accepts approved and declined statuses", () => {
    for (const status of ["approved", "declined"] as const) {
      const result = parseDocumentInput({ ...validDocBase(), status });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.status).toBe(status);
    }
  });

  it("accepts quote as document type", () => {
    const result = parseDocumentInput({ ...validDocBase(), type: "quote" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.type).toBe("quote");
  });
});

function validTemplateBase() {
  return {
    name: "Discovery proposal",
    type: "proposal" as const,
    content_json: emptyTiptapDoc(),
  };
}

describe("parseTemplateInput", () => {
  it("accepts the minimum required payload", () => {
    const result = parseTemplateInput(validTemplateBase());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Discovery proposal");
      expect(result.data.description).toBeNull();
    }
  });

  it("trims name and description", () => {
    const result = parseTemplateInput({
      ...validTemplateBase(),
      name: "  Padded  ",
      description: "  Notes  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Padded");
      expect(result.data.description).toBe("Notes");
    }
  });

  it("rejects an empty name", () => {
    const result = parseTemplateInput({ ...validTemplateBase(), name: " " });
    expect(result.success).toBe(false);
  });

  it("rejects an oversized name", () => {
    const result = parseTemplateInput({
      ...validTemplateBase(),
      name: "x".repeat(DOCUMENT_LIMITS.template_name + 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an oversized description", () => {
    const result = parseTemplateInput({
      ...validTemplateBase(),
      description: "x".repeat(DOCUMENT_LIMITS.template_description + 1),
    });
    expect(result.success).toBe(false);
  });
});

describe("quoteMetaSchema", () => {
  it("accepts empty object — all fields optional", () => {
    const result = quoteMetaSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts full valid payload", () => {
    const result = quoteMetaSchema.safeParse({
      quote_number: "QUO-0001",
      valid_until: "2026-12-31",
      notes_footer: "Valid for 30 days.",
      discount_value: 10,
      discount_type: "percent",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quote_number).toBe("QUO-0001");
      expect(result.data.valid_until).toBe("2026-12-31");
      expect(result.data.discount_type).toBe("percent");
    }
  });

  it("accepts flat discount type", () => {
    const result = quoteMetaSchema.safeParse({ discount_type: "flat", discount_value: 50 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.discount_type).toBe("flat");
  });

  it("rejects invalid discount_type", () => {
    const result = quoteMetaSchema.safeParse({ discount_type: "fixed" });
    expect(result.success).toBe(false);
  });

  it("rejects negative discount_value", () => {
    const result = quoteMetaSchema.safeParse({ discount_value: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects malformed valid_until date", () => {
    const result = quoteMetaSchema.safeParse({ valid_until: "31-12-2026" });
    expect(result.success).toBe(false);
  });

  it("accepts valid_until as null", () => {
    const result = quoteMetaSchema.safeParse({ valid_until: null });
    expect(result.success).toBe(true);
  });

  it("rejects oversized quote_number", () => {
    const result = quoteMetaSchema.safeParse({ quote_number: "x".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects oversized notes_footer", () => {
    const result = quoteMetaSchema.safeParse({ notes_footer: "x".repeat(1001) });
    expect(result.success).toBe(false);
  });

  it("coerces discount_value from string", () => {
    const result = quoteMetaSchema.safeParse({ discount_value: "15" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.discount_value).toBe(15);
  });

  it("defaults discount_value to 0 when not provided", () => {
    const result = quoteMetaSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.discount_value).toBe(0);
  });

  it("defaults discount_type to percent when not provided", () => {
    const result = quoteMetaSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.discount_type).toBe("percent");
  });
});

describe("invoiceMetaSchema", () => {
  it("accepts empty object — all fields optional", () => {
    const result = invoiceMetaSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts full valid payload", () => {
    const result = invoiceMetaSchema.safeParse({
      invoice_number: "INV-0042",
      due_date: "2026-06-30",
      payment_terms: "Net 30",
      notes_footer: "Thank you!",
      discount_value: 5,
      discount_type: "percent",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.invoice_number).toBe("INV-0042");
      expect(result.data.due_date).toBe("2026-06-30");
      expect(result.data.payment_terms).toBe("Net 30");
    }
  });

  it("rejects malformed due_date", () => {
    const result = invoiceMetaSchema.safeParse({ due_date: "June 30 2026" });
    expect(result.success).toBe(false);
  });

  it("rejects negative discount_value", () => {
    const result = invoiceMetaSchema.safeParse({ discount_value: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects oversized invoice_number", () => {
    const result = invoiceMetaSchema.safeParse({ invoice_number: "x".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects oversized payment_terms", () => {
    const result = invoiceMetaSchema.safeParse({ payment_terms: "x".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("accepts due_date as null", () => {
    const result = invoiceMetaSchema.safeParse({ due_date: null });
    expect(result.success).toBe(true);
  });

  it("defaults discount_value to 0 and discount_type to percent", () => {
    const result = invoiceMetaSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.discount_value).toBe(0);
      expect(result.data.discount_type).toBe("percent");
    }
  });
});

describe("proposalMetaSchema", () => {
  it("accepts all optional fields absent", () => {
    const result = proposalMetaSchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.discount_value).toBe(0);
    expect(result.data?.discount_type).toBe("percent");
  });

  it("accepts valid proposal_number", () => {
    const result = proposalMetaSchema.safeParse({ proposal_number: "PRO-0001" });
    expect(result.success).toBe(true);
    expect(result.data?.proposal_number).toBe("PRO-0001");
  });

  it("rejects proposal_number over 100 chars", () => {
    const result = proposalMetaSchema.safeParse({ proposal_number: "P".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("accepts valid date for valid_until", () => {
    const result = proposalMetaSchema.safeParse({ valid_until: "2026-12-31" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date format", () => {
    const result = proposalMetaSchema.safeParse({ valid_until: "31-12-2026" });
    expect(result.success).toBe(false);
  });

  it("accepts discount_type flat", () => {
    const result = proposalMetaSchema.safeParse({ discount_type: "flat", discount_value: 500 });
    expect(result.success).toBe(true);
    expect(result.data?.discount_type).toBe("flat");
  });

  it("rejects invalid discount_type", () => {
    const result = proposalMetaSchema.safeParse({ discount_type: "unknown" });
    expect(result.success).toBe(false);
  });

  it("coerces discount_value from string", () => {
    const result = proposalMetaSchema.safeParse({ discount_value: "10.5" });
    expect(result.success).toBe(true);
    expect(result.data?.discount_value).toBe(10.5);
  });

  it("rejects negative discount_value", () => {
    const result = proposalMetaSchema.safeParse({ discount_value: -1 });
    expect(result.success).toBe(false);
  });

  it("accepts null for all nullable fields", () => {
    const result = proposalMetaSchema.safeParse({
      proposal_number: null,
      valid_until: null,
      notes_footer: null,
    });
    expect(result.success).toBe(true);
  });
});
