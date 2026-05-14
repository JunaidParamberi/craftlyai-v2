"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { convertQuoteToInvoice } from "@/lib/documents/quote-mutations";
import type { DocumentStatus } from "@/types";

interface QuoteApprovalStatusProps {
  documentId: string;
  status: DocumentStatus;
  approvedAt: string | null;
  declinedAt: string | null;
  approvalMessage: string | null;
  approvalToken: string | null;
}

export function QuoteApprovalStatus({
  documentId,
  status,
  approvedAt,
  declinedAt,
  approvalMessage,
  approvalToken,
}: QuoteApprovalStatusProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "";

  const handleConvert = () => {
    setError(null);
    startTransition(async () => {
      const result = await convertQuoteToInvoice(documentId);
      if (result.ok && result.invoiceId) {
        router.push(`/documents/${result.invoiceId}`);
      } else {
        setError(result.error ?? "Failed to convert quote.");
      }
    });
  };

  if (status === "approved") {
    const date = approvedAt
      ? new Date(approvedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Approved{date ? ` on ${date}` : ""}
          </span>
        </div>
        {approvalMessage ? (
          <p className="text-sm text-muted-foreground italic pl-6">
            &ldquo;{approvalMessage}&rdquo;
          </p>
        ) : null}
        <div className="pl-6">
          <Button
            size="sm"
            onClick={handleConvert}
            disabled={isPending}
            className="gap-2"
          >
            <FileText className="size-4" />
            {isPending ? "Converting…" : "Convert to Invoice"}
          </Button>
          {error ? (
            <p className="mt-1 text-xs text-destructive">{error}</p>
          ) : null}
        </div>
      </div>
    );
  }

  if (status === "declined") {
    const date = declinedAt
      ? new Date(declinedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <XCircle className="size-4 text-destructive shrink-0" />
          <span className="text-sm font-medium text-destructive">
            Declined{date ? ` on ${date}` : ""}
          </span>
        </div>
        {approvalMessage ? (
          <p className="text-sm text-muted-foreground italic pl-6">
            &ldquo;{approvalMessage}&rdquo;
          </p>
        ) : null}
      </div>
    );
  }

  if (approvalToken) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">Awaiting response</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground text-xs">Approval link:</span>
          <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded truncate max-w-[280px]">
            {`${appUrl}/quote/${approvalToken}`}
          </code>
        </div>
      </div>
    );
  }

  return null;
}
