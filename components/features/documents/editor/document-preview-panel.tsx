"use client";

import { Fragment } from "react";

import { documentTypeLabel } from "@/lib/documents/display";
import { renderNode } from "@/components/features/documents/document-detail-view";
import type { VariableContext } from "@/lib/documents/variables";
import type { DocumentType, TiptapDoc } from "@/types";

// Explicit light-mode colors — never use CSS theme variables here.
// This panel is always rendered as white paper regardless of app color scheme.
const C = {
  ink: "rgb(15 15 15)",
  inkMid: "rgb(55 55 65)",
  inkFaint: "rgb(115 115 130)",
  border: "rgba(0,0,0,0.08)",
  metaBg: "rgba(0,0,0,0.025)",
} as const;

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
  const hasMetaBlock = !!(clientName || clientCompany || projectTitle);

  return (
    <div
      className="overflow-y-auto rounded-2xl h-full flex flex-col bg-white"
      style={{
        boxShadow: "0 0 0 1px rgba(0,0,0,0.07), 0 8px 40px -8px rgba(0,0,0,0.14)",
        color: C.ink,
        // Force light-mode CSS variables so doc-render class works correctly
        "--foreground": C.ink,
        "--muted-foreground": C.inkFaint,
        "--color-foreground": C.ink,
        "--color-muted-foreground": C.inkFaint,
      } as React.CSSProperties}
    >
      {/* Brand accent line */}
      <div style={{ height: 3, background: primaryColor, borderRadius: "12px 12px 0 0", flexShrink: 0 }} />

      {/* Header */}
      <div
        className="flex items-center justify-between px-8 py-5"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div>
          {logoUrl ? (
            <img src={logoUrl} alt="Brand logo" className="h-8 w-auto object-contain" />
          ) : (
            <span
              className="text-sm font-bold tracking-tight"
              style={{ color: primaryColor }}
            >
              {businessName ?? ""}
            </span>
          )}
        </div>
        <div className="text-right">
          <p
            className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] mb-0.5"
            style={{ color: C.inkFaint }}
          >
            {documentTypeLabel(type)}
          </p>
          <p
            className="text-sm font-semibold leading-snug max-w-[22ch]"
            style={{ color: C.ink }}
          >
            {title || "Untitled"}
          </p>
        </div>
      </div>

      {/* Meta block */}
      <div
        className="flex items-start justify-between px-8 py-4"
        style={{ background: C.metaBg, borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex gap-8">
          {clientName ? (
            <div>
              <p
                className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] mb-1"
                style={{ color: C.inkFaint }}
              >
                Prepared for
              </p>
              <p className="text-sm font-medium leading-tight" style={{ color: C.ink }}>
                {clientName}
              </p>
              {clientCompany ? (
                <p className="text-xs mt-0.5" style={{ color: C.inkMid }}>
                  {clientCompany}
                </p>
              ) : null}
            </div>
          ) : null}
          {projectTitle ? (
            <div>
              <p
                className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] mb-1"
                style={{ color: C.inkFaint }}
              >
                Project
              </p>
              <p className="text-sm font-medium leading-tight" style={{ color: C.ink }}>
                {projectTitle}
              </p>
            </div>
          ) : null}
          {!hasMetaBlock ? (
            <p className="text-xs italic" style={{ color: C.inkFaint }}>
              No client or project linked
            </p>
          ) : null}
        </div>
        <div className="text-right shrink-0">
          <p
            className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] mb-1"
            style={{ color: C.inkFaint }}
          >
            Date issued
          </p>
          <p className="text-sm font-medium" style={{ color: C.ink }}>
            {issued}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-8 py-7" style={{ color: C.ink }}>
        <div className="doc-render">
          {(content.content ?? []).map((node, i) => (
            <Fragment key={i}>{renderNode(node, variableContext)}</Fragment>
          ))}
        </div>
      </div>

      {/* Footer */}
      {businessName ? (
        <div
          className="flex items-center justify-between px-8 py-3"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          <span className="text-[0.65rem] font-medium" style={{ color: C.inkFaint }}>
            {businessName}
          </span>
          <span className="text-[0.65rem]" style={{ color: C.inkFaint }}>
            Preview
          </span>
        </div>
      ) : null}
    </div>
  );
}
