import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Download, Pencil } from "lucide-react";

import { getClientById } from "@/lib/clients/client-queries";
import { getDocumentById } from "@/lib/documents/document-queries";
import {
  getInvoiceAdjustmentsForDocument,
  getInvoiceWithLineItems,
  getPaymentsForDocument,
} from "@/lib/documents/invoice-queries";
import { getQuoteWithLineItems } from "@/lib/documents/quote-queries";
import { getProposalWithLineItems } from "@/lib/documents/proposal-queries";
import { getVouchersForInvoice, getPaymentVoucherData } from "@/lib/documents/payment-voucher-queries";
import { calculateInvoiceBalance } from "@/lib/documents/payment-balance";
import { buildVariableContext } from "@/lib/documents/variables-server";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

import { DocumentDetailView } from "@/components/features/documents/document-detail-view";
import { MarkPaidButton } from "@/components/features/documents/mark-paid-button";
import { SendInvoiceButton } from "@/components/features/documents/send-invoice-button";
import { SendQuoteButton } from "@/components/features/documents/send-quote-button";
import { SendProposalButton } from "@/components/features/documents/send-proposal-button";
import { QuoteApprovalStatus } from "@/components/features/documents/quote-approval-status";
import { PaymentHistory } from "@/components/features/documents/payment-history";
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

  const [client, projectTitle, variableContext, invoiceData, quoteData, proposalData, payments, adjustments, voucherDocs, voucherData] = await Promise.all([
    document.client_id ? getClientById(document.client_id) : Promise.resolve(null),
    document.project_id ? fetchProjectTitle(document.project_id) : Promise.resolve(null),
    buildVariableContext({
      clientId: document.client_id,
      projectId: document.project_id,
    }),
    document.type === "invoice" ? getInvoiceWithLineItems(id) : Promise.resolve(null),
    document.type === "quote" ? getQuoteWithLineItems(id) : Promise.resolve(null),
    document.type === "proposal" ? getProposalWithLineItems(id) : Promise.resolve(null),
    document.type === "invoice" ? getPaymentsForDocument(id) : Promise.resolve([]),
    document.type === "invoice" ? getInvoiceAdjustmentsForDocument(id) : Promise.resolve([]),
    document.type === "invoice" ? getVouchersForInvoice(id) : Promise.resolve([]),
    document.type === "payment_voucher" ? getPaymentVoucherData(id) : Promise.resolve(null),
  ]);
  const invoiceTotal = invoiceData
    ? calculateInvoiceTotal(
        invoiceData.line_items,
        Number(invoiceData.discount_value ?? 0),
        (invoiceData.discount_type ?? "percent") as "percent" | "flat",
      )
    : 0;
  const invoiceBalance = invoiceData
    ? calculateInvoiceBalance({
        invoiceTotal,
        payments: payments.map((payment) => Number(payment.amount)),
        writeOffs: adjustments.map((adjustment) => Number(adjustment.amount)),
      })
    : null;
  const voucherByPaymentId = Object.fromEntries(
    voucherDocs
      .filter((voucher) => voucher.payment_id)
      .map((voucher) => [
        voucher.payment_id as string,
        { id: voucher.id, voucher_number: voucher.voucher_number },
      ]),
  );

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
          {document.type !== "payment_voucher" ? (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={`/documents/${document.id}/edit`} />}
            >
              <Pencil className="size-4" />
              Edit document
            </Button>
          ) : null}
          {document.type === "invoice" ? (
            <>
              <SendInvoiceButton
                documentId={document.id}
                defaultEmail={client?.email ?? undefined}
              />
              <MarkPaidButton
                documentId={document.id}
                invoiceTotal={invoiceBalance?.invoiceTotal ?? 0}
                totalPaid={invoiceBalance?.totalPaid ?? 0}
                totalWrittenOff={invoiceBalance?.totalWrittenOff ?? 0}
                remainingBalance={invoiceBalance?.balanceDue ?? 0}
                currency={client?.currency ?? "USD"}
                isPaid={
                  document.status === "paid" ||
                  document.status === "written_off" ||
                  (invoiceBalance ? invoiceBalance.balanceDue <= 0 : false)
                }
              />
            </>
          ) : null}
          {document.type === "quote" ? (
            <SendQuoteButton
              documentId={document.id}
              defaultEmail={client?.email ?? undefined}
            />
          ) : null}
          {document.type === "proposal" ? (
            <SendProposalButton
              documentId={document.id}
              defaultEmail={client?.email ?? ""}
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
            {invoiceBalance ? (
              <>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">Paid</span>
                  <span className="text-emerald-600 font-medium">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: client?.currency ?? "USD" }).format(invoiceBalance.totalPaid)}
                  </span>
                </div>
                {invoiceBalance.totalWrittenOff > 0 ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">Written off</span>
                    <span>
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: client?.currency ?? "USD" }).format(invoiceBalance.totalWrittenOff)}
                    </span>
                  </div>
                ) : null}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">Balance due</span>
                  <span className={invoiceBalance.balanceDue > 0 ? "font-semibold text-amber-600" : "font-semibold text-emerald-600"}>
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: client?.currency ?? "USD" }).format(invoiceBalance.balanceDue)}
                  </span>
                </div>
              </>
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

      {document.type === "invoice" ? (
        <PaymentHistory
          payments={payments}
          currency={client?.currency ?? "USD"}
          voucherByPaymentId={voucherByPaymentId}
        />
      ) : null}

      {document.type === "invoice" && voucherDocs.length > 0 ? (
        <div className="flex items-center gap-2">
          <Link
            href={`/documents/${voucherDocs[0].id}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            View latest Payment Voucher{voucherDocs[0].voucher_number ? ` (${voucherDocs[0].voucher_number})` : ""} →
          </Link>
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

      {document.type === "payment_voucher" && voucherData ? (
        <div className="rounded-xl border border-border/60 bg-card p-5 flex flex-col gap-4">
          <div className="flex flex-wrap gap-6 text-sm">
            {voucherData.voucherNumber ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">Voucher #</span>
                <span className="font-mono font-medium">{voucherData.voucherNumber}</span>
              </div>
            ) : null}
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">Date Paid</span>
              <span className="text-emerald-600 font-medium">
                {new Date(voucherData.paidAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">Amount</span>
              <span className="font-semibold">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: voucherData.currency }).format(voucherData.amount)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">Method</span>
              <span className="capitalize">{voucherData.method.replace(/_/g, " ")}</span>
            </div>
            {voucherData.reference ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">Reference</span>
                <span className="font-mono text-xs">{voucherData.reference}</span>
              </div>
            ) : null}
          </div>
          <div className="border-t border-border/50 pt-3 flex flex-col gap-2">
            <div className="text-sm text-muted-foreground">
              Re:{" "}
              <span className="text-foreground">{voucherData.invoiceTitle}</span>
              {voucherData.invoiceNumber ? (
                <span className="ml-1 font-mono text-xs">({voucherData.invoiceNumber})</span>
              ) : null}
            </div>
            {voucherData.notes ? (
              <p className="text-sm text-muted-foreground">{voucherData.notes}</p>
            ) : null}
            {document.source_document_id ? (
              <Link
                href={`/documents/${document.source_document_id}`}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit"
              >
                ← Back to Invoice
              </Link>
            ) : null}
          </div>
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

function calculateInvoiceTotal(
  lineItems: LineItemRow[],
  discountValue: number,
  discountType: "percent" | "flat",
): number {
  const subtotal = lineItems.reduce(
    (sum, li) => sum + Number(li.quantity) * Number(li.unit_price),
    0,
  );
  const taxTotal = lineItems.reduce(
    (sum, li) =>
      sum + Number(li.quantity) * Number(li.unit_price) * (Number(li.tax_rate) / 100),
    0,
  );
  const discount =
    discountType === "flat"
      ? Math.min(discountValue, subtotal)
      : subtotal * (discountValue / 100);
  return subtotal - discount + taxTotal;
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
