"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { lpoMetaSchema } from "@/lib/validations/document";

export async function updateLPOMeta(
  documentId: string,
  rawInput: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = lpoMetaSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "Invalid LPO metadata." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const { error } = await supabase
    .from("documents")
    .update({
      lpo_number: parsed.data.lpo_number,
      lpo_validity_date: parsed.data.lpo_validity_date ?? null,
      lpo_amount: parsed.data.lpo_amount ?? null,
    })
    .eq("id", documentId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/documents/${documentId}`);
  revalidatePath(`/documents/${documentId}/edit`);
  revalidateTag("dashboard");

  return { ok: true };
}

export async function uploadLPOPdf(
  documentId: string,
  formData: FormData,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const file = formData.get("lpo_pdf") as File | null;
  if (!file || file.size === 0) return { ok: false, error: "No file provided." };
  if (file.size > 10 * 1024 * 1024) return { ok: false, error: "File must be under 10 MB." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const ext = file.name.split(".").pop() ?? "pdf";
  const path = `${user.id}/${documentId}/lpo.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("lpo-documents")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { ok: false, error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("lpo-documents").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("documents")
    .update({ lpo_pdf_url: publicUrl })
    .eq("id", documentId)
    .eq("user_id", user.id);

  if (updateError) return { ok: false, error: updateError.message };

  revalidatePath(`/documents/${documentId}`);
  revalidatePath(`/documents/${documentId}/edit`);

  return { ok: true, url: publicUrl };
}
