import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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
};

// ─── getVoucherForInvoice ────────────────────────────────────────────────────

const _cachedGetVoucherForInvoice = unstable_cache(
  async (invoiceId: string, userId: string): Promise<VoucherDocRow | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("documents")
      .select("id, voucher_number")
      .eq("source_document_id", invoiceId)
      .eq("user_id", userId)
      .eq("type", "payment_voucher")
      .maybeSingle();
    if (error) return null;
    return data as VoucherDocRow | null;
  },
  ["voucher-for-invoice"],
  { revalidate: 60, tags: ["finance"] },
);

export async function getVoucherForInvoice(
  invoiceId: string,
): Promise<VoucherDocRow | null> {
  const { user } = await getServerContext();
  return _cachedGetVoucherForInvoice(invoiceId, user.id);
}

// ─── getPaymentVoucherData ───────────────────────────────────────────────────

const _cachedGetPaymentVoucherData = unstable_cache(
  async (
    voucherDocumentId: string,
    userId: string,
  ): Promise<PaymentVoucherData | null> => {
    const supabase = await createClient();

    const { data: voucher, error: vErr } = await supabase
      .from("documents")
      .select("voucher_number, paid_at, source_document_id")
      .eq("id", voucherDocumentId)
      .eq("user_id", userId)
      .eq("type", "payment_voucher")
      .single();

    if (vErr || !voucher?.source_document_id) return null;

    const [{ data: sourceInvoice }, { data: payment }] = await Promise.all([
      supabase
        .from("documents")
        .select("invoice_number, title")
        .eq("id", voucher.source_document_id)
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("payments")
        .select("amount, currency, method, reference, notes, paid_at")
        .eq("document_id", voucher.source_document_id)
        .eq("user_id", userId)
        .order("paid_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
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
  },
  ["payment-voucher-data"],
  { revalidate: 60, tags: ["finance"] },
);

export async function getPaymentVoucherData(
  voucherDocumentId: string,
): Promise<PaymentVoucherData | null> {
  const { user } = await getServerContext();
  return _cachedGetPaymentVoucherData(voucherDocumentId, user.id);
}
