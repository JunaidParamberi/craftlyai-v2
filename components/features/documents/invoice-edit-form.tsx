"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateDocument } from "@/lib/documents/document-mutations";
import { DOCUMENT_STATUSES } from "@/lib/validations/document";
import type { ClientRow, LineItemRow, ProjectListRow } from "@/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { InvoiceMetaFields } from "./invoice-meta-fields";
import { InvoiceLineItemsEditor } from "./invoice-line-items-editor";
import type { LPOSummary } from "@/lib/documents/lpo-queries";

const NONE_VALUE = "__none";

interface InvoiceEditFormProps {
  documentId: string;
  initialTitle: string;
  initialStatus: string;
  initialClientId: string | null;
  initialProjectId: string | null;
  clients: ClientRow[];
  projects: ProjectListRow[];
  invoiceData: {
    invoice_number: string | null;
    due_date: string | null;
    payment_terms: string | null;
    notes_footer: string | null;
    lpo_reference_number: string | null;
    line_items: LineItemRow[];
    currency: string;
    discount_value?: number;
    discount_type?: 'percent' | 'flat';
  };
  lpos?: LPOSummary[];
}

export function InvoiceEditForm({
  documentId,
  initialTitle,
  initialStatus,
  initialClientId,
  initialProjectId,
  clients,
  projects,
  invoiceData,
  lpos,
}: InvoiceEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState(initialStatus);
  const [clientId, setClientId] = useState(initialClientId ?? "");
  const [projectId, setProjectId] = useState(initialProjectId ?? "");

  const selectedClient = clients.find((c) => c.id === clientId);
  const filteredProjects = projects.filter(
    (p) => !clientId || p.client_id === clientId,
  );

  const currency = selectedClient?.currency ?? invoiceData.currency ?? "USD";

  const handleSaveProperties = () => {
    startTransition(async () => {
      await updateDocument(documentId, {
        title,
        type: "invoice",
        status: status as "draft",
        client_id: clientId || "",
        project_id: projectId || "",
        content_json: { type: "doc", content: [] },
      });
      router.push(`/documents/${documentId}`);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="invoice-title"
          className="text-xs uppercase tracking-[0.14em] text-muted-foreground"
        >
          Invoice title
        </Label>
        <Input
          id="invoice-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSaveProperties}
          placeholder="e.g. Web design — Acme Corp"
          className="font-heading text-xl h-12 border-border/70 bg-card shadow-sm"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main: invoice details + line items */}
        <div className="flex flex-col gap-6">
          <InvoiceMetaFields
            documentId={documentId}
            initialValues={{
              invoice_number: invoiceData.invoice_number,
              due_date: invoiceData.due_date,
              payment_terms: invoiceData.payment_terms,
              notes_footer: invoiceData.notes_footer,
              lpo_reference_number: invoiceData.lpo_reference_number,
            }}
            lpos={lpos}
          />

          <InvoiceLineItemsEditor
            documentId={documentId}
            initialItems={invoiceData.line_items}
            currency={currency}
            discountValue={invoiceData.discount_value ?? 0}
            discountType={invoiceData.discount_type ?? 'percent'}
          />
        </div>

        {/* Sidebar: status + client + project */}
        <aside>
          <Card className="border-border/70 sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-tight">
                Properties
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FieldRow label="Status">
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setStatus(v as string);
                    startTransition(async () => {
                      await updateDocument(documentId, {
                        title,
                        type: "invoice",
                        status: v as "draft",
                        client_id: clientId || "",
                        project_id: projectId || "",
                        content_json: { type: "doc", content: [] },
                      });
                      router.push(`/documents/${documentId}`);
                    });
                  }}
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
                  value={clientId || NONE_VALUE}
                  onValueChange={(v) => {
                    const next = v === NONE_VALUE ? "" : (v as string);
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
                  onValueChange={(v) => {
                    setProjectId(v === NONE_VALUE ? "" : (v as string));
                  }}
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
            render={<Link href={`/documents/${documentId}`} />}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={handleSaveProperties}
          >
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
