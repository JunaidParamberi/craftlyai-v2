"use server";

import { createClient } from "@/lib/supabase/server";
import { resend } from "@/lib/email";
import InvoiceEmail from "@/emails/invoice";
import { getInvoiceWithLineItems } from "@/lib/documents/invoice-queries";
import React from "react";

interface SendInvoiceInput {
  documentId: string;
  recipientEmail: string;
  subject?: string;
}

type ProfileRow = {
  full_name: string | null;
  company_name: string | null;
};

type ClientRow = {
  name: string;
  currency: string;
};

export async function sendInvoice(
  input: SendInvoiceInput
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, company_name")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as ProfileRow | null;
  const businessName =
    typedProfile?.company_name ?? typedProfile?.full_name ?? "Your Business";

  const invoice = await getInvoiceWithLineItems(input.documentId);
  if (!invoice) return { ok: false, error: "Invoice not found" };

  const { data: client } = invoice.client_id
    ? await supabase
        .from("clients")
        .select("name, currency")
        .eq("id", invoice.client_id)
        .single()
    : { data: null };

  const typedClient = client as ClientRow | null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const payUrl = invoice.pay_token
    ? `${appUrl}/pay/${invoice.pay_token}`
    : appUrl;

  const subject =
    input.subject ??
    `Invoice ${invoice.invoice_number ?? ""} from ${businessName}`.trim();

  const { error } = await resend.emails.send({
    from: `${businessName} via CraftlyAI <invoices@craftlyai.app>`,
    to: [input.recipientEmail],
    subject,
    react: React.createElement(InvoiceEmail, {
      invoiceNumber: invoice.invoice_number ?? "—",
      businessName,
      clientName: typedClient?.name ?? "Client",
      dueDate: invoice.due_date,
      paymentTerms: invoice.payment_terms,
      notesFooter: invoice.notes_footer,
      lineItems: invoice.line_items.map((li) => ({
        description: li.description,
        quantity: Number(li.quantity),
        unit_price: Number(li.unit_price),
        tax_rate: Number(li.tax_rate),
      })),
      currency: typedClient?.currency ?? "USD",
      payUrl,
      discountPercent: Number(invoice.discount_percent ?? 0),
    }),
  });

  if (error) return { ok: false, error: error.message };

  await supabase
    .from("documents")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", input.documentId);

  return { ok: true };
}
