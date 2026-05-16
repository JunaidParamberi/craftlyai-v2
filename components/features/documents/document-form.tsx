"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  createDocument,
  updateDocument,
} from "@/lib/documents/document-mutations";
import { documentTypeLabel } from "@/lib/documents/display";
import {
  DOCUMENT_LIMITS,
  DOCUMENT_STATUSES,
  DOCUMENT_TYPES,
  type DocumentInputForm,
} from "@/lib/validations/document";
import { buildClientSideContext } from "@/lib/documents/variables-client";
import { emptyVariableContext, type VariableContext } from "@/lib/documents/variables";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import type { ClientRow, LineItemRow, ProjectListRow, TiptapDoc } from "@/types";
import { InvoiceMetaFields } from "./invoice-meta-fields";
import { InvoiceLineItemsEditor } from "./invoice-line-items-editor";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TiptapEditor } from "./editor/tiptap-editor";
import { SaveAsTemplateButton } from "./save-as-template-button";
import { DocumentPreviewPanel } from "./editor/document-preview-panel";

type CreateProps = {
  mode: "create";
  defaultValues: DocumentInputForm;
};
type EditProps = {
  mode: "edit";
  documentId: string;
  defaultValues: DocumentInputForm;
};

type DocumentFormProps = (CreateProps | EditProps) & {
  clients: ClientRow[];
  projects: ProjectListRow[];
  initialVariableContext?: VariableContext;
  invoiceData?: {
    invoice_number: string | null;
    due_date: string | null;
    payment_terms: string | null;
    notes_footer: string | null;
    line_items: LineItemRow[];
    currency?: string;
  };
};

const NONE_VALUE = "__none";

