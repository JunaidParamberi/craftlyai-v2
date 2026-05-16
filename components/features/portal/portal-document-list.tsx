import Link from "next/link";

import type { PortalDocumentItem } from "@/lib/portal/public-queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DocumentStatus, DocumentType } from "@/types";

const TYPE_LABELS: Record<DocumentType, string> = {
  invoice: "Invoice",
  quote: "Quote",
  proposal: "Proposal",
  payment_voucher: "Payment Voucher",
  local_purchase_order: "Purchase Order",
  other: "Document",
};

function statusVariant(
  status: DocumentStatus,
): "default" | "secondary" | "outline" | "destructive" {
  if (status === "paid" || status === "approved") return "default";
  if (status === "declined") return "destructive";
  return "secondary";
}

function formatStatus(status: DocumentStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

type PortalDocumentListProps = {
  documents: PortalDocumentItem[];
  clientName: string;
};

export function PortalDocumentList({
  documents,
  clientName,
}: PortalDocumentListProps) {
  if (documents.length === 0) {
    return (
      <Card className="border-border/60 bg-card shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
          <p className="font-medium text-foreground">No documents yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            When {clientName} receives quotes, proposals, or invoices, they will
            appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {documents.map((doc) => (
        <li key={doc.id}>
          <Card className="border-border/60 bg-card shadow-sm">
            <CardHeader className="gap-2 pb-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base font-semibold">
                    {doc.title}
                  </CardTitle>
                  <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-normal">
                      {TYPE_LABELS[doc.type]}
                    </Badge>
                    {doc.referenceNumber ? (
                      <span className="font-mono text-xs">
                        #{doc.referenceNumber}
                      </span>
                    ) : null}
                  </CardDescription>
                </div>
                <Badge variant={statusVariant(doc.status)}>
                  {formatStatus(doc.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                {doc.dueOrValidLabel ? (
                  <p>{doc.dueOrValidLabel}</p>
                ) : null}
                <p className="text-xs">
                  Updated{" "}
                  {new Date(doc.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              {doc.actionUrl ? (
                <Button
                  nativeButton={false}
                  render={<Link href={doc.actionUrl} />}
                  className="shrink-0"
                  style={
                    {
                      backgroundColor: "var(--portal-primary)",
                      borderColor: "var(--portal-primary)",
                    } as React.CSSProperties
                  }
                >
                  {doc.actionLabel}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
