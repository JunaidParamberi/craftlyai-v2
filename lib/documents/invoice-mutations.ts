"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseLineItemInput } from "@/lib/validations/line-item";
import { invoiceMetaSchema } from "@/lib/validations/document";
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
  return { ok: true };
}

// Mark invoice as paid
export async function markInvoicePaid(
  documentId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("documents")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", documentId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/documents/${documentId}`);
  revalidatePath("/documents");
  return { ok: true };
}
