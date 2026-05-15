import { createClient } from "@/lib/supabase/server";
import type { Subscription } from "@/types";

export async function getCurrentSubscription(): Promise<Subscription | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return data ?? null;
}
