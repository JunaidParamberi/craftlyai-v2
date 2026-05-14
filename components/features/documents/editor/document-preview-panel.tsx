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

  const brand = variableContext.brand;
  const client = variableContext.client;
  const project = variableContext.project;
  const primaryColor = brand?.primary_color ?? "#6366f1";
  const businessName = brand?.business_name ?? null;
  const logoUrl = brand?.logo_url ?? null;
  const clientName = client?.name ?? null;
  const clientCompany = client?.company ?? null;
  const projectTitle = project?.title ?? null;

  const hasMetaBlock = clientName || clientCompany || projectTitle;

  return (
    <div className="overflow-y-auto rounded-2xl border border-border/70 bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_24px_48px_-32px_rgba(15,23,42,0.18)] h-full flex flex-col">
      {/* PDF Header */}
      <div className="flex items-start justify-between px-10 pt-10 pb-5 border-b border-border/40">
        <div>
          {logoUrl ? (
            <img src={logoUrl} alt="Brand logo" className="h-8 w-auto object-contain" />
          ) : (
            <span className="text-sm font-bold" style={{ color: primaryColor }}>
              {businessName ?? ""}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            {documentTypeLabel(type)}
          </p>
          <p className="text-sm font-semibold font-heading leading-snug max-w-[24ch]">
            {title || "Untitled"}
          </p>
        </div>
      </div>

      {/* PDF Meta block */}
      {hasMetaBlock ? (
        <div className="flex items-start justify-between px-10 py-5 bg-muted/30">
          <div className="flex flex-col gap-3">
            {clientName ? (
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground mb-0.5">
                  Prepared for
                </p>
                <p className="text-sm font-medium">{clientName}</p>
                {clientCompany ? (
                  <p className="text-xs text-muted-foreground">{clientCompany}</p>
                ) : null}
              </div>
            ) : null}
            {projectTitle ? (
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground mb-0.5">
                  Project
                </p>
                <p className="text-sm font-medium">{projectTitle}</p>
              </div>
            ) : null}
          </div>
          <div className="text-right">
            <p className="text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground mb-0.5">
              Date issued
            </p>
            <p className="text-sm font-medium">{issued}</p>
          </div>
        </div>
      ) : (
        <div className="px-10 py-4 flex justify-end bg-muted/30">
          <div className="text-right">
            <p className="text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground mb-0.5">
              Date issued
            </p>
            <p className="text-sm font-medium">{issued}</p>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="mx-10 border-t border-border/60" />

      {/* Body */}
      <div className="flex-1 px-10 py-8">
        <div className="doc-render">
          {(content.content ?? []).map((node, i) => (
            <Fragment key={i}>{renderNode(node, variableContext)}</Fragment>
          ))}
        </div>
      </div>

      {/* PDF Footer */}
      {businessName ? (
        <div className="flex items-center justify-between px-10 py-4 border-t border-border/40 mt-auto">
          <span className="text-xs text-muted-foreground">{businessName}</span>
        </div>
      ) : null}
    </div>
  );
}
