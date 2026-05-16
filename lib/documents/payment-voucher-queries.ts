import { getServerContext } from "@/lib/supabase/get-server-context";

export type PaymentVoucherData = {
  voucherNumber: string | null;
  paidAt: string;
  amount: number;
  currency: string;
  method: string;
  reference: string | null;
  notes: string | null;
  invoiceNumber: string | null;
  invoiceTitle: string;
};

type VoucherDocRow = {
  id: string;
  voucher_number: string | null;
  payment_id: string | null;
};

export async function getVouchersForInvoice(
  invoiceId: string,
): Promise<VoucherDocRow[]> {
  const { supabase, user } = await getServerContext();
  if (!user) return [];

  const { data, error } = await supabase
    .from("documents")
    .select("id, voucher_number, payment_id")
    .eq("source_document_id", invoiceId)
    .eq("user_id", user.id)
    .eq("type", "payment_voucher")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as VoucherDocRow[];
}

export async function getVoucherForInvoice(
  invoiceId: string,
): Promise<VoucherDocRow | null> {
  const vouchers = await getVouchersForInvoice(invoiceId);
  return vouchers[0] ?? null;
}

export async function getPaymentVoucherData(
  voucherDocumentId: string,
): Promise<PaymentVoucherData | null> {
  const { supabase, user } = await getServerContext();
  if (!user) return null;

  const { data: voucher, error: vErr } = await supabase
    .from("documents")
    .select("voucher_number, paid_at, source_document_id, payment_id")
    .eq("id", voucherDocumentId)
    .eq("user_id", user.id)
    .eq("type", "payment_voucher")
    .single();

  if (vErr || !voucher?.source_document_id) return null;

  const paymentQuery = supabase
    .from("payments")
    .select("amount, currency, method, reference, notes, paid_at")
    .eq("document_id", voucher.source_document_id)
    .eq("user_id", user.id);

  const [{ data: sourceInvoice }, { data: payment }] = await Promise.all([
    supabase
      .from("documents")
      .select("invoice_number, title")
      .eq("id", voucher.source_document_id)
      .eq("user_id", user.id)
      .maybeSingle(),
    (voucher.payment_id
      ? paymentQuery.eq("id", voucher.payment_id)
      : paymentQuery.order("paid_at", { ascending: false }).limit(1)
    ).maybeSingle(),
  ]);

  if (!payment) return null;

  return {
    voucherNumber: voucher.voucher_number,
    paidAt:
      (payment.paid_at as string) ??
      (voucher.paid_at as string | null) ??
      new Date().toISOString(),
    amount: Number(payment.amount),
    currency: payment.currency as string,
    method: payment.method as string,
    reference: payment.reference as string | null,
    notes: payment.notes as string | null,
    invoiceNumber: sourceInvoice?.invoice_number ?? null,
    invoiceTitle: sourceInvoice?.title ?? "Invoice",
  };
}
