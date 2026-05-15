# Plan-Awareness System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface plan limits to Free/Starter users at the exact moment they're relevant — avatar dropdown usage bars, ghost upgrade rows on lists, and a smart dashboard banner when near a limit.

**Architecture:** Fetch client_count and doc_count_this_month in `app/(app)/layout.tsx` alongside the existing profile query, pass the result through `DashboardShell` into a `PlanUsageContext`, and read from context in any component that needs it. Pure helper functions handle all limit math and are unit-tested. UI components are purely presentational.

**Tech Stack:** Next.js 15 App Router, Supabase, shadcn/ui, Tailwind CSS 4, Vitest

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `lib/plan-usage/helpers.ts` | `getPlanLimit`, `getUsageRatio`, `getUsageColor`, `shouldShowBanner`, `startOfCurrentMonth` |
| Create | `lib/plan-usage/helpers.test.ts` | Vitest tests for all helpers |
| Create | `lib/plan-usage/context.tsx` | `PlanUsageContext`, `PlanUsageProvider`, `usePlanUsage` hook |
| Create | `components/features/billing/plan-usage-bars.tsx` | Usage bars rendered inside avatar dropdown |
| Create | `components/features/billing/upgrade-ghost-row.tsx` | Ghost "add more" row for lists |
| Create | `components/features/billing/plan-limit-banner.tsx` | Slim dismissible banner for dashboard |
| Modify | `app/(app)/layout.tsx` | Add parallel count queries; pass `planUsage` to `DashboardShell` |
| Modify | `components/layout/dashboard-shell.tsx` | Accept `planUsage` prop; wrap children in `PlanUsageProvider` |
| Modify | `components/layout/app-header.tsx` | Accept `planUsage` prop; render `PlanUsageBars` in dropdown |
| Modify | `app/(app)/clients/page.tsx` | Read plan limit; render `UpgradeGhostRow` when at limit |
| Modify | `app/(app)/dashboard/page.tsx` | Render `PlanLimitBanner` |

---

## Task 1: Pure helpers + tests (TDD)

**Files:**
- Create: `lib/plan-usage/helpers.ts`
- Create: `lib/plan-usage/helpers.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// lib/plan-usage/helpers.test.ts
import { describe, it, expect } from "vitest";
import {
  getPlanLimit,
  getUsageRatio,
  getUsageColor,
  shouldShowBanner,
  startOfCurrentMonth,
} from "./helpers";

describe("getPlanLimit", () => {
  it("returns 3 clients for free", () => {
    expect(getPlanLimit("free", "clients")).toBe(3);
  });
  it("returns 5 docs for free", () => {
    expect(getPlanLimit("free", "docsPerMonth")).toBe(5);
  });
  it("returns 15 clients for starter", () => {
    expect(getPlanLimit("starter", "clients")).toBe(15);
  });
  it("returns Infinity for unlimited", () => {
    expect(getPlanLimit("starter", "docsPerMonth")).toBe(Infinity);
    expect(getPlanLimit("pro", "clients")).toBe(Infinity);
    expect(getPlanLimit("agency", "clients")).toBe(Infinity);
  });
});

describe("getUsageRatio", () => {
  it("returns ratio when limit is finite", () => {
    expect(getUsageRatio(2, 3)).toBeCloseTo(0.667, 2);
  });
  it("returns 0 when limit is Infinity", () => {
    expect(getUsageRatio(999, Infinity)).toBe(0);
  });
});

describe("getUsageColor", () => {
  it("returns emerald for ratio <= 0.6", () => {
    expect(getUsageColor(0)).toBe("emerald");
    expect(getUsageColor(0.6)).toBe("emerald");
  });
  it("returns amber for ratio 0.61–0.8", () => {
    expect(getUsageColor(0.61)).toBe("amber");
    expect(getUsageColor(0.8)).toBe("amber");
  });
  it("returns red for ratio > 0.8", () => {
    expect(getUsageColor(0.81)).toBe("red");
    expect(getUsageColor(1)).toBe("red");
  });
});

describe("shouldShowBanner", () => {
  it("returns true when clients ratio >= 0.8", () => {
    expect(
      shouldShowBanner({ planTier: "free", clientCount: 3, docCountThisMonth: 1 })
    ).toBe(true);
  });
  it("returns true when docs ratio >= 0.8", () => {
    expect(
      shouldShowBanner({ planTier: "free", clientCount: 1, docCountThisMonth: 4 })
    ).toBe(true);
  });
  it("returns false when both under 80%", () => {
    expect(
      shouldShowBanner({ planTier: "free", clientCount: 1, docCountThisMonth: 2 })
    ).toBe(false);
  });
  it("returns false for pro regardless of counts", () => {
    expect(
      shouldShowBanner({ planTier: "pro", clientCount: 999, docCountThisMonth: 999 })
    ).toBe(false);
  });
  it("returns false for agency", () => {
    expect(
      shouldShowBanner({ planTier: "agency", clientCount: 999, docCountThisMonth: 999 })
    ).toBe(false);
  });
});

describe("startOfCurrentMonth", () => {
  it("returns ISO string for first of current month", () => {
    const result = startOfCurrentMonth();
    const now = new Date();
    expect(result).toMatch(/^\d{4}-\d{2}-01T/);
    expect(result.startsWith(`${now.getFullYear()}-`)).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

```bash
npm run test -- lib/plan-usage/helpers.test.ts
```

Expected: FAIL — "Cannot find module './helpers'"

- [ ] **Step 3: Write the helpers**

```typescript
// lib/plan-usage/helpers.ts
import { PLANS, PLAN_ORDER } from "@/config/plans";
import type { PlanTier } from "@/config/plans";