export function DocumentForm(props: DocumentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<DocumentInputForm>({
    defaultValues: props.defaultValues,
  });
  const { register, handleSubmit, watch, setValue } = form;

  const watchedContent = watch("content_json");
  const watchedClient = watch("client_id");
  const watchedProject = watch("project_id");
  const watchedType = watch("type");

  const [showPreview, setShowPreview] = useState(false);
  const debouncedContent = useDebounce(watchedContent, 500);

  const liveVariableContext = useMemo(
    () =>
      buildClientSideContext({
        clientId: watchedClient || undefined,
        projectId: watchedProject || undefined,
        clients: props.clients,
        projects: props.projects,
        initialCtx: props.initialVariableContext ?? emptyVariableContext(),
      }),
    [watchedClient, watchedProject, props.clients, props.projects, props.initialVariableContext],
  );

  const isEditMode = props.mode === "edit";
  const documentId = isEditMode ? props.documentId : null;

  const filteredProjects = props.projects.filter(
    (p) => !watchedClient || p.client_id === watchedClient,
  );

  const selectedClientLabel =
    watchedClient && watchedClient !== ""
      ? (props.clients.find((c) => c.id === watchedClient)?.name ??
        "Unknown client")
      : undefined;
  const selectedProjectLabel =
    watchedProject && watchedProject !== ""
      ? (filteredProjects.find((p) => p.id === watchedProject)?.title ??
        props.projects.find((p) => p.id === watchedProject)?.title ??
        "Unknown project")
      : undefined;

  const onSubmit = handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      const payload = {
        ...values,
        client_id: values.client_id || "",
        project_id: values.project_id || "",
      };
      const result =
        props.mode === "create"
          ? await createDocument(payload)
          : await updateDocument(props.documentId, payload);

      if (!result.ok) {
        setError(result.message);
        return;
      }
      const target =
        props.mode === "create"
          ? `/documents/${result.document.id}`
          : `/documents/${props.documentId}`;
      router.push(target);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not save</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div
        className={cn(
          "grid gap-6",
          showPreview
            ? "lg:grid-cols-[1fr_minmax(0,480px)]"
            : "lg:grid-cols-[1fr_320px]",
        )}
      >
        {/* Editor */}
        <div className="flex flex-col gap-4">
          {isEditMode && watchedType === "invoice" && props.invoiceData ? (
            <InvoiceMetaFields
              documentId={documentId!}
              initialValues={{
                invoice_number: props.invoiceData.invoice_number,
                due_date: props.invoiceData.due_date,
                payment_terms: props.invoiceData.payment_terms,
                notes_footer: props.invoiceData.notes_footer,
              }}
            />
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Document title
            </Label>
            <Input
              id="title"
              {...register("title", { required: true, maxLength: DOCUMENT_LIMITS.title })}
              placeholder="e.g. Proposal — Acme website redesign"
              className="font-heading text-xl h-12 border-border/70 bg-card shadow-sm"
              maxLength={DOCUMENT_LIMITS.title}
            />
          </div>

          <TiptapEditor
            value={(watchedContent as TiptapDoc) ?? props.defaultValues.content_json}
            onChange={(next) => setValue("content_json", next, { shouldDirty: true })}
            placeholder="Begin your document. Use {{variables}} to pull in client, project, and brand details."
          />

          {isEditMode && watchedType === "invoice" && props.invoiceData ? (
            <InvoiceLineItemsEditor
              documentId={documentId!}
              initialItems={props.invoiceData.line_items}
              currency={props.invoiceData.currency}
            />
          ) : null}
        </div>

        {showPreview ? (
          <DocumentPreviewPanel
            title={watch("title")}
            type={watchedType}
            content={
              (debouncedContent as TiptapDoc) ?? props.defaultValues.content_json
            }
            variableContext={liveVariableContext}
          />
        ) : (
          <aside className="flex flex-col gap-4">
            <Card className="border-border/70">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold tracking-tight">
                  Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FieldRow label="Type">
                  <Select
                    value={watchedType}
                    onValueChange={(v) =>
                      setValue("type", (v as string) as DocumentInputForm["type"], {
                        shouldDirty: true,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          <span className="flex items-center gap-2">
                            <TypeDot type={t} />
                            {documentTypeLabel(t)}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>

                <FieldRow label="Status">
                  <Select
                    value={watch("status") ?? "draft"}
                    onValueChange={(v) =>
                      setValue("status", (v as string) as DocumentInputForm["status"], {
                        shouldDirty: true,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s[0].toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>

                <FieldRow label="Client">
                  <Select
                    value={watchedClient && watchedClient !== "" ? watchedClient : NONE_VALUE}
                    onValueChange={(v) => {
                      const value = (v as string) ?? "";
                      const next = value === NONE_VALUE ? "" : value;
                      setValue("client_id", next, { shouldDirty: true });
                      // Clear project if it no longer matches client
                      if (next && watchedProject) {
                        const stillValid = props.projects.some(
                          (p) => p.id === watchedProject && p.client_id === next,
                        );
                        if (!stillValid) setValue("project_id", "");
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="None">
                        {selectedClientLabel ?? "None"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>None</SelectItem>
                      {props.clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>

                <FieldRow label="Project">
                  <Select
                    value={watchedProject && watchedProject !== "" ? watchedProject : NONE_VALUE}
                    onValueChange={(v) => {
                      const value = (v as string) ?? "";
                      setValue(
                        "project_id",
                        value === NONE_VALUE ? "" : value,
                        { shouldDirty: true },
                      );
                    }}
                    disabled={filteredProjects.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="None">
                        {selectedProjectLabel ?? "None"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>None</SelectItem>
                      {filteredProjects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 border-t border-border/60 pt-4">
                <SaveAsTemplateButton
                  type={watchedType}
                  content={(watchedContent as TiptapDoc) ?? props.defaultValues.content_json}
                  defaultName={watch("title") || "Untitled template"}
                />
              </CardFooter>
            </Card>

            <Card className="border-border/70 bg-muted/40">
              <CardContent className="pt-5 text-xs leading-relaxed text-muted-foreground">
                <p className="mb-2 font-medium text-foreground/80">
                  About variables
                </p>
                <p>
                  Type{" "}
                  <code className="font-mono text-[0.85em] rounded bg-background px-1 py-0.5">
                    {"{{client_name}}"}
                  </code>{" "}
                  or use the toolbar menu. The detail view substitutes them
                  against the selected client, project, and your brand kit.
                </p>
              </CardContent>
            </Card>
          </aside>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 sticky bottom-4 z-10">
        <div className="rounded-full bg-background/95 backdrop-blur border border-border/70 shadow-lg px-2 py-2 flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={() => setShowPreview((v) => !v)}
            title={showPreview ? "Hide preview" : "Show preview"}
          >
            {showPreview ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            nativeButton={false}
            render={
              <Link
                href={
                  props.mode === "edit"
                    ? `/documents/${props.documentId}`
                    : "/documents"
                }
              />
            }
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving…"
              : props.mode === "create"
                ? "Create document"
                : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function TypeDot({ type }: { type: DocumentInputForm["type"] }) {
  const color = TYPE_COLORS[type];
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2 rounded-full", color)}
    />
  );
}

const TYPE_COLORS: Record<DocumentInputForm["type"], string> = {
  proposal: "bg-indigo-500",
  quote: "bg-amber-500",
  invoice: "bg-emerald-500",
  payment_voucher: "bg-emerald-400",
  other: "bg-zinc-400",
};
