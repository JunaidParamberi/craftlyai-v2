import { createClient } from "@/lib/supabase/server";

export type LPOSummary = {
  id: string;
  lpo_number: string;
  title: string;
  lpo_amount: number | null;
  lpo_validity_date: string | null;
  status: string;
};

export async function getActiveLPOsForClient(
  clientId: string,
): Promise<LPOSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("documents")
    .select("id, lpo_number, title, lpo_amount, lpo_validity_date, status")
    .eq("user_id", user.id)
    .eq("client_id", clientId)
    .eq("type", "local_purchase_order")
    .in("status", ["sent", "draft"])
    .not("lpo_number", "is", null)
    .order("created_at", { ascending: false });

  return (data ?? []) as LPOSummary[];
}

export async function getLinkedInvoicesForLPO(
  lpoNumber: string,
): Promise<{ id: string; title: string; invoice_number: string | null; status: string }[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("documents")
    .select("id, title, invoice_number, status")
    .eq("user_id", user.id)
    .eq("type", "invoice")
    .eq("lpo_reference_number", lpoNumber)
    .order("created_at", { ascending: false });

  return data ?? [];
}
