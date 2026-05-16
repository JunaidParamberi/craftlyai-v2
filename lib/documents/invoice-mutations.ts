"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseLineItemInput } from "@/lib/validations/line-item";
import { invoiceMetaSchema } from "@/lib/validations/document";
import { markPaidInputSchema } from "@/lib/validations/payment";
import { createPaymentVoucher } from "@/lib/documents/payment-voucher-mutations";
import {
  calculateInvoiceBalance,
  getInvoicePaymentStatus,
} from "@/lib/documents/payment-balance";
import type { LineItemRow } from "@/types";

// Generate next invoice number for user: INV-0001, INV-0002, etc.
export async function generateInvoiceNumber(userId: string): Promise<string> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "invoice");
  const n = (count ?? 0) + 1;
  return `INV-${n.toString().padStart(4, "0")}`;
}

// Upsert a line item (insert if no id, update if id provided)
export async function upsertLineItem(
  documentId: string,
  rawInput: unknown
): Promise<{ ok: boolean; lineItem?: LineItemRow; error?: string }> {
  const supabase = await createClient();
  const input = parseLineItemInput(rawInput);

  if (input.id) {
    const { data, error } = await supabase
      .from("line_items")
      .update({
        description: input.description,
        quantity: input.quantity,
        unit_price: input.unit_price,
        tax_rate: input.tax_rate,
        sort_order: input.sort_order,
      })
      .eq("id", input.id)
      .select()
      .single();
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/documents/${documentId}`);
    revalidateTag("dashboard");
    revalidateTag("finance");
    return { ok: true, lineItem: data as LineItemRow };
  }

  const { data, error } = await supabase
    .from("line_items")
    .insert({
      document_id: documentId,
      description: input.description,
      quantity: input.quantity,
      unit_price: input.unit_price,
      tax_rate: input.tax_rate,
      sort_order: input.sort_order,
    })
    .select()
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/documents/${documentId}`);
  revalidateTag("dashboard");
  revalidateTag("finance");
  return { ok: true, lineItem: data as LineItemRow };
}

// Delete a line item by id
export async function deleteLineItem(
  id: string,
  documentId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("line_items").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/documents/${documentId}`);
  revalidateTag("dashboard");
  revalidateTag("finance");
  return { ok: true };
}

// Bulk update sort_order for reordering
export async function reorderLineItems(
  documentId: string,
  orderedIds: string[]
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("line_items")
      .update({ sort_order: index })
      .eq("id", id)
  );
  await Promise.all(updates);
  revalidatePath(`/documents/${documentId}`);
  revalidateTag("dashboard");
  revalidateTag("finance");
  return { ok: true };
}

// Update invoice-specific metadata fields
export async function updateInvoiceMeta(
  documentId: string,
  rawInput: unknown
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const parsed = invoiceMetaSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Invalid invoice metadata" };
  }

  const { error } = await supabase
    .from("documents")
    .update({
      invoice_number: parsed.data.invoice_number ?? null,
      due_date: parsed.data.due_date ?? null,
      payment_terms: parsed.data.payment_terms ?? null,
      notes_footer: parsed.data.notes_footer ?? null,
      discount_value: parsed.data.discount_value ?? 0,
      discount_type: parsed.data.discount_type ?? 'percent',
    })
    .eq("id", documentId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/documents/${documentId}`);
  revalidatePath(`/documents/${documentId}/edit`);
  revalidateTag("dashboard");
  revalidateTag("finance");
  return { ok: true };
}

