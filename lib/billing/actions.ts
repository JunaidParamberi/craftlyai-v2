"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { upgradePlanSchema } from "@/lib/validations/billing";
import type { PlanTier } from "@/config/plans";

export async function mockUpgradePlan(
  input: unknown
): Promise<{ ok: boolean; error?: string }> {
  const parsed = upgradePlanSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid plan" };

  const plan = parsed.data.plan as PlanTier;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error: subError } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: user.id,
        plan,
        status: "active",
        lemon_squeezy_id: `mock_${plan}_${Date.now()}`,
        current_period_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (subError) return { ok: false, error: subError.message };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ plan_tier: plan })
    .eq("id", user.id);

  if (profileError) return { ok: false, error: profileError.message };

  revalidatePath("/settings/billing");
  revalidateTag("profile");
  return { ok: true };
}

export async function mockDowngradePlan(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error: subError } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: user.id,
        plan: "free",
        status: "active",
        lemon_squeezy_id: null,
        current_period_end: null,
      },
      { onConflict: "user_id" }
    );

  if (subError) return { ok: false, error: subError.message };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ plan_tier: "free" })
    .eq("id", user.id);

  if (profileError) return { ok: false, error: profileError.message };

  revalidatePath("/settings/billing");
  revalidateTag("profile");
  return { ok: true };
}
