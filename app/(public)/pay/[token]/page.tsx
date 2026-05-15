import type { Metadata } from "next";

import { PortalNotFound } from "@/components/features/portal/portal-not-found";
import { PortalPaymentSection } from "@/components/features/portal/portal-payment-section";
import { PortalShell } from "@/components/features/portal/portal-shell";
import { PortalStatusScreen } from "@/components/features/portal/portal-status-screen";
import { createPortalAdminClient } from "@/lib/portal/supabase-admin";
import {
  getPortalBrandContext,
  recordDocumentViewed,
} from "@/lib/portal/public-queries";
import type { LineItemRow } from "@/types";

type PageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Pay Invoice",
};

const supabaseAdmin = createPortalAdminClient();

function InvoiceLineItemsReadOnly({
  lineItems,
  currency,
}: {
  lineItems: LineItemRow[];
  currency: string;
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
      sum +
      Number(li.quantity) *
        Number(li.unit_price) *
        (Number(li.tax_rate) / 100),
    0,
  );
  const total = subtotal + taxTotal;

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
              <td className="py-2 pr-4 text-right">
                {fmt(Number(li.unit_price))}
              </td>
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
      {/* Return total for external use */}
      <input type="hidden" value={total} />
    </div>
  );
}

function computeTotal(lineItems: LineItemRow[]): number {
  const subtotal = lineItems.reduce(
    (sum, li) => sum + Number(li.quantity) * Number(li.unit_price),
    0,
  );
  const taxTotal = lineItems.reduce(
    (sum, li) =>
      sum +
      Number(li.quantity) *
        Number(li.unit_price) *
        (Number(li.tax_rate) / 100),
    0,
  );
  return subtotal + taxTotal;
}

export default async function PayInvoicePage({ params }: PageProps) {
  const { token } = await params;

  const { data: doc, error: docError } = await supabaseAdmin
    .from("documents")
    .select(
      "id, title, invoice_number, due_date, payment_terms, notes_footer, status, paid_at, client_id, user_id",
    )
    .eq("pay_token", token)
    .single();

  if (docError || !doc) {
    return (
      <PortalNotFound
        title="Invoice not found"
        message="This payment link is invalid or has expired."
      />
    );
  }

  if (doc.status === "paid") {
    const paidDate = doc.paid_at
      ? new Date(doc.paid_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;
    return (
      <PortalStatusScreen
        variant="success"
        title="Already paid"
        message={`This invoice has already been paid${paidDate ? ` on ${paidDate}` : ""}.`}
      />
    );
  }

  await recordDocumentViewed(doc.id);

  const [lineItemsResult, clientResult, brand] = await Promise.all([
    supabaseAdmin
      .from("line_items")
      .select("*")
      .eq("document_id", doc.id)
      .order("sort_order", { ascending: true }),
    doc.client_id
      ? supabaseAdmin
          .from("clients")
          .select("name, currency")
          .eq("id", doc.client_id)
          .single()
      : Promise.resolve({ data: null }),
    getPortalBrandContext(doc.user_id),
  ]);

  const lineItems = (lineItemsResult.data ?? []) as LineItemRow[];
  const client = clientResult.data;
  const currency = client?.currency ?? "USD";
  const total = computeTotal(lineItems);

  const dueDateFormatted = doc.due_date
    ? new Date(doc.due_date + "T12:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <PortalShell
      brand={brand}
      footer="Payments are processed securely. Your card details are never stored."
    >
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="mb-5 border-b border-border/50 pb-5">
          <h1 className="font-display text-xl font-semibold text-foreground">
            {doc.title}
          </h1>
          {doc.invoice_number ? (
            <p className="mt-0.5 font-mono text-sm text-muted-foreground">
              #{doc.invoice_number}
            </p>
          ) : null}
        </div>

        <div className="mb-5 flex flex-wrap gap-6 text-sm">
          {client?.name ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">
                Billed to
              </span>
              <span className="font-medium">{client.name}</span>
            </div>
          ) : null}
          {dueDateFormatted ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">
                Due date
              </span>
              <span>{dueDateFormatted}</span>
            </div>
          ) : null}
          {doc.payment_terms ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">
                Terms
              </span>
              <span>{doc.payment_terms}</span>
            </div>
          ) : null}
        </div>

        {lineItems.length > 0 ? (
          <div className="mb-5">
            <InvoiceLineItemsReadOnly
              lineItems={lineItems}
              currency={currency}
            />
          </div>
        ) : null}

        {doc.notes_footer ? (
          <p className="mb-5 border-t border-border/50 pt-4 text-sm text-muted-foreground whitespace-pre-line">
            {doc.notes_footer}
          </p>
        ) : null}

        <PortalPaymentSection
          payToken={token}
          invoiceId={doc.id}
          total={total}
          currency={currency}
        />
      </div>
    </PortalShell>
  );
}
