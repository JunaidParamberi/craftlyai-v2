import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";

import { getBrandKit } from "@/lib/brand-kit/actions";
import { getDocumentById } from "@/lib/documents/document-queries";
import { getInvoiceWithLineItems } from "@/lib/documents/invoice-queries";
import { getPaymentVoucherData } from "@/lib/documents/payment-voucher-queries";
import { getProposalWithLineItems } from "@/lib/documents/proposal-queries";
import { getQuoteWithLineItems } from "@/lib/documents/quote-queries";
import { substituteInTiptapDoc } from "@/lib/documents/variables";
import { buildVariableContext } from "@/lib/documents/variables-server";
import { DocumentPdf } from "@/lib/pdf/document-pdf";
import { uploadDocumentPdf } from "@/lib/pdf/storage";
import { createClient } from "@/lib/supabase/server";

// Force Node.js runtime — @react-pdf/renderer requires Node (not Edge).
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Auth check.
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Fetch document (RLS guarantees ownership).
  const document = await getDocumentById(id);
  if (!document) {
    return new Response("Not found", { status: 404 });
  }

  // Fetch invoice data (line items + invoice fields) if applicable.
  const invoiceData =
    document.type === "invoice"
      ? await getInvoiceWithLineItems(id)
      : null;

  // Fetch quote data if applicable.
  const quoteData =
    document.type === "quote"
      ? await getQuoteWithLineItems(id)
      : null;

  // Fetch proposal data if applicable.
  const proposalData =
    document.type === "proposal"
      ? await getProposalWithLineItems(id)
      : null;

  // Fetch payment voucher data if applicable.
  const voucherData =
    document.type === "payment_voucher"
      ? await getPaymentVoucherData(id)
      : null;

  // Fetch client currency for invoice, quote, or proposal.
  const clientCurrency =
    (document.type === "invoice" || document.type === "quote" || document.type === "proposal") && document.client_id
      ? await fetchClientCurrency(document.client_id, supabase)
      : "USD";

  // Fetch brand kit.
  const brandResult = await getBrandKit();
  const brandKit =
    brandResult.ok && brandResult.brandKit ? brandResult.brandKit : null;

  // Build variable context and substitute placeholders.
  const variableContext = await buildVariableContext({
    clientId: document.client_id,
    projectId: document.project_id,
  });
  const resolvedContent = substituteInTiptapDoc(
    document.content_json,
    variableContext,
  );

  // Fetch business name from profile.
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, full_name")
    .eq("id", user.id)
    .maybeSingle();
  const businessName =
    profile?.company_name?.trim() ||
    profile?.full_name?.trim() ||
    null;

  // Render PDF.
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderToBuffer(
      <DocumentPdf
        document={document}
        content={resolvedContent}
        variableContext={variableContext}
        brandLogoUrl={brandKit?.logo_url ?? null}
        primaryColor={brandKit?.primary_color ?? null}
        brandFont={brandKit?.font ?? null}
        businessName={businessName}
        invoiceData={
          invoiceData
            ? {
                invoice_number: invoiceData.invoice_number,
                due_date: invoiceData.due_date,
                payment_terms: invoiceData.payment_terms,
                notes_footer: invoiceData.notes_footer,
                line_items: invoiceData.line_items,
                currency: clientCurrency,
                discount_value: invoiceData.discount_value ?? 0,
                discount_type: invoiceData.discount_type ?? 'percent',
              }
            : null
        }
        quoteData={
          quoteData
            ? {
                quote_number: quoteData.quote_number,
                valid_until: quoteData.valid_until,
                notes_footer: quoteData.notes_footer,
                line_items: quoteData.line_items,
                currency: clientCurrency,
                discount_value: quoteData.discount_value ?? 0,
                discount_type: quoteData.discount_type ?? 'percent',
              }
            : null
        }
        proposalData={
          proposalData
            ? {
                proposal_number: proposalData.proposal_number,
                notes_footer: proposalData.notes_footer,
                line_items: proposalData.line_items,
                currency: clientCurrency,
                discount_value: proposalData.discount_value ?? 0,
                discount_type: proposalData.discount_type ?? 'percent',
              }
            : null
        }
        voucherData={voucherData}
      />,
    );
  } catch (err) {
    console.error("[api/documents/pdf] render error:", err);
    return new Response("Failed to generate PDF", { status: 500 });
  }

  // Upload to Storage asynchronously (non-blocking, best-effort).
  uploadDocumentPdf(user.id, document.id, pdfBuffer).catch(() => {});

  const docNumber =
    document.type === "invoice"
      ? (invoiceData?.invoice_number ?? null)
      : document.type === "quote"
      ? (quoteData?.quote_number ?? null)
      : document.type === "proposal"
      ? (proposalData?.proposal_number ?? null)
      : null;
  const safeTitle = (docNumber ?? document.title)
    .replace(/[^a-zA-Z0-9_\-. ]/g, "")
    .trim() || "document";

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeTitle}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

async function fetchClientCurrency(
  clientId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string> {
  const { data } = await supabase
    .from("clients")
    .select("currency")
    .eq("id", clientId)
    .single();
  return (data as { currency: string } | null)?.currency ?? "USD";
}
