"use server";

import { createClient } from "@/lib/supabase/server";
import type { ProposalDocumentRow } from "@/types";

export async function getProposalWithLineItems(
  id: string
): Promise<ProposalDocumentRow | null> {
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
  } as ProposalDocumentRow;
}
