"use client";

import { useState, useTransition } from "react";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Button kept for the confirm/cancel actions inside the dialog
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
      const result = await markInvoicePaid(documentId);
      if (result.ok) {
        setPaid(true);
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Failed to mark as paid.");
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

        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark invoice as paid?</DialogTitle>
            <DialogDescription>
              This will update the invoice status to Paid and record the payment
              date as today. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error && <p className="text-xs text-destructive">{error}</p>}

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
                  Updating…
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
