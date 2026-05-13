import { createClient } from "@supabase/supabase-js";

const BUCKET = "documents";

// Service-role client bypasses RLS for storage operations.
// Never expose the service role key to the browser.
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase env vars for service role client.");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Upload a PDF buffer to Supabase Storage and persist the public URL on the
 * document row. Overwrites any previous PDF for the same document ID.
 *
 * Returns the public URL on success, null on failure (non-fatal — the PDF
 * download still works even if storage upload fails).
 */
export async function uploadDocumentPdf(
  userId: string,
  documentId: string,
  pdfBuffer: Buffer,
): Promise<string | null> {
  try {
    const supabase = getServiceClient();
    const path = `${userId}/${documentId}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("[pdf/storage] upload error:", uploadError.message);
      return null;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    // Persist url on the document row (best-effort).
    await supabase
      .from("documents")
      .update({ pdf_url: publicUrl })
      .eq("id", documentId)
      .eq("user_id", userId);

    return publicUrl;
  } catch (err) {
    console.error("[pdf/storage] unexpected error:", err);
    return null;
  }
}
