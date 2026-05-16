"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { quoteMetaSchema } from "@/lib/validations/document";
import { getQuoteWithLineItems } from "@/lib/documents/quote-queries";
import { generateInvoiceNumber } from "@/lib/documents/invoice-mutations";
import { emptyTiptapDoc } from "@/lib/validations/document";

export async function generateQuoteNumber(userId: string): Promise<string> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "quote");
  const n = (count ?? 0) + 1;
  return `QUO-${n.toString().padStart(4, "0")}`;
}

export async function updateQuoteMeta(
  documentId: string,
  rawInput: unknown
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const parsed = quoteMetaSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Invalid quote metadata" };
  }

  const { error } = await supabase
    .from("documents")
    .update({
      quote_number:   parsed.data.quote_number ?? null,
      valid_until:    parsed.data.valid_until ?? null,
      notes_footer:   parsed.data.notes_footer ?? null,
      discount_value: parsed.data.discount_value ?? 0,
      discount_type:  parsed.data.discount_type ?? 'percent',
    })
    .eq("id", documentId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/documents/${documentId}`);
  revalidatePath(`/documents/${documentId}/edit`);
  revalidateTag("dashboard");
  revalidateTag("finance");
  return { ok: true };
}

export async function markQuoteApproved(
  documentId: string,
  message?: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthenticated" };

  const { error } = await supabase
    .from("documents")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approval_message: message ?? null,
    })
    .eq("id", documentId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  const { notifyDocumentEvent } = await import(
    "@/lib/notifications/document-notification"
  );
  await notifyDocumentEvent(supabase, user.id, documentId, "quote_approved");

  revalidatePath(`/documents/${documentId}`);
  revalidatePath("/documents");
  revalidatePath("/dashboard", "layout");
  revalidateTag("dashboard");
  revalidateTag("finance");
  return { ok: true };
}

export async function markQuoteDeclined(
  documentId: string,
  message?: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthenticated" };

  const { error } = await supabase
    .from("documents")
    .update({
      status: "declined",
      declined_at: new Date().toISOString(),
      approval_message: message ?? null,
    })
    .eq("id", documentId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  const { notifyDocumentEvent } = await import(
    "@/lib/notifications/document-notification"
  );
  await notifyDocumentEvent(supabase, user.id, documentId, "quote_declined");

  revalidatePath(`/documents/${documentId}`);
  revalidatePath("/documents");
  revalidatePath("/dashboard", "layout");
  revalidateTag("dashboard");
  revalidateTag("finance");
  return { ok: true };
}

export async function convertQuoteToInvoice(
  quoteId: string
): Promise<{ ok: boolean; invoiceId?: string; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthenticated" };

  const quote = await getQuoteWithLineItems(quoteId);
  if (!quote) return { ok: false, error: "Quote not found" };

  const invoiceNumber = await generateInvoiceNumber(user.id);

  const { data: newDoc, error: insertError } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      type: "invoice",
      status: "draft",
      title: quote.title,
      client_id: quote.client_id,
      project_id: quote.project_id,
      content_json: emptyTiptapDoc(),
      notes_footer: quote.notes_footer,
      discount_value: quote.discount_value,
      discount_type: quote.discount_type,
      invoice_number: invoiceNumber,
    })
    .select("id")
    .single();

  if (insertError || !newDoc) {
    return { ok: false, error: insertError?.message ?? "Failed to create invoice" };
  }

  if (quote.line_items.length > 0) {
    const { error: lineItemsError } = await supabase
      .from("line_items")
      .insert(
        quote.line_items.map((li) => ({
          document_id: newDoc.id,
          description: li.description,
          quantity: li.quantity,
          unit_price: li.unit_price,
          tax_rate: li.tax_rate,
          sort_order: li.sort_order,
        }))
      );
    if (lineItemsError) {
      return { ok: false, error: lineItemsError.message };
    }
  }

  revalidatePath("/documents");
  revalidateTag("dashboard");
  revalidateTag("finance");
  return { ok: true, invoiceId: newDoc.id };
}
