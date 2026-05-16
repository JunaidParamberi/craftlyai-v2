"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateInvoiceMeta } from "@/lib/documents/invoice-mutations";
import { FormDatePicker } from "@/components/shared/form-date-picker";
import type { LPOSummary } from "@/lib/documents/lpo-queries";

interface InvoiceMetaFieldsProps {
  documentId: string;
  initialValues: {
    invoice_number: string | null;
    due_date: string | null;
    payment_terms: string | null;
    notes_footer: string | null;
    lpo_reference_number?: string | null;
  };
  lpos?: LPOSummary[];
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function InvoiceMetaFields({
  documentId,
  initialValues,
  lpos,
}: InvoiceMetaFieldsProps) {
  const [invoiceNumber, setInvoiceNumber] = useState(
    initialValues.invoice_number ?? ""
  );
  const [dueDate, setDueDate] = useState(initialValues.due_date ?? "");
  const [paymentTerms, setPaymentTerms] = useState(
    initialValues.payment_terms ?? ""
  );
  const [notesFooter, setNotesFooter] = useState(
    initialValues.notes_footer ?? ""
  );
  const [lpoReferenceNumber, setLpoReferenceNumber] = useState(
    initialValues.lpo_reference_number ?? null
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [, startTransition] = useTransition();

  const handleSave = () => {
    setSaveState("saving");
    startTransition(async () => {
      const result = await updateInvoiceMeta(documentId, {
        invoice_number: invoiceNumber || null,
        due_date: dueDate || null,
        payment_terms: paymentTerms || null,
        notes_footer: notesFooter || null,
        lpo_reference_number: lpoReferenceNumber || null,
      });
      if (result.ok) {
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      } else {
        setSaveState("error");
        setTimeout(() => setSaveState("idle"), 3000);
      }
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          Invoice Details
        </h2>
        {saveState === "saving" && (
          <span className="text-xs text-muted-foreground animate-pulse">
            Saving…
          </span>
        )}
        {saveState === "saved" && (
          <span className="text-xs text-green-600 dark:text-green-400">
            Saved
          </span>
        )}
        {saveState === "error" && (
          <span className="text-xs text-destructive">Save failed</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="invoice_number">Invoice Number</Label>
          <Input
            id="invoice_number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            onBlur={handleSave}
            placeholder="INV-0001"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Due Date</Label>
          <FormDatePicker
            value={dueDate}
            onChange={(val: string) => {
              setDueDate(val);
              setSaveState("saving");
              startTransition(async () => {
                const result = await updateInvoiceMeta(documentId, {
                  invoice_number: invoiceNumber || null,
                  due_date: val || null,
                  payment_terms: paymentTerms || null,
                  notes_footer: notesFooter || null,
                  lpo_reference_number: lpoReferenceNumber || null,
                });
                if (result.ok) {
                  setSaveState("saved");
                  setTimeout(() => setSaveState("idle"), 2000);
                } else {
                  setSaveState("error");
                  setTimeout(() => setSaveState("idle"), 3000);
                }
              });
            }}
            placeholder="Select due date"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="payment_terms">Payment Terms</Label>
        <Input
          id="payment_terms"
          value={paymentTerms}
          onChange={(e) => setPaymentTerms(e.target.value)}
          onBlur={handleSave}
          placeholder="e.g. Net 30, Due on receipt"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes_footer">Notes / Footer</Label>
        <Textarea
          id="notes_footer"
          value={notesFooter}
          onChange={(e) => setNotesFooter(e.target.value)}
          onBlur={handleSave}
          placeholder="Bank details, thank-you note, or payment instructions"
          rows={3}
        />
      </div>

      {(lpos?.length ?? 0) > 0 ? (
        <div className="space-y-1.5">
          <Label>LPO Reference (optional)</Label>
          <Select
            value={lpoReferenceNumber ?? ""}
            onValueChange={(val) => {
              const next = val || null;
              setLpoReferenceNumber(next);
              setSaveState("saving");
              startTransition(async () => {
                const result = await updateInvoiceMeta(documentId, {
                  invoice_number: invoiceNumber || null,
                  due_date: dueDate || null,
                  payment_terms: paymentTerms || null,
                  notes_footer: notesFooter || null,
                  lpo_reference_number: next,
                });
                if (result.ok) {
                  setSaveState("saved");
                  setTimeout(() => setSaveState("idle"), 2000);
                } else {
                  setSaveState("error");
                  setTimeout(() => setSaveState("idle"), 3000);
                }
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select LPO…" />
            </SelectTrigger>
            <SelectContent>
              {lpos!.map((lpo) => (
                <SelectItem key={lpo.id} value={lpo.lpo_number}>
                  {lpo.lpo_number} — {lpo.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            LPO number prints on the invoice.
          </p>
        </div>
      ) : null}
    </section>
  );
}