// Record an invoice payment, supporting full, partial, and write-off closure.
export async function recordInvoicePayment(
  documentId: string,
  rawInput: unknown
): Promise<{ ok: boolean; error?: string; status?: string }> {
  const parsed = markPaidInputSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "Invalid payment details" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthenticated" };

  // Fetch document + client currency for payment record
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("id, user_id, client_id, clients(currency)")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single();
  if (docError || !doc) return { ok: false, error: "Document not found" };

  // Compute invoice total server-side
  const { data: lineItems } = await supabase
    .from("line_items")
    .select("quantity, unit_price, tax_rate")
    .eq("document_id", documentId);

  const { data: discountRow } = await supabase
    .from("documents")
    .select("discount_value, discount_type")
    .eq("id", documentId)
    .single();

  const subtotal = (lineItems ?? []).reduce(
    (sum, li) => sum + Number(li.quantity) * Number(li.unit_price),
    0
  );
  const taxTotal = (lineItems ?? []).reduce(
    (sum, li) =>
      sum + Number(li.quantity) * Number(li.unit_price) * (Number(li.tax_rate) / 100),
    0
  );
  const discountValue = Number(discountRow?.discount_value ?? 0);
  const discountType = discountRow?.discount_type ?? "percent";
  const discount =
    discountType === "flat"
      ? Math.min(discountValue, subtotal)
      : subtotal * (discountValue / 100);
  const total = subtotal - discount + taxTotal;

  const [{ data: existingPayments }, { data: existingAdjustments }] =
    await Promise.all([
      supabase
        .from("payments")
        .select("amount")
        .eq("document_id", documentId)
        .eq("user_id", user.id),
      supabase
        .from("invoice_adjustments")
        .select("amount")
        .eq("document_id", documentId)
        .eq("user_id", user.id)
        .eq("type", "write_off"),
    ]);

  const currentBalance = calculateInvoiceBalance({
    invoiceTotal: total,
    payments: (existingPayments ?? []).map((p) => Number(p.amount)),
    writeOffs: (existingAdjustments ?? []).map((a) => Number(a.amount)),
  });
  if (currentBalance.balanceDue <= 0) {
    return { ok: false, error: "This invoice has no remaining balance." };
  }

  const paymentAmount = Math.round(parsed.data.amount * 100) / 100;
  if (paymentAmount > currentBalance.balanceDue) {
    return { ok: false, error: "Payment amount cannot exceed the remaining balance." };
  }

  const remainingAfterPayment =
    Math.round((currentBalance.balanceDue - paymentAmount) * 100) / 100;
  const writeOffAmount =
    parsed.data.remainingAction === "write_off" && remainingAfterPayment > 0
      ? remainingAfterPayment
      : 0;

  const clientRecord = (doc.clients as unknown) as { currency: string | null } | null;
  const currency = clientRecord?.currency ?? "USD";
  const paidAt = new Date().toISOString();

  // Insert payment record
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      document_id: documentId,
      user_id: user.id,
      amount: paymentAmount,
      currency,
      method: parsed.data.method,
      reference: parsed.data.reference ?? null,
      notes: parsed.data.notes ?? null,
      paid_at: paidAt,
    })
    .select("id")
    .single();
  if (paymentError || !payment) {
    return { ok: false, error: paymentError?.message ?? "Failed to record payment." };
  }

  if (writeOffAmount > 0) {
    const { error: adjustmentError } = await supabase
      .from("invoice_adjustments")
      .insert({
        document_id: documentId,
        user_id: user.id,
        type: "write_off",
        amount: writeOffAmount,
        reason: parsed.data.writeOffReason ?? "",
      });
    if (adjustmentError) return { ok: false, error: adjustmentError.message };
  }

  const nextBalance = calculateInvoiceBalance({
    invoiceTotal: total,
    payments: [
      ...(existingPayments ?? []).map((p) => Number(p.amount)),
      paymentAmount,
    ],
    writeOffs: [
      ...(existingAdjustments ?? []).map((a) => Number(a.amount)),
      writeOffAmount,
    ],
  });
  const nextStatus = getInvoicePaymentStatus({
    invoiceTotal: total,
    totalPaid: nextBalance.totalPaid,
    totalWrittenOff: nextBalance.totalWrittenOff,
  });

  const { error: updateError } = await supabase
    .from("documents")
    .update({
      status: nextStatus,
      paid_at: nextStatus === "paid" ? paidAt : null,
    })
    .eq("id", documentId)
    .eq("user_id", user.id);
  if (updateError) return { ok: false, error: updateError.message };

  // Auto-generate payment voucher document
  await createPaymentVoucher(supabase, user.id, documentId, {
    paymentId: payment.id,
    amount: paymentAmount,
    currency,
    method: parsed.data.method,
    reference: parsed.data.reference ?? null,
    notes: parsed.data.notes ?? null,
    paidAt,
  });

  if (nextStatus === "paid") {
    const { notifyDocumentEvent } = await import(
      "@/lib/notifications/document-notification"
    );
    await notifyDocumentEvent(supabase, user.id, documentId, "invoice_paid");
  }

  revalidatePath(`/documents/${documentId}`);
  revalidatePath("/documents");
  revalidatePath("/dashboard", "layout");
  revalidateTag("dashboard");
  revalidateTag("finance");
  return { ok: true, status: nextStatus };
}

export const markInvoicePaid = recordInvoicePayment;
