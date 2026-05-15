"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { shouldShowBanner, getBannerMessage } from "@/lib/plan-usage/helpers";
import { usePlanUsage } from "@/lib/plan-usage/context";

function getDismissKey(): string {
  const now = new Date();
  return `plan-banner-dismissed-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function PlanLimitBanner() {
  const usage = usePlanUsage();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const key = getDismissKey();
    setDismissed(localStorage.getItem(key) === "true");
  }, []);

  if (!shouldShowBanner(usage) || dismissed) return null;

  function dismiss() {
    localStorage.setItem(getDismissKey(), "true");
    setDismissed(true);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-amber-200 dark:border-amber-800",
        "bg-amber-50 dark:bg-amber-950/40 px-4 py-2.5"
      )}
    >
      <Zap className="size-4 shrink-0 text-amber-500" aria-hidden />
      <p className="flex-1 text-sm text-amber-800 dark:text-amber-200">
        {getBannerMessage(usage)}
      </p>
      <Link
        href="/settings/billing"
        className="shrink-0 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
      >
        Upgrade
      </Link>
      <button
        onClick={dismiss}
        className="shrink-0 text-amber-500 hover:text-amber-700 transition-colors"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
