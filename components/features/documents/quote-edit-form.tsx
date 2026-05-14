"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateDocument } from "@/lib/documents/document-mutations";
import { updateQuoteMeta } from "@/lib/documents/quote-mutations";
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

import { QuoteMetaFields } from "./quote-meta-fields";
import { InvoiceLineItemsEditor } from "./invoice-line-items-editor";

const NONE_VALUE = "__none";

// Statuses freelancer can manually set — approved/declined are client-only
const EDITABLE_STATUSES = ["draft", "sent", "viewed", "archived"] as const;

interface QuoteEditFormProps {
  documentId: string;
  initialTitle: string;
  initialStatus: string;
  initialClientId: string | null;
  initialProjectId: string | null;
  clients: ClientRow[];
  projects: ProjectListRow[];
  quoteData: {
    quote_number: string | null;
    valid_until: string | null;
    notes_footer: string | null;
    line_items: LineItemRow[];
    currency: string;
    discount_value?: number;
    discount_type?: 'percent' | 'flat';
  };
}

export function QuoteEditForm({
  documentId,
  initialTitle,
  initialStatus,
  initialClientId,
  initialProjectId,
  clients,
  projects,
  quoteData,
}: QuoteEditFormProps) {
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

  const currency = selectedClient?.currency ?? quoteData.currency ?? "USD";

  const handleSaveProperties = () => {
    startTransition(async () => {
      await updateDocument(documentId, {
        title,
        type: "quote",
        status: status as "draft",
        client_id: clientId || "",
        project_id: projectId || "",
        content_json: { type: "doc", content: [] },
      });
      router.push(`/documents/${documentId}`);
    });
  };

  const handleDiscountSave = (value: number, type: 'percent' | 'flat') => {
    startTransition(async () => {
      await updateQuoteMeta(documentId, {
        quote_number: quoteData.quote_number,
        valid_until: quoteData.valid_until,
        notes_footer: quoteData.notes_footer,
        discount_value: value,
        discount_type: type,
      });
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="quote-title"
          className="text-xs uppercase tracking-[0.14em] text-muted-foreground"
        >
          Quote title
        </Label>
        <Input
          id="quote-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSaveProperties}
          placeholder="e.g. Website redesign — Acme Corp"
          className="font-heading text-xl h-12 border-border/70 bg-card shadow-sm"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main: quote details + line items */}
        <div className="flex flex-col gap-6">
          <QuoteMetaFields
            documentId={documentId}
            initialValues={{
              quote_number: quoteData.quote_number,
              valid_until: quoteData.valid_until,
              notes_footer: quoteData.notes_footer,
            }}
          />

          <InvoiceLineItemsEditor
            documentId={documentId}
            initialItems={quoteData.line_items}
            currency={currency}
            discountValue={quoteData.discount_value ?? 0}
            discountType={quoteData.discount_type ?? 'percent'}
            onDiscountSave={handleDiscountSave}
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
                        type: "quote",
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
