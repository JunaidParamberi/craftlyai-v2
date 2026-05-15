import type { SupabaseClient } from "@supabase/supabase-js";

import {
  applyDiscount,
  calcLineItemsTotal,
  calcTaxTotal,
} from "@/lib/finance/revenue-calc";
import type { DocumentType, NotificationType } from "@/types";

import { buildDocumentNotificationPayload } from "./build-payload";
import { createNotification } from "./create-notification";

function coerceDiscountType(val: string | null | undefined): "percent" | "flat" {
  return val === "flat" ? "flat" : "percent";
}

async function computeDocAmount(
  supabase: SupabaseClient,
  documentId: string,
  discountType: string | null | undefined,
  discountValue: number | null | undefined
): Promise<number | null> {
  const { data: items } = await supabase
    .from("line_items")
    .select("quantity, unit_price, tax_rate")
    .eq("document_id", documentId);

  if (!items?.length) return null;

  const normalized = items.map((li) => ({
    quantity: Number(li.quantity),
    unit_price: Number(li.unit_price),
    tax_rate: li.tax_rate != null ? Number(li.tax_rate) : null,
  }));

  const subtotal = calcLineItemsTotal(normalized);
  const tax = calcTaxTotal(normalized);
  return (
    applyDiscount(
      subtotal,
      coerceDiscountType(discountType),
      discountValue ?? 0
    ) + tax
  );
}

function clientNameFromJoin(
  client: { name: string } | { name: string }[] | null | undefined
): string | null {
  if (!client) return null;
  if (Array.isArray(client)) return client[0]?.name ?? null;
  return client.name;
}

/**
 * Load document + client and insert a notification (deduped).
 */
export async function notifyDocumentEvent(
  supabase: SupabaseClient,
  userId: string,
  documentId: string,
  type: NotificationType
): Promise<void> {
  const { data: doc } = await supabase
    .from("documents")
    .select(
      "id, type, title, invoice_number, quote_number, proposal_number, discount_type, discount_value, clients:client_id(name)"
    )
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!doc) return;

  const amount =
    type === "invoice_paid"
      ? await computeDocAmount(
          supabase,
          documentId,
          doc.discount_type,
          doc.discount_value
        )
      : null;

  const payload = buildDocumentNotificationPayload(type, {
    id: doc.id,
    type: doc.type as DocumentType,
    title: doc.title,
    invoice_number: doc.invoice_number,
    quote_number: doc.quote_number,
    proposal_number: doc.proposal_number,
    clientName: clientNameFromJoin(doc.clients),
    amount,
  });

  await createNotification(supabase, { userId, type, payload });
}
