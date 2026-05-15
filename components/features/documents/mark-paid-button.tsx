"use client";

import { useState, useTransition } from "react";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { markInvoicePaid } from "@/lib/documents/invoice-mutations";
import type { PaymentMethod } from "@/types";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: "Bank transfer",
  cash: "Cash",
  cheque: "Cheque",
  card: "Card",
  other: "Other",
};

interface MarkPaidButtonProps {
  documentId: string;
  isPaid?: boolean;
}

export function MarkPaidButton({
  documentId,
  isPaid: initialIsPaid = false,
}: MarkPaidButtonProps) {
  const router = useRouter();
  const [paid, setPaid] = useState(initialIsPaid);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [, startTransition] = useTransition();

  if (paid) {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 border-green-600 text-green-600 dark:border-green-400 dark:text-green-400"
      >
        <CheckCircle className="h-3.5 w-3.5" />
        Paid
      </Badge>
    );
  }

  const handleConfirm = () => {
    setLoading(true);
    setError("");
    startTransition(async () => {
      const result = await markInvoicePaid(documentId, {
        method,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      if (result.ok) {
        setPaid(true);
        setOpen(false);
        toast.success("Invoice marked as paid");
        router.refresh();
      } else {
        setError(result.error ?? "Failed to mark as paid.");
        toast.error(result.error ?? "Failed to mark as paid.");
      }
      setLoading(false);
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
          <CheckCircle className="h-4 w-4" />
          Mark as Paid
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>
              This will mark the invoice as paid and record the payment details.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-1">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payment-method">Payment method</Label>
              <Select
                value={method}
                onValueChange={(v) => setMethod(v as PaymentMethod)}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue>{PAYMENT_METHOD_LABELS[method]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(PAYMENT_METHOD_LABELS) as [
                      PaymentMethod,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payment-reference">
                Reference{" "}
                <span className="text-muted-foreground font-normal">
                  (cheque no., transfer ID, etc.)
                </span>
              </Label>
              <Input
                id="payment-reference"
                placeholder="Optional"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payment-notes">
                Notes{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="payment-notes"
                placeholder="Optional"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving…
                </>
              ) : (
                "Confirm payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
