import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getUserInitials } from "@/lib/dashboard/user-display";
import { getRequiredOnboardingPath } from "@/lib/onboarding/status";
import { getProfile } from "@/lib/profile/actions";
import { createClient } from "@/lib/supabase/server";
import { startOfCurrentMonth } from "@/lib/plan-usage/helpers";
import type { PlanUsage } from "@/lib/plan-usage/helpers";
import type { PlanTier } from "@/config/plans";

export default async function AppShellLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";

  if (
    pathname.startsWith("/profile-test") ||
    pathname.startsWith("/brand-kit-test") ||
    pathname.startsWith("/clients-test")
  ) {
    return children;
  }

  const result = await getProfile();

  if (!result.ok) {
    redirect("/auth/login");
  }

  if (result.profile === null) {
    redirect("/auth/login");
  }

  const nextOnboarding = getRequiredOnboardingPath(result.profile);
  if (nextOnboarding !== null) {
    redirect(nextOnboarding);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email ?? null;
  const userInitials = getUserInitials(result.profile.full_name, userEmail);

  const [clientCountResult, docCountResult] = await Promise.all([
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user?.id ?? ""),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user?.id ?? "")
      .gte("created_at", startOfCurrentMonth()),
  ]);

  const planUsage: PlanUsage = {
    planTier: (result.profile.plan_tier ?? "free") as PlanTier,
    clientCount: clientCountResult.count ?? 0,
    docCountThisMonth: docCountResult.count ?? 0,
  };

  return (
    <DashboardShell
      userEmail={userEmail}
      userInitials={userInitials}
      planUsage={planUsage}
    >
      {children}
    </DashboardShell>
  );
}