export type LimitKey = "clients" | "docsPerMonth";
export type UsageColor = "emerald" | "amber" | "red";

export interface PlanUsage {
  planTier: PlanTier;
  clientCount: number;
  docCountThisMonth: number;
}

export function getPlanLimit(tier: PlanTier, key: LimitKey): number {
  const val = PLANS[tier].limits[key];
  return val === "unlimited" ? Infinity : val;
}

export function getUsageRatio(used: number, limit: number): number {
  if (limit === Infinity) return 0;
  return used / limit;
}

export function getUsageColor(ratio: number): UsageColor {
  if (ratio > 0.8) return "red";
  if (ratio > 0.6) return "amber";
  return "emerald";
}

export function shouldShowBanner(usage: PlanUsage): boolean {
  const { planTier, clientCount, docCountThisMonth } = usage;
  if (PLAN_ORDER.indexOf(planTier) >= PLAN_ORDER.indexOf("pro")) return false;
  const clientRatio = getUsageRatio(clientCount, getPlanLimit(planTier, "clients"));
  const docRatio = getUsageRatio(docCountThisMonth, getPlanLimit(planTier, "docsPerMonth"));
  return clientRatio >= 0.8 || docRatio >= 0.8;
}

export function startOfCurrentMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export function getBannerMessage(usage: PlanUsage): string {
  const { planTier, clientCount, docCountThisMonth } = usage;
  const clientLimit = getPlanLimit(planTier, "clients");
  const docLimit = getPlanLimit(planTier, "docsPerMonth");
  const clientRatio = getUsageRatio(clientCount, clientLimit);
  const docRatio = getUsageRatio(docCountThisMonth, docLimit);

  if (clientRatio >= docRatio && clientRatio >= 0.8) {
    const remaining = clientLimit - clientCount;
    return remaining === 0
      ? `Client limit reached (${clientCount}/${clientLimit}) — upgrade to add more`
      : `${clientCount}/${clientLimit} clients used — ${remaining} remaining`;
  }
  const remaining = docLimit - docCountThisMonth;
  return remaining === 0
    ? `Document limit reached (${docCountThisMonth}/${docLimit}) — upgrade for unlimited`
    : `${docCountThisMonth}/${docLimit} documents used this month — ${remaining} remaining`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test -- lib/plan-usage/helpers.test.ts
```

Expected: PASS — all tests green

- [ ] **Step 5: Commit**

```bash
git add lib/plan-usage/helpers.ts lib/plan-usage/helpers.test.ts
git commit -m "feat(plan-awareness): pure helpers + tests"
```

---

## Task 2: PlanUsageContext

**Files:**
- Create: `lib/plan-usage/context.tsx`

- [ ] **Step 1: Write the context**

```typescript
// lib/plan-usage/context.tsx
"use client";

import { createContext, useContext } from "react";
import type { PlanUsage } from "./helpers";
import type { PlanTier } from "@/config/plans";

const defaultUsage: PlanUsage = {
  planTier: "free",
  clientCount: 0,
  docCountThisMonth: 0,
};

const PlanUsageContext = createContext<PlanUsage>(defaultUsage);

export function PlanUsageProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: PlanUsage;
}) {
  return (
    <PlanUsageContext.Provider value={value}>
      {children}
    </PlanUsageContext.Provider>
  );
}

