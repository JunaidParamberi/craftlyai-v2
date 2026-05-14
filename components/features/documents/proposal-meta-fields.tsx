"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProposalMeta } from "@/lib/documents/proposal-mutations";
import { FormDatePicker } from "@/components/shared/form-date-picker";

interface ProposalMetaFieldsProps {
  documentId: string;
  initialProposalNumber: string | null;
  initialValidUntil: string | null;
  initialNotesFooter: string | null;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function ProposalMetaFields({
  documentId,
  initialProposalNumber,
  initialValidUntil,
  initialNotesFooter,
}: ProposalMetaFieldsProps) {
  const [proposalNumber, setProposalNumber] = useState(initialProposalNumber ?? "");
  const [validUntil, setValidUntil] = useState(initialValidUntil ?? "");
  const [notesFooter, setNotesFooter] = useState(initialNotesFooter ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [, startTransition] = useTransition();

  const handleSave = () => {
    setSaveState("saving");
    startTransition(async () => {
      const result = await updateProposalMeta(documentId, {
        proposal_number: proposalNumber || null,
        valid_until: validUntil || null,
        notes_footer: notesFooter || null,
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
          Proposal Details
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
          <Label htmlFor="proposal_number">Proposal Number</Label>
          <Input
            id="proposal_number"
            value={proposalNumber}
            onChange={(e) => setProposalNumber(e.target.value)}
            onBlur={handleSave}
            placeholder="PRO-0001"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Valid Until</Label>
          <FormDatePicker
            value={validUntil}
            onChange={(val: string) => {
              setValidUntil(val);
              setSaveState("saving");
              startTransition(async () => {
                const result = await updateProposalMeta(documentId, {
                  proposal_number: proposalNumber || null,
                  valid_until: val || null,
                  notes_footer: notesFooter || null,
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
            placeholder="Select expiry date"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes_footer">Notes / Footer</Label>
        <Textarea
          id="notes_footer"
          value={notesFooter}
          onChange={(e) => setNotesFooter(e.target.value)}
          onBlur={handleSave}
          placeholder="Validity period, scope notes, or terms"
          rows={3}
        />
      </div>
    </section>
  );
}
