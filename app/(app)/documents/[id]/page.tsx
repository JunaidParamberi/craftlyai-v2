import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Download, Pencil } from "lucide-react";

import { getClientById } from "@/lib/clients/client-queries";
import { getDocumentById } from "@/lib/documents/document-queries";
import { getInvoiceWithLineItems } from "@/lib/documents/invoice-queries";
import { getQuoteWithLineItems } from "@/lib/documents/quote-queries";
import { getProposalWithLineItems } from "@/lib/documents/proposal-queries";
import { buildVariableContext } from "@/lib/documents/variables-server";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

import { DocumentDetailView } from "@/components/features/documents/document-detail-view";
import { MarkPaidButton } from "@/components/features/documents/mark-paid-button";
import { SendInvoiceButton } from "@/components/features/documents/send-invoice-button";
import { SendQuoteButton } from "@/components/features/documents/send-quote-button";
import { QuoteApprovalStatus } from "@/components/features/documents/quote-approval-status";
import { Button } from "@/components/ui/button";
import type { LineItemRow } from "@/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const document = await getDocumentById(id);
  return { title: document?.title ?? "Document" };
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const document = await getDocumentById(id);
  if (!document) {
    notFound();
  }

  const [client, projectTitle, variableContext, invoiceData, quoteData, proposalData] = await Promise.all([
    document.client_id ? getClientById(document.client_id) : Promise.resolve(null),
    document.project_id ? fetchProjectTitle(document.project_id) : Promise.resolve(null),
    buildVariableContext({
      clientId: document.client_id,
      projectId: document.project_id,
    }),
    document.type === "invoice" ? getInvoiceWithLineItems(id) : Promise.resolve(null),
    document.type === "quote" ? getQuoteWithLineItems(id) : Promise.resolve(null),
    document.type === "proposal" ? getProposalWithLineItems(id) : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          Back to documents
        </Link>
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a
                href={`/api/documents/${document.id}/pdf`}
                download={`${document.title.replace(/[^a-zA-Z0-9_\-. ]/g, "").trim() || "document"}.pdf`}
              />
            }
          >
            <Download className="size-4" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/documents/${document.id}/edit`} />}
          >
            <Pencil className="size-4" />
            Edit document
          </Button>
          {document.type === "invoice" ? (
            <>
              <SendInvoiceButton
                documentId={document.id}
                defaultEmail={client?.email ?? undefined}
              />
              <MarkPaidButton
                documentId={document.id}
                isPaid={document.status === "paid"}
              />
            </>
          ) : null}
          {document.type === "quote" ? (
            <SendQuoteButton
              documentId={document.id}
              defaultEmail={client?.email ?? undefined}
            />
          ) : null}
        </div>
      </div>

      {document.type === "invoice" && invoiceData ? (
        <div className="rounded-xl border border-border/60 bg-card p-5 flex flex-col gap-4">
          {/* Metadata row */}
          <div className="flex flex-wrap gap-6 text-sm">
            {invoiceData.invoice_number ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">Invoice #</span>
                <span className="font-mono font-medium">{invoiceData.invoice_number}</span>
              </div>
            ) : null}
            {invoiceData.due_date ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">Due date</span>
                <span>{new Date(invoiceData.due_date + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
            ) : null}
            {invoiceData.payment_terms ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">Terms</span>
                <span>{invoiceData.payment_terms}</span>
              </div>
            ) : null}
            {invoiceData.paid_at ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">Paid on</span>
                <span className="text-emerald-600 font-medium">{new Date(invoiceData.paid_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
            ) : null}
          </div>

          {/* Pay link */}
          {invoiceData.pay_token && document.status !== "paid" ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground text-xs">Pay link:</span>
              <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded truncate max-w-[300px]">
                {`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/pay/${invoiceData.pay_token}`}
              </code>
            </div>
          ) : null}

          {/* Line items table */}
          {invoiceData.line_items.length > 0 ? (
            <InvoiceLineItemsReadOnly lineItems={invoiceData.line_items} currency={client?.currency ?? "USD"} discountValue={Number(invoiceData.discount_value ?? 0)} discountType={(invoiceData.discount_type ?? 'percent') as 'percent' | 'flat'} />
          ) : null}

          {/* Notes footer */}
          {invoiceData.notes_footer ? (
            <p className="text-sm text-muted-foreground border-t border-border/50 pt-3 whitespace-pre-line">{invoiceData.notes_footer}</p>
          ) : null}
        </div>
      ) : null}

      {document.type === "quote" && quoteData ? (
        <div className="rounded-xl border border-border/60 bg-card p-5 flex flex-col gap-4">
          {/* Metadata row */}
          <div className="flex flex-wrap gap-6 text-sm">
            {quoteData.quote_number ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">Quote #</span>
                <span className="font-mono font-medium">{quoteData.quote_number}</span>
              </div>
            ) : null}
            {quoteData.valid_until ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">Valid until</span>
                <span>{new Date(quoteData.valid_until + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
            ) : null}
          </div>

          {/* Line items table */}
          {quoteData.line_items.length > 0 ? (
            <InvoiceLineItemsReadOnly
              lineItems={quoteData.line_items}
              currency={client?.currency ?? "USD"}
              discountValue={Number(quoteData.discount_value ?? 0)}
              discountType={(quoteData.discount_type ?? 'percent') as 'percent' | 'flat'}
            />
          ) : null}

          {/* Notes footer */}
          {quoteData.notes_footer ? (
            <p className="text-sm text-muted-foreground border-t border-border/50 pt-3 whitespace-pre-line">{quoteData.notes_footer}</p>
          ) : null}

          {/* Approval status */}
          <div className="border-t border-border/50 pt-3">
            <QuoteApprovalStatus
              documentId={document.id}
              status={document.status}
              approvedAt={quoteData.approved_at}
              declinedAt={quoteData.declined_at}
              approvalMessage={quoteData.approval_message}
              approvalToken={quoteData.approval_token}
            />
          </div>
        </div>
      ) : null}

      {document.type === "proposal" && proposalData ? (
        <div className="rounded-xl border border-border/60 bg-card p-5 flex flex-col gap-4">
          {/* Metadata row */}
          <div className="flex flex-wrap gap-6 text-sm">
            {proposalData.proposal_number ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">Proposal #</span>
                <span className="font-mono font-medium">{proposalData.proposal_number}</span>
              </div>
            ) : null}
            {proposalData.valid_until ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">Valid until</span>
                <span>{new Date(proposalData.valid_until + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
            ) : null}
          </div>

          {/* Line items table */}
          {proposalData.line_items.length > 0 ? (
            <InvoiceLineItemsReadOnly
              lineItems={proposalData.line_items}
              currency={client?.currency ?? "USD"}
              discountValue={Number(proposalData.discount_value ?? 0)}
              discountType={(proposalData.discount_type ?? "percent") as "percent" | "flat"}
            />
          ) : null}

          {/* Notes footer */}
          {proposalData.notes_footer ? (
            <p className="text-sm text-muted-foreground border-t border-border/50 pt-3 whitespace-pre-line">
              {proposalData.notes_footer}
            </p>
          ) : null}

          {/* Approval status */}
          {(document.status === "approved" || document.status === "declined") ? (
            <div className="border-t border-border/50 pt-3">
              <QuoteApprovalStatus
                documentId={document.id}
                status={document.status}
                approvedAt={proposalData.approved_at}
                declinedAt={proposalData.declined_at}
                approvalMessage={proposalData.approval_message}
                approvalToken={proposalData.approval_token}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <DocumentDetailView
        document={document}
        variableContext={variableContext}
        clientName={client?.name ?? null}
        projectTitle={projectTitle}
      />
    </div>
  );
}

async function fetchProjectTitle(projectId: string): Promise<string | null> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("projects")
    .select("title")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();
  return data?.title ?? null;
}

function InvoiceLineItemsReadOnly({
  lineItems,
  currency,
  discountValue = 0,
  discountType = 'percent',
}: {
  lineItems: LineItemRow[];
  currency: string;
  discountValue?: number;
  discountType?: 'percent' | 'flat';
}) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(n);

  const subtotal = lineItems.reduce(
    (sum, li) => sum + Number(li.quantity) * Number(li.unit_price),
    0,
  );
  const taxTotal = lineItems.reduce(
    (sum, li) =>
      sum + Number(li.quantity) * Number(li.unit_price) * (Number(li.tax_rate) / 100),
    0,
  );
  const discount = discountType === 'flat'
    ? Math.min(discountValue, subtotal)
    : subtotal * (discountValue / 100);
  const discountedSubtotal = subtotal - discount;
  const total = discountedSubtotal + taxTotal;

  return (
    <div className="flex flex-col gap-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 text-left text-[0.7rem] uppercase tracking-widest text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Description</th>
            <th className="pb-2 pr-4 font-medium text-right">Qty</th>
            <th className="pb-2 pr-4 font-medium text-right">Unit price</th>
            <th className="pb-2 pr-4 font-medium text-right">Tax %</th>
            <th className="pb-2 font-medium text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((li) => (
            <tr key={li.id} className="border-b border-border/30">
              <td className="py-2 pr-4">{li.description}</td>
              <td className="py-2 pr-4 text-right">{Number(li.quantity)}</td>
              <td className="py-2 pr-4 text-right">{fmt(Number(li.unit_price))}</td>
              <td className="py-2 pr-4 text-right">{Number(li.tax_rate)}%</td>
              <td className="py-2 text-right">
                {fmt(Number(li.quantity) * Number(li.unit_price))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-col items-end gap-1 pt-2 text-sm">
        <div className="flex gap-8">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{fmt(subtotal)}</span>
        </div>
        {discount > 0 ? (
          <div className="flex gap-8 text-red-500">
            <span>{discountType === 'percent' ? `Discount (${discountValue}%)` : 'Discount'}</span>
            <span>-{fmt(discount)}</span>
          </div>
        ) : null}
        {taxTotal > 0 ? (
          <div className="flex gap-8">
            <span className="text-muted-foreground">Tax</span>
            <span>{fmt(taxTotal)}</span>
          </div>
        ) : null}
        <div className="flex gap-8 border-t border-border/50 pt-2 font-semibold">
          <span>Total due</span>
          <span>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}
