import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";

import { getBrandKit } from "@/lib/brand-kit/actions";
import { getDocumentById } from "@/lib/documents/document-queries";
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
      />,
    );
  } catch (err) {
    console.error("[api/documents/pdf] render error:", err);
    return new Response("Failed to generate PDF", { status: 500 });
  }

  // Upload to Storage asynchronously (non-blocking, best-effort).
  uploadDocumentPdf(user.id, document.id, pdfBuffer).catch(() => {});

  const safeTitle = document.title.replace(/[^a-zA-Z0-9_\-. ]/g, "").trim() || "document";

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeTitle}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
