import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ActivityFeed } from "@/components/features/dashboard/activity-feed";
import { AttentionBanner } from "@/components/features/dashboard/attention-banner";
import { DashboardKpiCards } from "@/components/features/dashboard/kpi-cards";
import { PipelinePanel } from "@/components/features/dashboard/pipeline-panel";
import { PlanLimitBanner } from "@/components/features/billing/plan-limit-banner";
import { PageHeader } from "@/components/shared/page-header";
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
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${firstName}`}
        description="Here's what's happening with your projects today."
      />

      <DashboardKpiCards summary={summary} counts={counts} />

      <AttentionBanner items={attentionItems} />

      <div className="grid gap-4 lg:grid-cols-5">
        <ActivityFeed events={activity} />
        <PipelinePanel pipeline={pipeline} />
      </div>
    </div>
  );
}
