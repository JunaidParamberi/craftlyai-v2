"use server";

import { createClient } from "@/lib/supabase/server";
import type { InvoiceAdjustmentRow, InvoiceDocumentRow, PaymentRow } from "@/types";

export async function getInvoiceWithLineItems(
  id: string
): Promise<InvoiceDocumentRow | null> {
  const supabase = await createClient();

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (docError || !doc) return null;

  const { data: lineItems } = await supabase
    .from("line_items")
    .select("*")
    .eq("document_id", id)
    .order("sort_order", { ascending: true });

  return {
    ...doc,
    line_items: lineItems ?? [],
  } as InvoiceDocumentRow;
}

export async function getPaymentsForDocument(
  documentId: string
): Promise<PaymentRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("document_id", documentId)
    .order("paid_at", { ascending: false });
  return (data ?? []) as PaymentRow[];
}

export async function getInvoiceAdjustmentsForDocument(
  documentId: string
): Promise<InvoiceAdjustmentRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoice_adjustments")
    .select("*")
    .eq("document_id", documentId)
    .order("created_at", { ascending: false });
  return (data ?? []) as InvoiceAdjustmentRow[];
}
