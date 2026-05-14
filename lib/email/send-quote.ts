"use server";

import { createClient } from "@/lib/supabase/server";
import { resend } from "@/lib/email";
import { formatEmailError } from "@/lib/email/email-error";
import QuoteEmail from "@/emails/quote";
import { getQuoteWithLineItems } from "@/lib/documents/quote-queries";
import React from "react";

interface SendQuoteInput {
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

export async function sendQuote(
  input: SendQuoteInput
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!input.recipientEmail) {
      return { ok: false, error: "Recipient email is required." };
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "You must be logged in to send quotes." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, company_name")
      .eq("id", user.id)
      .single();

    const typedProfile = profile as ProfileRow | null;
    const businessName =
      typedProfile?.company_name ?? typedProfile?.full_name ?? "Your Business";

    const quote = await getQuoteWithLineItems(input.documentId);
    if (!quote) return { ok: false, error: "Quote not found." };

    const { data: client } = quote.client_id
      ? await supabase
          .from("clients")
          .select("name, currency")
          .eq("id", quote.client_id)
          .single()
      : { data: null };

    const typedClient = client as ClientRow | null;

    let approvalToken = quote.approval_token;
    if (!approvalToken) {
      const bytes = new Uint8Array(24);
      crypto.getRandomValues(bytes);
      approvalToken = Buffer.from(bytes).toString("hex");

      const { error: tokenError } = await supabase
        .from("documents")
        .update({ approval_token: approvalToken })
        .eq("id", input.documentId);

      if (tokenError) {
        console.error("[sendQuote] approval token update failed:", tokenError.message);
        return { ok: false, error: "Failed to generate approval link. Please try again." };
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const approvalUrl = `${appUrl}/quote/${approvalToken}`;

    const subject =
      input.subject ??
      `Quote ${quote.quote_number ?? ""} from ${businessName}`.trim();

    const { error: sendError } = await resend.emails.send({
      from: `${businessName} via CraftlyAI <invoices@craftlyai.app>`,
      replyTo: user.email ?? undefined,
      to: [input.recipientEmail],
      subject,
      react: React.createElement(QuoteEmail, {
        quoteNumber: quote.quote_number ?? "—",
        businessName,
        clientName: typedClient?.name ?? "Client",
        validUntil: quote.valid_until,
        notesFooter: quote.notes_footer,
        lineItems: quote.line_items.map((li) => ({
          description: li.description,
          quantity: Number(li.quantity),
          unit_price: Number(li.unit_price),
          tax_rate: Number(li.tax_rate),
        })),
        currency: typedClient?.currency ?? "USD",
        approvalUrl,
        discountValue: Number(quote.discount_value ?? 0),
        discountType: (quote.discount_type ?? "percent") as "percent" | "flat",
      }),
    });

    if (sendError) {
      return { ok: false, error: formatEmailError(sendError.message) };
    }

    const { error: updateError } = await supabase
      .from("documents")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", input.documentId);

    if (updateError) {
      console.error("[sendQuote] status update failed:", updateError.message);
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[sendQuote] unexpected error:", message);
    return { ok: false, error: formatEmailError(message) };
  }
}
