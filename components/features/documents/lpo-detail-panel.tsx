import type { DocumentRow } from "@/types";
import { FileDown, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type LinkedInvoice = {
  id: string;
  title: string;
  invoice_number: string | null;
  status: string;
};

interface Props {
  document: DocumentRow;
  linkedInvoices: LinkedInvoice[];
}

export function LPODetailPanel({ document, linkedInvoices }: Props) {

  const isExpired =
    document.lpo_validity_date != null
      ? new Date(document.lpo_validity_date) < new Date()
      : false;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="text-sm font-semibold">LPO Details</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">LPO Number</dt>
          <dd className="font-medium">{document.lpo_number ?? "—"}</dd>

          <dt className="text-muted-foreground">Authorized Amount</dt>
          <dd className="font-medium">
            {document.lpo_amount != null
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "AED",
                }).format(document.lpo_amount)
              : "—"}
          </dd>

          <dt className="text-muted-foreground">Valid Until</dt>
          <dd className="font-medium flex items-center gap-2">
            {document.lpo_validity_date
              ? new Date(document.lpo_validity_date).toLocaleDateString("en-US", {
                  dateStyle: "medium",
                })
              : "—"}
            {isExpired && <Badge variant="destructive">Expired</Badge>}
          </dd>
        </dl>

        {document.lpo_pdf_url && (
          <a
            href={document.lpo_pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary underline"
          >
            <FileDown className="h-4 w-4" />
            Download Client LPO
          </a>
        )}
      </div>

      {linkedInvoices.length > 0 && (
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-semibold">Invoices Raised Against This LPO</h3>
          <ul className="space-y-2">
            {linkedInvoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between text-sm">
                <a
                  href={`/documents/${inv.id}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  {inv.invoice_number ?? inv.title}
                </a>
                <Badge variant="outline">{inv.status}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
