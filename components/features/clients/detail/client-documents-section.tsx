import Link from "next/link";

import type { DocumentListRow } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";

const TYPE_LABELS: Record<DocumentListRow["type"], string> = {
  invoice: "Invoice",
  quote: "Quote",
  proposal: "Proposal",
  payment_voucher: "Payment Voucher",
  local_purchase_order: "LPO",
  other: "Other",
};

type ClientDocumentsSectionProps = {
  documents: DocumentListRow[];
  portalUrl: string | null;
};

export function ClientDocumentsSection({
  documents,
  portalUrl,
}: ClientDocumentsSectionProps) {
  if (documents.length === 0) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <FileText className="size-7 text-muted-foreground" />
          </div>
          <div className="max-w-md space-y-2">
            <p className="font-medium text-sm">No documents yet</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Create a quote, proposal, or invoice for this client in Document
              Studio.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">Documents</CardTitle>
          <CardDescription>
            Quotes, proposals, and invoices linked to this client.
          </CardDescription>
        </div>
        {portalUrl ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={portalUrl} target="_blank" rel="noreferrer" />}
          >
            Open client portal
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {TYPE_LABELS[doc.type]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal capitalize">
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={<Link href={`/documents/${doc.id}`} />}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
