"use client";

import { Fragment } from "react";

import { documentTypeLabel } from "@/lib/documents/display";
import { renderNode } from "@/components/features/documents/document-detail-view";
import type { VariableContext } from "@/lib/documents/variables";
import type { DocumentType, TiptapDoc } from "@/types";

type DocumentPreviewPanelProps = {
  title: string;
  type: DocumentType;
  content: TiptapDoc;
  variableContext: VariableContext;
};

export function DocumentPreviewPanel({
  title,
  type,
  content,
  variableContext,
}: DocumentPreviewPanelProps) {
  const issued = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="overflow-y-auto rounded-2xl border border-border/70 bg-white dark:bg-zinc-950 shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_24px_48px_-32px_rgba(15,23,42,0.18)] h-full">
      <div className="max-w-[68ch] mx-auto px-10 py-10">
        <header className="flex flex-col gap-3 pb-8 border-b border-border/70">
          <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
            <span>{documentTypeLabel(type)}</span>
            <span className="opacity-50">·</span>
            <span>{issued}</span>
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {title || "Untitled"}
          </h1>
        </header>
        <div className="doc-render py-8">
          {(content.content ?? []).map((node, i) => (
            <Fragment key={i}>{renderNode(node, variableContext)}</Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
