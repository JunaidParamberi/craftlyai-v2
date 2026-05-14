"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TiptapLink from "@tiptap/extension-link";
import Typography from "@tiptap/extension-typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, XCircle, FileText, ArrowRight } from "lucide-react";
import { updateDocument } from "@/lib/documents/document-mutations";
import { updateProposalMeta, convertProposalToInvoice } from "@/lib/documents/proposal-mutations";
import { ProposalMetaFields } from "./proposal-meta-fields";
import { SendProposalButton } from "./send-proposal-button";
import { InvoiceLineItemsEditor } from "./invoice-line-items-editor";
import type { ProposalDocumentRow, ClientRow, ProjectListRow } from "@/types";
import { toast } from "sonner";

const NONE_VALUE = "__none";

// Statuses freelancer can manually set — approved/declined are client-only
const EDITABLE_STATUSES = ["draft", "sent", "viewed", "archived"] as const;

interface ProposalEditFormProps {
  document: ProposalDocumentRow;
  clients: ClientRow[];
  projects: ProjectListRow[];
  clientEmail?: string | null;
}

export function ProposalEditForm({
  document,
  clients,
  projects,
  clientEmail,
}: ProposalEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(document.title);
  const [clientId, setClientId] = useState(document.client_id ?? "");
  const [projectId, setProjectId] = useState(document.project_id ?? "");
  const [status, setStatus] = useState<string>(document.status);

  const selectedClient = clients.find((c) => c.id === clientId);
  const filteredProjects = projects.filter(
    (p) => !clientId || p.client_id === clientId,
  );
  const currency = selectedClient?.currency ?? "USD";

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing your proposal…" }),
      TiptapLink.configure({ openOnClick: false }),
      Typography,
    ],
    content: document.content_json,
    editorProps: {
      attributes: { class: "doc-prose min-h-[480px] focus:outline-none px-1" },
    },
  });

  const handleSave = () => {
    if (!editor) return;
    startTransition(async () => {
      const result = await updateDocument(document.id, {
        title: title.trim() || "Untitled Proposal",
        type: "proposal",
        content_json: editor.getJSON(),
        client_id: clientId || "",
        project_id: projectId || "",
        status,
      });
      if (result.ok) {
        toast.success("Proposal saved");
      } else {
        toast.error(result.message ?? "Failed to save");
      }
    });
  };

  const handleStatusChange = (v: string) => {
    setStatus(v as typeof status);
    startTransition(async () => {
      await updateDocument(document.id, {
        title,
        type: "proposal",
        status: v as "draft",
        client_id: clientId || "",
        project_id: projectId || "",
        content_json: editor?.getJSON() ?? document.content_json,
      });
    });
  };

  const handleConvertToInvoice = () => {
    startTransition(async () => {
      const result = await convertProposalToInvoice(document.id);
      if (result.ok && result.invoiceId) {
        toast.success("Invoice created");
        router.push(`/documents/${result.invoiceId}/edit`);
      } else {
        toast.error(result.error ?? "Failed to convert");
      }
    });
  };

  const handleDiscountSave = (value: number, type: "percent" | "flat") => {
    startTransition(async () => {
      await updateProposalMeta(document.id, {
        proposal_number: document.proposal_number,
        valid_until: document.valid_until,
        notes_footer: document.notes_footer,
        discount_value: value,
        discount_type: type,
      });
    });
  };

  const isApproved = document.status === "approved";
  const isDeclined = document.status === "declined";

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="proposal-title"
          className="text-xs uppercase tracking-[0.14em] text-muted-foreground"
        >
          Proposal title
        </Label>
        <Input
          id="proposal-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          placeholder="e.g. Website redesign — Acme Corp"
          className="font-heading text-xl h-12 border-border/70 bg-card shadow-sm"
        />
      </div>

      {/* Approval / decline banners */}
      {isApproved ? (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 dark:bg-emerald-950/20 dark:border-emerald-800">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Approved
              {document.approved_at
                ? ` on ${new Date(document.approved_at).toLocaleDateString()}`
                : ""}
            </p>
            {document.approval_message ? (
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                &ldquo;{document.approval_message}&rdquo;
              </p>
            ) : null}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleConvertToInvoice}
            disabled={isPending}
            className="shrink-0 gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
          >
            Convert to Invoice
            <ArrowRight className="size-3" />
          </Button>
        </div>
      ) : null}

      {isDeclined ? (
        <div className="flex items-center gap-2 rounded-lg bg-muted border border-border px-4 py-3">
          <XCircle className="size-4 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            Declined
            {document.declined_at
              ? ` on ${new Date(document.declined_at).toLocaleDateString()}`
              : ""}
            {document.approval_message
              ? ` · "${document.approval_message}"`
              : ""}
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main column: editor + meta + pricing */}
        <div className="flex flex-col gap-6">
          {/* Tiptap editor canvas */}
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <EditorContent editor={editor} />
          </div>

          <ProposalMetaFields
            documentId={document.id}
            initialProposalNumber={document.proposal_number}
            initialValidUntil={document.valid_until}
            initialNotesFooter={document.notes_footer}
          />

          {/* Optional pricing section */}
          <div>
            <p className="text-base font-semibold text-foreground mb-4">
              Pricing{" "}
              <span className="font-normal text-muted-foreground text-sm">
                (optional)
              </span>
            </p>
            <InvoiceLineItemsEditor
              documentId={document.id}
              initialItems={document.line_items}
              discountValue={Number(document.discount_value ?? 0)}
              discountType={document.discount_type ?? "percent"}
              currency={currency}
              onDiscountSave={handleDiscountSave}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside>
          <Card className="border-border/70 sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-tight">
                Properties
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FieldRow label="Status">
                <Select value={status} onValueChange={(v) => handleStatusChange(v as string)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EDITABLE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>

              <FieldRow label="Client">
                <Select
                  value={clientId || NONE_VALUE}
                  onValueChange={(v) => {
                    const next = (v as string) === NONE_VALUE ? "" : (v as string);
                    setClientId(next);
                    if (next && projectId) {
                      const stillValid = projects.some(
                        (p) => p.id === projectId && p.client_id === next,
                      );
                      if (!stillValid) setProjectId("");
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None">
                      {selectedClient?.name ?? "None"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>None</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>

              <FieldRow label="Project">
                <Select
                  value={projectId || NONE_VALUE}
                  onValueChange={(v) =>
                    setProjectId((v as string) === NONE_VALUE ? "" : (v as string))
                  }
                  disabled={filteredProjects.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None">
                      {filteredProjects.find((p) => p.id === projectId)
                        ?.title ?? "None"}
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

              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <a
                    href={`/api/documents/${document.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
                className="w-full gap-2"
              >
                <FileText className="size-4" />
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Sticky footer actions */}
      <div className="sticky bottom-4 z-10 flex justify-end">
        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/95 px-2 py-2 shadow-lg backdrop-blur">
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            nativeButton={false}
            render={<Link href={`/documents/${document.id}`} />}
          >
            Cancel
          </Button>
          <SendProposalButton
            documentId={document.id}
            defaultEmail={clientEmail ?? ""}
          />
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
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
