import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BillingPageClient } from "@/components/features/billing/billing-page-client";
import { getCurrentSubscription } from "@/lib/billing/queries";
import type { PlanTier } from "@/config/plans";

export const metadata = { title: "Billing & Plans — CraftlyAI" };

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan_tier")
    .eq("id", user.id)
    .single();

  const subscription = await getCurrentSubscription();

  return (
    <BillingPageClient
      currentPlan={(profile?.plan_tier ?? "free") as PlanTier}
      subscription={subscription}
    />
  );
}
