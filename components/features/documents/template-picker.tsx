"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { FileText, Sparkles, Trash2 } from "lucide-react";

import {
  createDocument,
  deleteTemplate,
} from "@/lib/documents/document-mutations";
import { documentTypeLabel } from "@/lib/documents/display";
import { defaultDocumentFormValues } from "@/lib/documents/form-values";
import { cn } from "@/lib/utils";
import type { DocumentTemplateRow, DocumentType, TiptapNode } from "@/types";

import { Badge } from "@/components/ui/badge";

const TYPE_ACCENTS: Record<DocumentType, string> = {
  proposal: "bg-indigo-500",
  quote: "bg-amber-500",
  invoice: "bg-emerald-500",
  payment_voucher: "bg-emerald-400",
  local_purchase_order: "bg-blue-500",
  other: "bg-zinc-400",
};

function previewText(content: { content?: TiptapNode[] } | null): string {
  if (!content?.content) return "";
  const parts: string[] = [];
  function walk(node: TiptapNode) {
    if (typeof node.text === "string") parts.push(node.text);
    if (Array.isArray(node.content)) node.content.forEach(walk);
  }
  content.content.forEach(walk);
  return parts.join(" ").trim().slice(0, 160);
}

type TemplatePickerProps = {
  templates: DocumentTemplateRow[];
};

export function TemplatePicker({ templates }: TemplatePickerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { systemTemplates, userTemplates } = useMemo(() => {
    return {
      systemTemplates: templates.filter((t) => t.is_system),
      userTemplates: templates.filter((t) => !t.is_system),
    };
  }, [templates]);

  function startFromTemplate(template: DocumentTemplateRow | null) {
    setError(null);
    startTransition(async () => {
      const defaults = defaultDocumentFormValues({ template });
      const result = await createDocument({
        title: defaults.title || (template ? template.name : "Untitled document"),
        type: defaults.type,
        status: "draft",
        client_id: "",
        project_id: "",
        content_json: defaults.content_json,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push(`/documents/${result.document.id}/edit`);
      router.refresh();
    });
  }

  function removeTemplate(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteTemplate(id);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-10">
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <section className="flex flex-col gap-4">
        <SectionHeading icon={<Sparkles className="size-3.5" />}>
          Start from a template
        </SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BlankCard
            onClick={() => startFromTemplate(null)}
            disabled={isPending}
          />
          {systemTemplates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onSelect={() => startFromTemplate(t)}
              disabled={isPending}
            />
          ))}
        </div>
      </section>

      {userTemplates.length > 0 ? (
        <section className="flex flex-col gap-4">
          <SectionHeading icon={<FileText className="size-3.5" />}>
            Your templates
          </SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userTemplates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onSelect={() => startFromTemplate(t)}
                onDelete={() => removeTemplate(t.id)}
                disabled={isPending}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SectionHeading({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
      <span className="text-foreground/70">{icon}</span>
      {children}
    </div>
  );
}

function BlankCard({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group flex aspect-[5/4] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card text-center transition",
        "hover:border-foreground/40 hover:bg-muted/40 disabled:opacity-60 disabled:cursor-not-allowed",
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground transition group-hover:bg-foreground group-hover:text-background">
        <FileText className="size-5" />
      </span>
      <span className="text-sm font-medium">Blank document</span>
      <span className="text-xs text-muted-foreground">Start with a clean canvas</span>
    </button>
  );
}

function TemplateCard({
  template,
  onSelect,
  onDelete,
  disabled,
}: {
  template: DocumentTemplateRow;
  onSelect: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}) {
  const preview = previewText(template.content_json);
  return (
    <div className="group relative flex aspect-[5/4] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition hover:border-foreground/40 hover:shadow-md">
      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className="flex flex-1 flex-col items-stretch text-left disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {/* Mini paper preview */}
        <div className="relative flex-1 bg-gradient-to-b from-muted/40 to-card px-5 pt-5 pb-3 overflow-hidden">
          <div className="font-heading text-[0.95rem] font-semibold tracking-tight text-foreground/90 line-clamp-2">
            {template.name}
          </div>
          <p className="mt-2 text-[0.65rem] leading-relaxed text-muted-foreground/80 line-clamp-4">
            {preview || "Empty document"}
          </p>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent"
          />
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-background/60 px-4 py-3">
          <span className="flex items-center gap-2 text-xs">
            <span
              aria-hidden
              className={cn(
                "inline-block size-1.5 rounded-full",
                TYPE_ACCENTS[template.type],
              )}
            />
            <span className="text-foreground/80">
              {documentTypeLabel(template.type)}
            </span>
          </span>
          {template.is_system ? (
            <Badge variant="outline" className="font-normal text-[0.65rem]">
              System
            </Badge>
          ) : null}
        </div>
      </button>
      {onDelete ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          className="absolute top-2 right-2 hidden size-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition hover:bg-destructive hover:text-destructive-foreground group-hover:flex"
          aria-label={`Delete ${template.name}`}
        >
          <Trash2 className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
