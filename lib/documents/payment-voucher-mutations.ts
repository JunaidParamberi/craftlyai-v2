import type { SupabaseClient } from "@supabase/supabase-js";

/** Pure helper — exported for tests. */
export function formatVoucherNumber(count: number): string {
  return `VCH-${String(count + 1).padStart(4, "0")}`;
}

async function generateVoucherNumber(
  supabase: SupabaseClient,
  userId: string,
): Promise<string> {
  const { count } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "payment_voucher");
  return formatVoucherNumber(count ?? 0);
}

type PaymentInput = {
  paymentId: string;
  amount: number;
  currency: string;
  method: string;
  reference: string | null;
  notes: string | null;
  paidAt: string;
};

/**
 * Called from recordInvoicePayment after the payment row is inserted.
 * Creates a payment_voucher document linked to the source invoice.
 * Returns the new voucher document id, or null on failure.
 */
export async function createPaymentVoucher(
  supabase: SupabaseClient,
  userId: string,
  invoiceId: string,
  payment: PaymentInput,
): Promise<string | null> {
  const { data: invoice, error: invError } = await supabase
    .from("documents")
    .select("id, client_id, project_id, title")
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .single();

  if (invError || !invoice) return null;

  const voucherNumber = await generateVoucherNumber(supabase, userId);

  const { data: voucher, error: insertError } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      client_id: invoice.client_id,
      project_id: invoice.project_id,
      type: "payment_voucher",
      status: "sent",
      title: `Payment Voucher – ${invoice.title}`,
      content_json: { type: "doc", content: [] },
      voucher_number: voucherNumber,
      source_document_id: invoiceId,
      payment_id: payment.paymentId,
      paid_at: payment.paidAt,
    })
    .select("id")
    .single();

  if (insertError || !voucher) return null;
  return voucher.id;
}
