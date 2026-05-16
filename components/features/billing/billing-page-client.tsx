"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { mockUpgradePlan, mockDowngradePlan } from "@/lib/billing/actions";
import { PLANS, PLAN_ORDER, type PlanTier } from "@/config/plans";
import { cn } from "@/lib/utils";
import type { Subscription } from "@/types";
import { PlanCard } from "./plan-card";

interface BillingPageClientProps {
  currentPlan: PlanTier;
  subscription: Subscription | null;
}

const PLAN_BADGE_STYLE: Record<PlanTier, string> = {
  free: "bg-slate-100 text-slate-600 border-slate-200",
  starter: "bg-sky-100 text-sky-700 border-sky-200",
  pro: "bg-amber-100 text-amber-800 border-amber-300",
  agency: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export function BillingPageClient({
  currentPlan,
  subscription,
}: BillingPageClientProps) {
  const [plan, setPlan] = useState<PlanTier>(currentPlan);
  const [loading, setLoading] = useState(false);

  async function handleUpgrade(targetPlan: PlanTier) {
    setLoading(true);
    const result = await mockUpgradePlan({ plan: targetPlan });
    setLoading(false);
    if (result.ok) {
      setPlan(targetPlan);
      toast.success(`Upgraded to ${PLANS[targetPlan].name}!`);
    } else {
      toast.error(result.error ?? "Upgrade failed");
    }
  }

  async function handleDowngrade() {
    setLoading(true);
    const result = await mockDowngradePlan();
    setLoading(false);
    if (result.ok) {
      setPlan("free");
      toast.success("Downgraded to Free plan");
    } else {
      toast.error(result.error ?? "Downgrade failed");
    }
  }

  const currentPlanConfig = PLANS[plan];

  return (
    <div className="min-h-full">
      {/* Mock mode banner */}
      <div className="mb-8 flex items-start gap-3 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-yellow-50/60 px-4 py-3.5 shadow-sm shadow-amber-100/40">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
        <div>
          <p className="text-[13px] font-semibold text-amber-800">
            Mock mode active
          </p>
          <p className="mt-0.5 text-[12px] text-amber-700/80 leading-snug">
            Changes apply instantly to your local profile. Real Lemon Squeezy
            billing replaces this before launch — no charges will ever be made
            here.
          </p>
        </div>
      </div>

      <PageHeader
        eyebrow="Settings"
        title="Billing &amp; Plans"
        description="Choose the plan that grows with your business. Upgrade or downgrade at any time."
        actions={
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 border",
              PLAN_BADGE_STYLE[plan],
            )}
          >
            {currentPlanConfig.name}
          </Badge>
        }
      />
      {subscription?.current_period_end && plan !== "free" && (
        <p className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground rounded-lg border border-border bg-muted/40 px-3 py-1.5 w-fit">
          <Zap className="size-3 text-amber-500" />
          Renews{" "}
          <span className="font-medium text-foreground">
            {new Date(subscription.current_period_end).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric", year: "numeric" },
            )}
          </span>
        </p>
      )}

      {/* Plan cards grid */}
      <div
        className={cn(
          "grid gap-5",
          "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
          // Extra top padding to accommodate Pro card's elevated badge
          "pt-5",
        )}
      >
        {PLAN_ORDER.map((planId, i) => (
          <div
            key={planId}
            className="opacity-0 animate-[fadeUp_0.4s_ease_forwards]"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <PlanCard
              plan={PLANS[planId]}
              currentPlan={plan}
              onUpgrade={handleUpgrade}
              onDowngrade={handleDowngrade}
              loading={loading}
            />
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-10 text-center text-[12px] text-muted-foreground/70">
        All prices in USD. Annual billing saves up to 20%. Cancel anytime.
      </p>
    </div>
  );
}
