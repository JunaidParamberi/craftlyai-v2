import { describe, expect, it } from "vitest";
import {
  documentStatusLabel,
  documentStatusVariant,
  documentTypeLabel,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_VARIANTS,
  DOCUMENT_TYPE_LABELS,
} from "@/lib/documents/display";
import type { DocumentStatus, DocumentType } from "@/types";

describe("documentTypeLabel", () => {
  it("returns correct label for each document type", () => {
    const cases: [DocumentType, string][] = [
      ["proposal", "Proposal"],
      ["quote", "Quote"],
      ["invoice", "Invoice"],
      ["other", "Document"],
    ];
    for (const [type, expected] of cases) {
      expect(documentTypeLabel(type)).toBe(expected);
    }
  });

  it("DOCUMENT_TYPE_LABELS covers all types", () => {
    const types: DocumentType[] = ["proposal", "quote", "invoice", "other"];
    for (const t of types) {
      expect(DOCUMENT_TYPE_LABELS[t]).toBeDefined();
    }
  });
});

describe("documentStatusLabel", () => {
  it("returns correct label for each status", () => {
    const cases: [DocumentStatus, string][] = [
      ["draft", "Draft"],
      ["sent", "Sent"],
      ["viewed", "Viewed"],
      ["signed", "Signed"],
      ["paid", "Paid"],
      ["archived", "Archived"],
      ["approved", "Approved"],
      ["declined", "Declined"],
    ];
    for (const [status, expected] of cases) {
      expect(documentStatusLabel(status)).toBe(expected);
    }
  });

  it("DOCUMENT_STATUS_LABELS has entry for approved and declined", () => {
    expect(DOCUMENT_STATUS_LABELS["approved"]).toBe("Approved");
    expect(DOCUMENT_STATUS_LABELS["declined"]).toBe("Declined");
  });
});

describe("documentStatusVariant", () => {
  it("approved maps to default variant", () => {
    expect(documentStatusVariant("approved")).toBe("default");
  });

  it("declined maps to destructive variant", () => {
    expect(documentStatusVariant("declined")).toBe("destructive");
  });

  it("draft maps to outline variant", () => {
    expect(documentStatusVariant("draft")).toBe("outline");
  });

  it("paid maps to default variant", () => {
    expect(documentStatusVariant("paid")).toBe("default");
  });

  it("DOCUMENT_STATUS_VARIANTS covers all statuses", () => {
    const statuses: DocumentStatus[] = [
      "draft", "sent", "viewed", "signed", "paid", "archived", "approved", "declined",
    ];
    for (const s of statuses) {
      expect(DOCUMENT_STATUS_VARIANTS[s]).toBeDefined();
    }
  });
});
