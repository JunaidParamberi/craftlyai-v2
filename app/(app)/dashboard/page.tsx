import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Plus } from "lucide-react";

import { ActivityFeed } from "@/components/features/dashboard/activity-feed";
import { AISidekickStrip } from "@/components/features/dashboard/ai-sidekick-strip";
import { AttentionCards } from "@/components/features/dashboard/attention-cards";
import { DashboardKpiCards } from "@/components/features/dashboard/kpi-cards";
import { PipelinePanel } from "@/components/features/dashboard/pipeline-panel";
import { RevenueCard } from "@/components/features/dashboard/revenue-card";
import { PlanLimitBanner } from "@/components/features/billing/plan-limit-banner";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import {
  getActivePipeline,
  getAttentionItems,
  getDashboardCounts,
  getRecentActivity,
} from "@/lib/dashboard/dashboard-queries";
import {
  currentMonthRange,
  lastNMonthsRange,
} from "@/lib/finance/date-utils";
import {
  getFinancialSummary,
  getMonthlyRevenue,
} from "@/lib/finance/finance-queries";
import { getProfile } from "@/lib/profile/actions";

export const metadata: Metadata = {
  title: "Dashboard",
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function todayEyebrow(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());
}

export default async function DashboardPage() {
  const result = await getProfile();
  if (!result.ok || result.profile === null) redirect("/auth/login");

  const firstName =
    result.profile.full_name?.trim().split(/\s+/)[0] ?? "there";
  const currency = result.profile.default_currency ?? "USD";

  const [summary, counts, attentionItems, activity, pipeline, monthlyRevenue] =
    await Promise.all([
      getFinancialSummary(currentMonthRange()),
      getDashboardCounts(),
      getAttentionItems(),
      getRecentActivity(),
      getActivePipeline(),
      getMonthlyRevenue(lastNMonthsRange(6)),
    ]);

  const subtitleParts: string[] = [];
  if (attentionItems.length > 0) {
    subtitleParts.push(
      `${attentionItems.length} thing${attentionItems.length !== 1 ? "s" : ""} need${attentionItems.length === 1 ? "s" : ""} you`,
    );
  }
  if (summary.outstanding > 0) {
    subtitleParts.push(`${formatCurrency(summary.outstanding)} outstanding`);
  }
  if (counts.nearingDeadlineCount > 0) {
    subtitleParts.push(
      `${counts.nearingDeadlineCount} deadline${counts.nearingDeadlineCount !== 1 ? "s" : ""} this week`,
    );
  }
  const subtitle =
    subtitleParts.length > 0
      ? subtitleParts.join(" · ")
      : "All clear today.";

  return (
    <div className="flex flex-col gap-6">
      <PlanLimitBanner />

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between reveal">
        <div className="flex flex-col gap-1.5">
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {todayEyebrow()}
          </p>
          <h1 className="font-heading text-[22px] font-bold tracking-[-0.02em] text-foreground md:text-2xl">
            {greeting()}, {firstName}.
          </h1>
          <p className="max-w-2xl text-[13px] text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar />
            This month
          </Button>
          <Button size="sm" nativeButton={false} render={<Link href="/documents/new?type=invoice" />}>
            <Plus />
            New invoice
          </Button>
        </div>
      </div>

      {/* AI sidekick strip */}
      <AISidekickStrip />

      {/* KPI grid */}
      <DashboardKpiCards summary={summary} currency={currency} />

      {/* Attention cards */}
      <AttentionCards items={attentionItems} />

      {/* Revenue chart + Activity */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <RevenueCard data={monthlyRevenue} currency={currency} />
        <ActivityFeed events={activity} currency={currency} />
      </div>

      {/* Pipeline (full width) */}
      <div className="grid gap-4">
        <PipelinePanel pipeline={pipeline} currency={currency} />
      </div>
    </div>
  );
}
