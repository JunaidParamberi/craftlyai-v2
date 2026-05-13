import { describe, expect, it } from "vitest";

import {
  DOCUMENT_LIMITS,
  emptyTiptapDoc,
  parseDocumentInput,
  parseTemplateInput,
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
