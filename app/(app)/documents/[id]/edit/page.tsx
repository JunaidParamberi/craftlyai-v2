import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { listClients } from "@/lib/clients/client-queries";
import { getDocumentById } from "@/lib/documents/document-queries";
import { getInvoiceWithLineItems } from "@/lib/documents/invoice-queries";
import { documentToFormValues } from "@/lib/documents/form-values";
import { buildVariableContext } from "@/lib/documents/variables-server";
import { getProfile } from "@/lib/profile/actions";
import { listProjects } from "@/lib/projects/actions";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

import { DocumentForm } from "@/components/features/documents/document-form";
import { InvoiceEditForm } from "@/components/features/documents/invoice-edit-form";
import { QuoteEditForm } from "@/components/features/documents/quote-edit-form";
import { getQuoteWithLineItems } from "@/lib/documents/quote-queries";
import { ProposalEditForm } from "@/components/features/documents/proposal-edit-form";
import { getProposalWithLineItems } from "@/lib/documents/proposal-queries";

export const metadata: Metadata = {
  title: "Edit document",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditDocumentPage({ params }: PageProps) {
  const { id } = await params;
  const document = await getDocumentById(id);
  if (!document) {
    notFound();
  }

  const [clientsResult, projectsResult] = await Promise.all([
    listClients(),
    listProjects(),
  ]);

  const clients = clientsResult.ok ? clientsResult.clients : [];
  const projects = projectsResult.ok ? projectsResult.projects : [];

  // Invoice path: dedicated structured editor
  if (document.type === "invoice") {
    const invoiceData = await getInvoiceWithLineItems(id);

    // Resolve currency: client currency → profile default → "USD"
    const profileResult = await getProfile();
    const profileCurrency =
      profileResult.ok && profileResult.profile
        ? (profileResult.profile.default_currency ?? "USD")
        : "USD";

    let currency = profileCurrency;
    if (document.client_id) {
      const supabase = await createSupabaseClient();
      const { data: client } = await supabase
        .from("clients")
        .select("currency")
        .eq("id", document.client_id)
        .single();
      currency = (client as { currency: string } | null)?.currency ?? profileCurrency;
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Link
            href={`/documents/${document.id}`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" />
            Back to invoice
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Edit invoice
          </h1>
        </div>

        <InvoiceEditForm
          documentId={document.id}
          initialTitle={document.title}
          initialStatus={document.status}
          initialClientId={document.client_id}
          initialProjectId={document.project_id}
          clients={clients}
          projects={projects}
          invoiceData={{
            invoice_number: invoiceData?.invoice_number ?? null,
            due_date: invoiceData?.due_date ?? null,
            payment_terms: invoiceData?.payment_terms ?? null,
            notes_footer: invoiceData?.notes_footer ?? null,
            line_items: invoiceData?.line_items ?? [],
            currency,
            discount_value: invoiceData?.discount_value ?? 0,
            discount_type: (invoiceData?.discount_type ?? 'percent') as 'percent' | 'flat',
          }}
        />
      </div>
    );
  }

  // Quote path: dedicated structured editor
  if (document.type === "quote") {
    const quoteData = await getQuoteWithLineItems(id);

    const profileResult = await getProfile();
    const profileCurrency =
      profileResult.ok && profileResult.profile
        ? (profileResult.profile.default_currency ?? "USD")
        : "USD";

    let currency = profileCurrency;
    if (document.client_id) {
      const supabase = await createSupabaseClient();
      const { data: client } = await supabase
        .from("clients")
        .select("currency")
        .eq("id", document.client_id)
        .single();
      currency = (client as { currency: string } | null)?.currency ?? profileCurrency;
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Link
            href={`/documents/${document.id}`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" />
            Back to quote
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Edit quote
          </h1>
        </div>

        <QuoteEditForm
          documentId={document.id}
          initialTitle={document.title}
          initialStatus={document.status}
          initialClientId={document.client_id}
          initialProjectId={document.project_id}
          clients={clients}
          projects={projects}
          quoteData={{
            quote_number: quoteData?.quote_number ?? null,
            valid_until: quoteData?.valid_until ?? null,
            notes_footer: quoteData?.notes_footer ?? null,
            line_items: quoteData?.line_items ?? [],
            currency,
            discount_value: quoteData?.discount_value ?? 0,
            discount_type: (quoteData?.discount_type ?? 'percent') as 'percent' | 'flat',
          }}
        />
      </div>
    );
  }

  // Proposal path: rich-text editor + line items + approval tracking
  if (document.type === "proposal") {
    const proposal = await getProposalWithLineItems(id);
    if (!proposal) notFound();

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Link
            href={`/documents/${document.id}`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" />
            Back to proposal
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Edit proposal
          </h1>
        </div>

        <ProposalEditForm
          document={proposal}
          clients={clients}
          projects={projects}
        />
      </div>
    );
  }

  // Non-invoice/quote/proposal: rich-text document editor
  const variableContext = await buildVariableContext({
    clientId: document.client_id,
    projectId: document.project_id,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href={`/documents/${document.id}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          Back to document
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Edit document
          </h1>
        </div>
      </div>

      <DocumentForm
        mode="edit"
        documentId={document.id}
        defaultValues={documentToFormValues(document)}
        clients={clients}
        projects={projects}
        initialVariableContext={variableContext}
      />
    </div>
  );
}
