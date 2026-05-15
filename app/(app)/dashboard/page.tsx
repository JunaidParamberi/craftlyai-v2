import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ActivityFeed } from "@/components/features/dashboard/activity-feed";
import { AttentionBanner } from "@/components/features/dashboard/attention-banner";
import { DashboardKpiCards } from "@/components/features/dashboard/kpi-cards";
import { PipelinePanel } from "@/components/features/dashboard/pipeline-panel";
import { PlanLimitBanner } from "@/components/features/billing/plan-limit-banner";
import {
  getActivePipeline,
  getAttentionItems,
  getDashboardCounts,
  getRecentActivity,
} from "@/lib/dashboard/dashboard-queries";
import { currentMonthRange } from "@/lib/finance/date-utils";
import { getFinancialSummary } from "@/lib/finance/finance-queries";
import { getProfile } from "@/lib/profile/actions";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const result = await getProfile();
  if (!result.ok || result.profile === null) redirect("/auth/login");

  const firstName =
    result.profile.full_name?.trim().split(/\s+/)[0] ?? "there";

  const [summary, counts, attentionItems, activity, pipeline] =
    await Promise.all([
      getFinancialSummary(currentMonthRange()),
      getDashboardCounts(),
      getAttentionItems(),
      getRecentActivity(),
      getActivePipeline(),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <PlanLimitBanner />
      <div className="relative shrink-0 rounded-3xl border border-border/60 bg-gradient-to-br from-muted/40 via-background to-background px-4 py-6 md:overflow-hidden md:px-8 md:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -end-24 -top-24 hidden size-72 rounded-full bg-primary/[0.07] blur-3xl md:block"
        />
        <div className="relative flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Overview
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="max-w-xl text-muted-foreground text-sm md:text-base">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
      </div>

      <DashboardKpiCards summary={summary} counts={counts} />

      <AttentionBanner items={attentionItems} />

      <div className="grid gap-4 lg:grid-cols-5">
        <ActivityFeed events={activity} />
        <PipelinePanel pipeline={pipeline} />
      </div>
    </div>
  );
}