export function usePlanUsage(): PlanUsage {
  return useContext(PlanUsageContext);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/plan-usage/context.tsx
git commit -m "feat(plan-awareness): PlanUsageContext and provider"
```

---

## Task 3: PlanUsageBars component (avatar dropdown)

**Files:**
- Create: `components/features/billing/plan-usage-bars.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/features/billing/plan-usage-bars.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getPlanLimit, getUsageRatio, getUsageColor } from "@/lib/plan-usage/helpers";
import type { PlanUsage } from "@/lib/plan-usage/helpers";
import type { PlanTier } from "@/config/plans";
import { PLAN_ORDER } from "@/config/plans";

const COLOR_CLASSES = {
  emerald: {
    bar: "bg-emerald-500",
    track: "bg-emerald-100 dark:bg-emerald-950",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    bar: "bg-amber-500",
    track: "bg-amber-100 dark:bg-amber-950",
    text: "text-amber-600 dark:text-amber-400",
  },
  red: {
    bar: "bg-red-500",
    track: "bg-red-100 dark:bg-red-950",
    text: "text-red-600 dark:text-red-400",
  },
} as const;

interface UsageBarProps {
  label: string;
  used: number;
  limit: number;
}

function UsageBar({ label, used, limit }: UsageBarProps) {
  const ratio = getUsageRatio(used, limit);
  const color = getUsageColor(ratio);
  const classes = COLOR_CLASSES[color];
  const pct = Math.min(ratio * 100, 100);
  const displayLimit = limit === Infinity ? "∞" : String(limit);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("text-xs font-medium tabular-nums", classes.text)}>
          {used} / {displayLimit}
        </span>
      </div>
      <div className={cn("h-1 w-full rounded-full", classes.track)}>
        <div
          className={cn("h-full rounded-full transition-all", classes.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface PlanUsageBarsProps {
  usage: PlanUsage;
}

export function PlanUsageBars({ usage }: PlanUsageBarsProps) {
  const { planTier, clientCount, docCountThisMonth } = usage;

  // Don't render for Pro/Agency — they have no meaningful limits
  if (PLAN_ORDER.indexOf(planTier as PlanTier) >= PLAN_ORDER.indexOf("pro")) {
    return null;
  }

  const clientLimit = getPlanLimit(planTier, "clients");
  const docLimit = getPlanLimit(planTier, "docsPerMonth");

  return (
    <div className="flex flex-col gap-2 px-2 py-2">
      <UsageBar label="Clients" used={clientCount} limit={clientLimit} />
      {docLimit !== Infinity && (
        <UsageBar label="Docs / month" used={docCountThisMonth} limit={docLimit} />
      )}
      <Link
        href="/settings/billing"
        className="mt-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Upgrade plan →
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/features/billing/plan-usage-bars.tsx
git commit -m "feat(plan-awareness): PlanUsageBars component for avatar dropdown"
```

---

## Task 4: UpgradeGhostRow component

**Files:**
- Create: `components/features/billing/upgrade-ghost-row.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/features/billing/upgrade-ghost-row.tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpgradeGhostRowProps {
  title: string;
  description: string;
  className?: string;
}

export function UpgradeGhostRow({ title, description, className }: UpgradeGhostRowProps) {
  return (
    <Link
      href="/settings/billing"
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-dashed border-emerald-200 dark:border-emerald-900",
        "bg-emerald-50/50 dark:bg-emerald-950/30 px-4 py-3",
        "transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/50",
        className
      )}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-emerald-300 dark:border-emerald-700 bg-white dark:bg-transparent">
        <Plus className="size-3.5 text-emerald-500" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
          {title}
        </span>
        <span className="text-xs text-emerald-600 dark:text-emerald-400">
          {description}
        </span>
      </div>
      <span className="shrink-0 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-semibold text-white">
        Upgrade →
      </span>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/features/billing/upgrade-ghost-row.tsx
git commit -m "feat(plan-awareness): UpgradeGhostRow component"
```

---

## Task 5: PlanLimitBanner component (dashboard)

**Files:**
- Create: `components/features/billing/plan-limit-banner.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/features/billing/plan-limit-banner.tsx
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
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

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
```

- [ ] **Step 2: Commit**

```bash
git add components/features/billing/plan-limit-banner.tsx
git commit -m "feat(plan-awareness): PlanLimitBanner component"
```

---

## Task 6: Wire data in layout.tsx

**Files:**
- Modify: `app/(app)/layout.tsx`

- [ ] **Step 1: Update layout to fetch counts and pass planUsage**

Replace the entire file content:

```typescript
// app/(app)/layout.tsx
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

  // Parallel fetch: client count + doc count this month
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
```

- [ ] **Step 2: Commit**

```bash
git add "app/(app)/layout.tsx"
git commit -m "feat(plan-awareness): fetch usage counts in layout"
```

---

## Task 7: Wire DashboardShell + AppHeader

**Files:**
- Modify: `components/layout/dashboard-shell.tsx`
- Modify: `components/layout/app-header.tsx`

- [ ] **Step 1: Update DashboardShell**

Replace the entire file:

```typescript
// components/layout/dashboard-shell.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PlanUsageProvider } from "@/lib/plan-usage/context";
import type { PlanUsage } from "@/lib/plan-usage/helpers";

type DashboardShellProps = {
  children: React.ReactNode;
  userEmail: string | null;
  userInitials: string;
  planUsage: PlanUsage;
};

export function DashboardShell({
  children,
  userEmail,
  userInitials,
  planUsage,
}: DashboardShellProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return (
    <PlanUsageProvider value={planUsage}>
      <SidebarProvider className="flex h-dvh min-h-0 w-full overflow-hidden">
        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
        <AppSidebar />
        <SidebarInset className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
          <div
            ref={scrollRef}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain"
          >
            <AppHeader
              userEmail={userEmail}
              userInitials={userInitials}
              planUsage={planUsage}
              onOpenSearch={() => setCommandOpen(true)}
            />
            <div className="flex flex-col gap-6 p-4 md:p-6">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </PlanUsageProvider>
  );
}
```

- [ ] **Step 2: Update AppHeader**

Replace the entire file:

```typescript
// components/layout/app-header.tsx
"use client";

import Link from "next/link";
import { CreditCard, LifeBuoy, Search, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { PlanUsageBars } from "@/components/features/billing/plan-usage-bars";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SHELL_HEADER_CLASS } from "@/lib/dashboard/shell";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { PLAN_ORDER } from "@/config/plans";
import type { PlanUsage } from "@/lib/plan-usage/helpers";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  agency: "Agency",
};

type AppHeaderProps = {
  userEmail: string | null;
  userInitials: string;
  planUsage: PlanUsage;
  onOpenSearch: () => void;
};

export function AppHeader({
  userEmail,
  userInitials,
  planUsage,
  onOpenSearch,
}: AppHeaderProps) {
  const router = useRouter();
  const showUsageBars = PLAN_ORDER.indexOf(planUsage.planTier) < PLAN_ORDER.indexOf("pro");

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header
      className={cn(
        SHELL_HEADER_CLASS,
        "sticky top-0 z-20 flex items-center gap-3 border-b border-sidebar-border/70 bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 md:gap-4 md:px-6",
      )}
    >
      <SidebarTrigger className="shrink-0" />

      <Button
        type="button"
        variant="outline"
        className="hidden h-9 min-w-0 max-w-lg flex-1 justify-start gap-2 px-3 text-muted-foreground md:flex"
        onClick={onOpenSearch}
      >
        <Search data-icon="inline-start" />
        <span className="truncate text-muted-foreground">Search…</span>
        <kbd className="pointer-events-none ms-auto hidden h-5 shrink-0 items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground select-none sm:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <div className="ms-auto flex shrink-0 items-center gap-2 md:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={onOpenSearch}
          aria-label="Open search"
        >
          <Search />
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full p-0"
                aria-label="Account menu"
              />
            }
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium">Account</span>
                    {userEmail ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {userEmail}
                      </span>
                    ) : null}
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs capitalize font-medium">
                    {PLAN_LABELS[planUsage.planTier] ?? planUsage.planTier}
                  </Badge>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            {showUsageBars && (
              <>
                <DropdownMenuSeparator />
                <PlanUsageBars usage={planUsage} />
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/settings" />}>
                <Settings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/settings/billing" />}>
                <CreditCard />
                Billing &amp; Plans
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/support" />}>
                <LifeBuoy />
                Support
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onClick={() => void signOut()}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/layout/dashboard-shell.tsx components/layout/app-header.tsx
git commit -m "feat(plan-awareness): wire planUsage through shell and header"
```

---

## Task 8: Ghost row on clients page

**Files:**
- Modify: `app/(app)/clients/page.tsx`

- [ ] **Step 1: Update clients page**

Replace the entire file:

```typescript
// app/(app)/clients/page.tsx
import Link from "next/link";
import { Plus } from "lucide-react";

import { listClients } from "@/lib/clients/actions";
import { getProfile } from "@/lib/profile/actions";
import { getPlanLimit } from "@/lib/plan-usage/helpers";
import { paginatedListSkeletonCount } from "@/lib/ui/skeleton-count";
import { SkeletonCountRecorder } from "@/hooks/use-skeleton-count";
import { ClientsTable } from "@/components/features/clients/clients-table";
import { UpgradeGhostRow } from "@/components/features/billing/upgrade-ghost-row";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PlanTier } from "@/config/plans";

export default async function ClientsPage() {
  const [clientsResult, profileResult] = await Promise.all([
    listClients(),
    getProfile(),
  ]);

  if (!clientsResult.ok) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Clients
        </h1>
        <p className="text-destructive text-sm">{clientsResult.message}</p>
      </div>
    );
  }

  const { clients } = clientsResult;
  const planTier = (profileResult.ok && profileResult.profile?.plan_tier
    ? profileResult.profile.plan_tier
    : "free") as PlanTier;
  const clientLimit = getPlanLimit(planTier, "clients");
  const atLimit = clients.length >= clientLimit;

  return (
    <div className="flex flex-col gap-8">
      <SkeletonCountRecorder
        id="clients:list"
        count={paginatedListSkeletonCount(clients.length)}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Clients
          </h1>
          <p className="max-w-lg text-muted-foreground text-sm">
            People and companies you work with. Add billing details now or come
            back anytime.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/clients/new" />}
          disabled={atLimit}
          aria-disabled={atLimit}
        >
          <Plus />
          Add client
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No clients yet</CardTitle>
            <CardDescription>
              When you add a client, they appear here with quick links to their
              profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              nativeButton={false}
              render={<Link href="/clients/new" />}
            >
              <Plus />
              Add your first client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          <ClientsTable clients={clients} />
          {atLimit && (
            <UpgradeGhostRow
              title="Add more clients"
              description={`Upgrade to Starter — 15 clients, unlimited documents`}
            />
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(app)/clients/page.tsx"
git commit -m "feat(plan-awareness): ghost upgrade row on clients list"
```

---

## Task 9: Banner on dashboard page

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Add PlanLimitBanner to dashboard**

Find this block near the top of `DashboardPage`:

```typescript
  return (
    <>
      <div className="relative shrink-0 rounded-3xl border
```

Replace the `return (` block with:

```typescript
  return (
    <>
      <PlanLimitBanner />
      <div className="relative shrink-0 rounded-3xl border
```

Also add the import at the top of the file with the other imports:

```typescript
import { PlanLimitBanner } from "@/components/features/billing/plan-limit-banner";
```

- [ ] **Step 2: Commit**

```bash
git add "app/(app)/dashboard/page.tsx"
git commit -m "feat(plan-awareness): PlanLimitBanner on dashboard"
```

---

## Task 10: Build + full test suite

- [ ] **Step 1: Run all tests**

```bash
npm run test
```

Expected: all tests pass (including new helpers tests)

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: clean build, no type errors

- [ ] **Step 3: Fix any issues, commit if needed**

```bash
git add -A
git commit -m "fix(plan-awareness): resolve build/lint issues"
```

---

## Verification Checklist

1. Open avatar dropdown → see plan badge chip beside email, usage bars with colour coding, "Upgrade plan →" link
2. Bars are green at low usage, amber at 61–80%, red above 80%
3. Pro/Agency users: no usage bars shown in dropdown
4. Clients page with 3/3 Free clients → "Add client" button is disabled + ghost row appears
5. Clients page under limit → no ghost row
6. Dashboard as Free user with 4/5 docs → amber banner appears above page title
7. Dismiss banner → it disappears, stays gone on refresh (localStorage)
8. Banner resets next calendar month (key changes)
9. Pro user → no banner ever, no ghost rows
