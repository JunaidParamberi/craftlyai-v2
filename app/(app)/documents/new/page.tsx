import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { listDocumentTemplates } from "@/lib/documents/document-queries";

import { TemplatePicker } from "@/components/features/documents/template-picker";

export const metadata: Metadata = {
  title: "New document",
};

export default async function NewDocumentPage() {
  const result = await listDocumentTemplates();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          Back to documents
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            New document
          </h1>
          <p className="max-w-lg text-muted-foreground text-sm">
            Pick a starting point. Templates pre-fill structure and{" "}
            <code className="font-mono text-[0.85em]">{"{{variables}}"}</code>{" "}
            you can resolve later by linking a client or project.
          </p>
        </div>
      </div>

      {!result.ok ? (
        <p className="text-destructive text-sm">{result.message}</p>
      ) : (
        <TemplatePicker templates={result.templates} />
      )}
    </div>
  );
}
