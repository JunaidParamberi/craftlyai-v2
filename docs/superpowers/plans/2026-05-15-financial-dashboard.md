# Financial Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a live revenue analytics dashboard at `/finance` — KPI cards, area chart, and invoice table, all filtered by time period via URL search params.

**Architecture:** Server component page reads `?from` / `?to` URL params, fetches all data in one `Promise.all`, passes down to presentational components. Recharts `AreaChart` and the filter bar are client components; everything else server-renders. No new DB migrations needed — all data from existing `documents` + `line_items` tables.

**Tech Stack:** Next.js 15 App Router, Recharts, Supabase (server client), shadcn/ui (Card, Badge, Tabs, Popover, Calendar), date-fns, Zod, Vitest, Lucide React

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/finance/types.ts` | Create | `FinancialSummary` and `MonthlyRevenuePoint` types |
| `lib/finance/date-utils.ts` | Create | Date range helpers (current month, last 3m, YTD, param parsing) |
| `lib/finance/date-utils.test.ts` | Create | Tests for date range helpers |
| `lib/finance/revenue-calc.ts` | Create | Pure revenue calculation logic (line item totals, discount, avg pay days) |
| `lib/finance/revenue-calc.test.ts` | Create | Tests for revenue calculations |
| `lib/finance/finance-queries.ts` | Create | `getFinancialSummary`, `getMonthlyRevenue`, `listFinanceInvoices` |
| `components/features/finance/kpi-card.tsx` | Create | Single KPI card (white + top border + icon pill) |
| `components/features/finance/finance-summary-cards.tsx` | Create | 4-card grid using `KpiCard` |
| `components/features/finance/revenue-area-chart.tsx` | Create | Recharts `AreaChart` client component |
| `components/features/finance/finance-filter-bar.tsx` | Create | Preset tabs + date range picker, updates URL params |
| `components/features/finance/finance-invoice-table.tsx` | Create | Recent invoices table with status badges |
| `app/(app)/finance/page.tsx` | Modify | Replace placeholder; fetch all data; compose page |

---

## Task 1: Install Recharts and Create Branch

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Create feature branch**

```bash
git checkout dev && git pull origin dev
git checkout -b feat/financial-dashboard
```

- [ ] **Step 2: Install recharts**

```bash
npm install recharts
```

- [ ] **Step 3: Verify install**

```bash
node -e "require('recharts'); console.log('recharts ok')"
```
Expected: `recharts ok`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install recharts for financial dashboard"
```

---

## Task 2: Types

**Files:**
- Create: `lib/finance/types.ts`

- [ ] **Step 1: Create types file**

```typescript
// lib/finance/types.ts

export type FinancialSummary = {
  totalRevenue: number;
  outstanding: number;
  overdue: number;
  avgPayDays: number | null;
  revenueChangePct: number | null;
  overdueCount: number;
  outstandingCount: number;
};

export type MonthlyRevenuePoint = {
  month: string;     // "Jan 2026" — display label
  monthKey: string;  // "2026-01" — sort key
  revenue: number;
  isCurrent: boolean;
};

export type DateRange = {
  from: Date;
  to: Date;
};
```

- [ ] **Step 2: Commit**

```bash
git add lib/finance/types.ts
git commit -m "feat(finance): add FinancialSummary and MonthlyRevenuePoint types"
```

---

## Task 3: Date Range Utilities + Tests

**Files:**
- Create: `lib/finance/date-utils.ts`
- Create: `lib/finance/date-utils.test.ts`

- [ ] **Step 1: Write failing tests first**

```typescript
// lib/finance/date-utils.test.ts
import { describe, expect, it } from "vitest";
import {
  currentMonthRange,
  lastNMonthsRange,
  yearToDateRange,
  parseDateRangeParams,
  formatDateParam,
} from "./date-utils";

describe("currentMonthRange", () => {
  it("returns start of current month as from and now as to", () => {
    const { from, to } = currentMonthRange();
    expect(from.getDate()).toBe(1);
    expect(from.getHours()).toBe(0);
    expect(to.getTime()).toBeLessThanOrEqual(Date.now() + 1000);
  });
});

describe("lastNMonthsRange", () => {
  it("returns a range spanning exactly N months back from today", () => {
    const { from, to } = lastNMonthsRange(3);
    const diffMs = to.getTime() - from.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThan(80);
    expect(diffDays).toBeLessThan(95);
  });
});

describe("yearToDateRange", () => {
  it("starts on Jan 1 of the current year", () => {
    const { from } = yearToDateRange();
    expect(from.getMonth()).toBe(0);
    expect(from.getDate()).toBe(1);
    expect(from.getFullYear()).toBe(new Date().getFullYear());
  });
});

describe("parseDateRangeParams", () => {
  it("returns currentMonthRange when both params are absent", () => {
    const range = parseDateRangeParams(undefined, undefined);
    expect(range.from.getDate()).toBe(1);
  });

  it("parses valid ISO date strings", () => {
    const range = parseDateRangeParams("2026-01-01", "2026-03-31");
    expect(range.from.getFullYear()).toBe(2026);
    expect(range.from.getMonth()).toBe(0);
    expect(range.to.getMonth()).toBe(2);
  });

  it("falls back to currentMonthRange when params are invalid", () => {
    const range = parseDateRangeParams("not-a-date", "also-bad");
    expect(range.from.getDate()).toBe(1);
  });
});

describe("formatDateParam", () => {
  it("formats a date as YYYY-MM-DD", () => {
    const d = new Date(2026, 0, 15); // Jan 15 2026
    expect(formatDateParam(d)).toBe("2026-01-15");
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npm run test -- lib/finance/date-utils.test.ts
```
Expected: FAIL — `Cannot find module './date-utils'`

- [ ] **Step 3: Implement date-utils**

```typescript
// lib/finance/date-utils.ts
import {
  startOfMonth,
  startOfYear,
  subMonths,
  format,
  parseISO,
  isValid,
} from "date-fns";
import type { DateRange } from "./types";

export function currentMonthRange(): DateRange {
  return { from: startOfMonth(new Date()), to: new Date() };
}

export function lastNMonthsRange(n: number): DateRange {
  return { from: subMonths(new Date(), n), to: new Date() };
}

export function yearToDateRange(): DateRange {
  return { from: startOfYear(new Date()), to: new Date() };
}

export function previousPeriodRange(current: DateRange): DateRange {
  const durationMs = current.to.getTime() - current.from.getTime();
  return {
    from: new Date(current.from.getTime() - durationMs),
    to: new Date(current.from.getTime()),
  };
}

export function formatDateParam(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseDateRangeParams(
  from: string | undefined,
  to: string | undefined
): DateRange {
  if (!from || !to) return currentMonthRange();
  const parsedFrom = parseISO(from);
  const parsedTo = parseISO(to);
  if (!isValid(parsedFrom) || !isValid(parsedTo)) return currentMonthRange();
  return { from: parsedFrom, to: parsedTo };
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npm run test -- lib/finance/date-utils.test.ts
```
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add lib/finance/date-utils.ts lib/finance/date-utils.test.ts
git commit -m "feat(finance): date range utilities with tests"
```

---

## Task 4: Revenue Calculation Helpers + Tests

**Files:**
- Create: `lib/finance/revenue-calc.ts`
- Create: `lib/finance/revenue-calc.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// lib/finance/revenue-calc.test.ts
import { describe, expect, it } from "vitest";
import {
  calcLineItemsTotal,
  applyDiscount,
  calcAvgPayDays,
  calcRevenueChangePct,
} from "./revenue-calc";

describe("calcLineItemsTotal", () => {
  it("sums quantity * unit_price across all line items", () => {
    const items = [
      { quantity: "2", unit_price: "100.00", tax_rate: "0" },
      { quantity: "1", unit_price: "50.00", tax_rate: "0" },
    ];
    expect(calcLineItemsTotal(items)).toBe(250);
  });

  it("returns 0 for empty line items", () => {
    expect(calcLineItemsTotal([])).toBe(0);
  });
});

describe("applyDiscount", () => {
  it("applies percent discount", () => {
    expect(applyDiscount(200, "percent", 10)).toBe(180);
  });

  it("applies flat discount, clamped to subtotal", () => {
    expect(applyDiscount(200, "flat", 50)).toBe(150);
    expect(applyDiscount(200, "flat", 300)).toBe(0);
  });

  it("returns subtotal unchanged when discount_value is 0", () => {
    expect(applyDiscount(200, "percent", 0)).toBe(200);
    expect(applyDiscount(200, "flat", 0)).toBe(200);
  });
});

describe("calcAvgPayDays", () => {
  it("returns average days between sent_at and paid_at", () => {
    const invoices = [
      { sent_at: "2026-01-01T00:00:00Z", paid_at: "2026-01-15T00:00:00Z" },
      { sent_at: "2026-02-01T00:00:00Z", paid_at: "2026-02-11T00:00:00Z" },
    ];
    expect(calcAvgPayDays(invoices)).toBe(12);
  });

  it("returns null when no paid invoices", () => {
    expect(calcAvgPayDays([])).toBeNull();
  });
});

describe("calcRevenueChangePct", () => {
  it("computes percentage change", () => {
    expect(calcRevenueChangePct(1200, 1000)).toBe(20);
  });

  it("returns null when previous is 0", () => {
    expect(calcRevenueChangePct(500, 0)).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npm run test -- lib/finance/revenue-calc.test.ts
```
Expected: FAIL — `Cannot find module './revenue-calc'`

- [ ] **Step 3: Implement revenue-calc**

```typescript
// lib/finance/revenue-calc.ts
import { differenceInDays, parseISO } from "date-fns";

type LineItemLike = {
  quantity: string | number;
  unit_price: string | number;
  tax_rate?: string | number | null;
};

export function calcLineItemsTotal(items: LineItemLike[]): number {
  return items.reduce(
    (sum, li) => sum + Number(li.quantity) * Number(li.unit_price),
    0
  );
}

export function applyDiscount(
  subtotal: number,
  discountType: "percent" | "flat",
  discountValue: number
): number {
  if (discountValue === 0) return subtotal;
  if (discountType === "percent") {
    return subtotal * (1 - discountValue / 100);
  }
  return Math.max(0, subtotal - discountValue);
}

type PaidInvoiceLike = {
  sent_at: string | null;
  paid_at: string | null;
};

export function calcAvgPayDays(invoices: PaidInvoiceLike[]): number | null {
  const valid = invoices.filter((i) => i.sent_at && i.paid_at);
  if (valid.length === 0) return null;
  const totalDays = valid.reduce((sum, i) => {
    return sum + differenceInDays(parseISO(i.paid_at!), parseISO(i.sent_at!));
  }, 0);
  return Math.round(totalDays / valid.length);
}

export function calcRevenueChangePct(
  current: number,
  previous: number
): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npm run test -- lib/finance/revenue-calc.test.ts
```
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add lib/finance/revenue-calc.ts lib/finance/revenue-calc.test.ts
git commit -m "feat(finance): pure revenue calculation helpers with tests"
```

---

## Task 5: Finance Queries

**Files:**
- Create: `lib/finance/finance-queries.ts`

- [ ] **Step 1: Create finance-queries.ts**

```typescript
// lib/finance/finance-queries.ts
"use server";

import { format, parseISO } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import { normalizeDocumentListRow } from "@/lib/documents/normalize-document-row";
import type { DocumentListRow } from "@/types";
import type { DateRange, FinancialSummary, MonthlyRevenuePoint } from "./types";
import {
  applyDiscount,
  calcAvgPayDays,
  calcLineItemsTotal,
  calcRevenueChangePct,
} from "./revenue-calc";
import { previousPeriodRange } from "./date-utils";

// ---------------------------------------------------------------------------
// Internal: fetch paid invoices with line items for a date range
// ---------------------------------------------------------------------------
async function fetchPaidInvoicesWithLineItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  from: Date,
  to: Date
) {
  const { data: docs } = await supabase
    .from("documents")
    .select("id, paid_at, sent_at, discount_value, discount_type")
    .eq("user_id", userId)
    .eq("type", "invoice")
    .eq("status", "paid")
    .gte("paid_at", from.toISOString())
    .lte("paid_at", to.toISOString());

  if (!docs || docs.length === 0) return { docs: [], lineItemsByDoc: new Map() };

  const ids = docs.map((d) => d.id);
  const { data: lineItems } = await supabase
    .from("line_items")
    .select("document_id, quantity, unit_price")
    .in("document_id", ids);

  const lineItemsByDoc = new Map<string, typeof lineItems>();
  for (const li of lineItems ?? []) {
    const existing = lineItemsByDoc.get(li.document_id) ?? [];
    existing.push(li);
    lineItemsByDoc.set(li.document_id, existing);
  }

  return { docs, lineItemsByDoc };
}

// ---------------------------------------------------------------------------
// Compute total revenue for a range
// ---------------------------------------------------------------------------
async function computeRangeRevenue(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  from: Date,
  to: Date
): Promise<number> {
  const { docs, lineItemsByDoc } = await fetchPaidInvoicesWithLineItems(
    supabase,
    userId,
    from,
    to
  );
  return docs.reduce((total, doc) => {
    const items = lineItemsByDoc.get(doc.id) ?? [];
    const subtotal = calcLineItemsTotal(items);
    return total + applyDiscount(subtotal, doc.discount_type, doc.discount_value);
  }, 0);
}

// ---------------------------------------------------------------------------
// getFinancialSummary
// ---------------------------------------------------------------------------
export async function getFinancialSummary(
  range: DateRange
): Promise<FinancialSummary> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      totalRevenue: 0,
      outstanding: 0,
      overdue: 0,
      avgPayDays: null,
      revenueChangePct: null,
      overdueCount: 0,
      outstandingCount: 0,
    };
  }

  const prev = previousPeriodRange(range);
  const now = new Date();

  const [
    { docs: paidDocs, lineItemsByDoc: paidLineItems },
    prevRevenue,
    outstandingDocs,
  ] = await Promise.all([
    fetchPaidInvoicesWithLineItems(supabase, user.id, range.from, range.to),
    computeRangeRevenue(supabase, user.id, prev.from, prev.to),
    supabase
      .from("documents")
      .select("id, due_date, discount_value, discount_type")
      .eq("user_id", user.id)
      .eq("type", "invoice")
      .in("status", ["sent", "viewed"])
      .gte("created_at", range.from.toISOString())
      .lte("created_at", range.to.toISOString()),
  ]);

  const totalRevenue = paidDocs.reduce((sum, doc) => {
    const items = paidLineItems.get(doc.id) ?? [];
    const subtotal = calcLineItemsTotal(items);
    return sum + applyDiscount(subtotal, doc.discount_type, doc.discount_value);
  }, 0);

  const outstandingIds = (outstandingDocs.data ?? []).map((d) => d.id);
  const { data: outstandingLineItems } = outstandingIds.length > 0
    ? await supabase
        .from("line_items")
        .select("document_id, quantity, unit_price")
        .in("document_id", outstandingIds)
    : { data: [] };

  const liByOutstanding = new Map<string, typeof outstandingLineItems>();
  for (const li of outstandingLineItems ?? []) {
    const existing = liByOutstanding.get(li.document_id) ?? [];
    existing.push(li);
    liByOutstanding.set(li.document_id, existing);
  }

  let outstanding = 0;
  let outstandingCount = 0;
  let overdue = 0;
  let overdueCount = 0;

  for (const doc of outstandingDocs.data ?? []) {
    const items = liByOutstanding.get(doc.id) ?? [];
    const subtotal = calcLineItemsTotal(items);
    const net = applyDiscount(subtotal, doc.discount_type, doc.discount_value);
    outstanding += net;
    outstandingCount++;
    if (doc.due_date && parseISO(doc.due_date) < now) {
      overdue += net;
      overdueCount++;
    }
  }

  const avgPayDays = calcAvgPayDays(
    paidDocs.map((d) => ({ sent_at: d.sent_at, paid_at: d.paid_at }))
  );

  return {
    totalRevenue,
    outstanding,
    overdue,
    avgPayDays,
    revenueChangePct: calcRevenueChangePct(totalRevenue, prevRevenue),
    overdueCount,
    outstandingCount,
  };
}

// ---------------------------------------------------------------------------
// getMonthlyRevenue
// ---------------------------------------------------------------------------
export async function getMonthlyRevenue(
  range: DateRange
): Promise<MonthlyRevenuePoint[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { docs, lineItemsByDoc } = await fetchPaidInvoicesWithLineItems(
    supabase,
    user.id,
    range.from,
    range.to
  );

  const byMonth = new Map<string, number>();
  const currentMonthKey = format(new Date(), "yyyy-MM");

  for (const doc of docs) {
    const monthKey = format(parseISO(doc.paid_at!), "yyyy-MM");
    const items = lineItemsByDoc.get(doc.id) ?? [];
    const subtotal = calcLineItemsTotal(items);
    const net = applyDiscount(subtotal, doc.discount_type, doc.discount_value);
    byMonth.set(monthKey, (byMonth.get(monthKey) ?? 0) + net);
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, revenue]) => ({
      monthKey,
      month: format(parseISO(`${monthKey}-01`), "MMM yyyy"),
      revenue,
      isCurrent: monthKey === currentMonthKey,
    }));
}

// ---------------------------------------------------------------------------
// listFinanceInvoices
// ---------------------------------------------------------------------------
export async function listFinanceInvoices(
  range: DateRange
): Promise<DocumentListRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("documents")
    .select("*, clients:client_id(id, name), projects:project_id(id, title)")
    .eq("user_id", user.id)
    .eq("type", "invoice")
    .gte("created_at", range.from.toISOString())
    .lte("created_at", range.to.toISOString())
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []).map((row) => normalizeDocumentListRow(row));
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/finance/finance-queries.ts
git commit -m "feat(finance): getFinancialSummary, getMonthlyRevenue, listFinanceInvoices queries"
```

---

## Task 6: KPI Card Component

**Files:**
- Create: `components/features/finance/kpi-card.tsx`

- [ ] **Step 1: Create KpiCard component**

```typescript
// components/features/finance/kpi-card.tsx
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string;
  subLabel: string;
  icon: LucideIcon;
  accentColor: string;   // Tailwind border color class e.g. "border-blue-500"
  iconBg: string;        // Tailwind bg class e.g. "bg-blue-50"
  iconColor: string;     // Tailwind text color class e.g. "text-blue-600"
  subLabelColor?: string; // Tailwind text class, defaults to muted
};

export function KpiCard({
  label,
  value,
  subLabel,
  icon: Icon,
  accentColor,
  iconBg,
  iconColor,
  subLabelColor = "text-muted-foreground",
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card px-4 py-4",
        "border-t-[3px]",
        accentColor
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <div
          className={cn(
            "flex size-7 items-center justify-center rounded-md",
            iconBg
          )}
        >
          <Icon className={cn("size-4", iconColor)} />
        </div>
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="font-heading text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      <p className={cn("mt-1.5 text-xs", subLabelColor)}>{subLabel}</p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/features/finance/kpi-card.tsx
git commit -m "feat(finance): KpiCard presentational component"
```

---

## Task 7: Finance Summary Cards

**Files:**
- Create: `components/features/finance/finance-summary-cards.tsx`

- [ ] **Step 1: Create FinanceSummaryCards**

```typescript
// components/features/finance/finance-summary-cards.tsx
import { AlertTriangle, Clock, DollarSign, Timer } from "lucide-react";

import type { FinancialSummary } from "@/lib/finance/types";
import { KpiCard } from "./kpi-card";

type Props = { summary: FinancialSummary; currency: string };

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function FinanceSummaryCards({ summary, currency }: Props) {
  const {
    totalRevenue,
    outstanding,
    overdue,
    avgPayDays,
    revenueChangePct,
    overdueCount,
    outstandingCount,
  } = summary;

  const changeLabel =
    revenueChangePct === null
      ? "No previous data"
      : revenueChangePct >= 0
        ? `↑ ${revenueChangePct}% vs prev period`
        : `↓ ${Math.abs(revenueChangePct)}% vs prev period`;

  const changeColor =
    revenueChangePct === null
      ? undefined
      : revenueChangePct >= 0
        ? "text-emerald-600"
        : "text-destructive";

  const avgLabel =
    avgPayDays === null
      ? "No paid invoices yet"
      : avgPayDays <= 30
        ? `Good — industry avg 30d`
        : `Slow — industry avg 30d`;

  const avgColor =
    avgPayDays === null ? undefined : avgPayDays <= 30 ? "text-emerald-600" : "text-amber-600";

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard
        label="Total Revenue"
        value={formatMoney(totalRevenue, currency)}
        subLabel={changeLabel}
        icon={DollarSign}
        accentColor="border-t-blue-500"
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        subLabelColor={changeColor}
      />
      <KpiCard
        label="Outstanding"
        value={formatMoney(outstanding, currency)}
        subLabel={`${outstandingCount} invoice${outstandingCount !== 1 ? "s" : ""} pending`}
        icon={Clock}
        accentColor="border-t-emerald-500"
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
      />
      <KpiCard
        label="Overdue"
        value={formatMoney(overdue, currency)}
        subLabel={
          overdueCount === 0
            ? "None overdue"
            : `${overdueCount} invoice${overdueCount !== 1 ? "s" : ""} overdue`
        }
        icon={AlertTriangle}
        accentColor="border-t-amber-500"
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
        subLabelColor={overdueCount > 0 ? "text-amber-600" : undefined}
      />
      <KpiCard
        label="Avg Pay Time"
        value={avgPayDays === null ? "—" : `${avgPayDays}d`}
        subLabel={avgLabel}
        icon={Timer}
        accentColor="border-t-violet-500"
        iconBg="bg-violet-50"
        iconColor="text-violet-600"
        subLabelColor={avgColor}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/features/finance/finance-summary-cards.tsx
git commit -m "feat(finance): FinanceSummaryCards with 4 KPI cards"
```

---

## Task 8: Revenue Area Chart

**Files:**
- Create: `components/features/finance/revenue-area-chart.tsx`

- [ ] **Step 1: Create RevenueAreaChart**

```typescript
// components/features/finance/revenue-area-chart.tsx
"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";

import type { MonthlyRevenuePoint } from "@/lib/finance/types";

type Props = {
  data: MonthlyRevenuePoint[];
  currency: string;
};

function formatYAxis(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
}

// Closure so tooltip can access currency without prop threading
function makeTooltip(currency: string) {
  return function ChartTooltip({
    active,
    payload,
  }: TooltipProps<number, string>) {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload as MonthlyRevenuePoint;
    return (
      <div className="rounded-md border border-border bg-card px-3 py-2 shadow-sm">
        <p className="text-xs text-muted-foreground">{point.month}</p>
        <p className="text-sm font-semibold tabular-nums text-foreground">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
          }).format(point.revenue)}
        </p>
      </div>
    );
  };
}

export function RevenueAreaChart({ data, currency }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-sm text-muted-foreground">No revenue data for this period</p>
      </div>
    );
  }

  const ChartTooltip = makeTooltip(currency);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: string) => v.split(" ")[0]}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatYAxis}
          width={48}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={2.5}
          fill="url(#revenueGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "#3b82f6" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/features/finance/revenue-area-chart.tsx
git commit -m "feat(finance): RevenueAreaChart with gradient fill and tooltip"
```

---

## Task 9: Finance Filter Bar

**Files:**
- Create: `components/features/finance/finance-filter-bar.tsx`

- [ ] **Step 1: Create FinanceFilterBar**

```typescript
// components/features/finance/finance-filter-bar.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange as DayPickerRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  currentMonthRange,
  formatDateParam,
  lastNMonthsRange,
  yearToDateRange,
} from "@/lib/finance/date-utils";

const PRESETS = [
  { label: "This Month", getRange: currentMonthRange },
  { label: "Last 3 Months", getRange: () => lastNMonthsRange(3) },
  { label: "This Year", getRange: yearToDateRange },
] as const;

type PresetLabel = (typeof PRESETS)[number]["label"];

function getActivePreset(from: string | null, to: string | null): PresetLabel | null {
  if (!from || !to) return "This Month";
  return null;
}

export function FinanceFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const [activePreset, setActivePreset] = useState<PresetLabel | null>(
    getActivePreset(fromParam, toParam)
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [customRange, setCustomRange] = useState<DayPickerRange | undefined>();

  function applyRange(from: Date, to: Date) {
    const params = new URLSearchParams();
    params.set("from", formatDateParam(from));
    params.set("to", formatDateParam(to));
    router.push(`/finance?${params.toString()}`);
  }

  function handlePreset(preset: (typeof PRESETS)[number]) {
    setActivePreset(preset.label);
    setCustomRange(undefined);
    const { from, to } = preset.getRange();
    applyRange(from, to);
  }

  function handleCustomApply() {
    if (!customRange?.from || !customRange?.to) return;
    setActivePreset(null);
    applyRange(customRange.from, customRange.to);
    setCalendarOpen(false);
  }

  const customLabel =
    customRange?.from && customRange?.to
      ? `${format(customRange.from, "MMM d")} – ${format(customRange.to, "MMM d, yyyy")}`
      : "Custom range";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => (
        <Button
          key={preset.label}
          variant={activePreset === preset.label ? "default" : "outline"}
          size="sm"
          onClick={() => handlePreset(preset)}
        >
          {preset.label}
        </Button>
      ))}

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={activePreset === null ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
          >
            <CalendarIcon className="size-3.5" />
            {activePreset === null ? customLabel : "Custom range"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={customRange}
            onSelect={setCustomRange}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
          />
          <div className="flex justify-end gap-2 border-t border-border p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalendarOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!customRange?.from || !customRange?.to}
              onClick={handleCustomApply}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/features/finance/finance-filter-bar.tsx
git commit -m "feat(finance): FinanceFilterBar with preset tabs and date range picker"
```

---

## Task 10: Finance Invoice Table

**Files:**
- Create: `components/features/finance/finance-invoice-table.tsx`

- [ ] **Step 1: Create FinanceInvoiceTable**

```typescript
// components/features/finance/finance-invoice-table.tsx
import Link from "next/link";
import { format, parseISO } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  documentStatusLabel,
  documentStatusVariant,
} from "@/lib/documents/display";
import type { DocumentListRow } from "@/types";

type Props = { invoices: DocumentListRow[]; currency: string };

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function FinanceInvoiceTable({ invoices, currency }: Props) {
  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
        <p className="text-sm font-medium text-foreground">No invoices in this period</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Create an invoice to start tracking revenue
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          nativeButton={false}
          render={<Link href="/documents/new" />}
        >
          Create invoice
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium text-sm">
                {invoice.invoice_number ?? invoice.title}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {invoice.client?.name ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {invoice.due_date
                  ? format(parseISO(invoice.due_date), "MMM d, yyyy")
                  : "—"}
              </TableCell>
              <TableCell>
                <Badge variant={documentStatusVariant(invoice.status)}>
                  {documentStatusLabel(invoice.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums text-sm">
                {formatMoney(0, currency)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/documents/${invoice.id}`} />}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

> **Note:** The `Amount` column shows `0` as a placeholder — invoice amounts require fetching line_items per invoice which would be N+1 queries. We pass `0` in this task and fix it in Task 11 when we decide to either pass pre-computed totals or accept the limitation for now. Revisit if this is unacceptable.

- [ ] **Step 2: Commit**

```bash
git add components/features/finance/finance-invoice-table.tsx
git commit -m "feat(finance): FinanceInvoiceTable with status badges and empty state"
```

---

## Task 11: Wire Finance Page

**Files:**
- Modify: `app/(app)/finance/page.tsx`

- [ ] **Step 1: Replace finance page placeholder**

```typescript
// app/(app)/finance/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinanceFilterBar } from "@/components/features/finance/finance-filter-bar";
import { FinanceSummaryCards } from "@/components/features/finance/finance-summary-cards";
import { RevenueAreaChart } from "@/components/features/finance/revenue-area-chart";
import { FinanceInvoiceTable } from "@/components/features/finance/finance-invoice-table";
import {
  getFinancialSummary,
  getMonthlyRevenue,
  listFinanceInvoices,
} from "@/lib/finance/finance-queries";
import { parseDateRangeParams } from "@/lib/finance/date-utils";
import { getProfile } from "@/lib/profile/actions";

export const metadata: Metadata = { title: "Finance" };

type SearchParams = Promise<{ from?: string; to?: string }>;

export default async function FinancePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { from, to } = await searchParams;
  const range = parseDateRangeParams(from, to);

  const profileResult = await getProfile();
  const currency = profileResult.ok
    ? (profileResult.profile?.default_currency ?? "USD")
    : "USD";

  const [summary, monthlyRevenue, invoices] = await Promise.all([
    getFinancialSummary(range),
    getMonthlyRevenue(range),
    listFinanceInvoices(range),
  ]);

  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Finance
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Revenue Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your invoices, revenue, and payment performance.
        </p>
      </div>

      <Suspense fallback={null}>
        <FinanceFilterBar />
      </Suspense>

      <FinanceSummaryCards summary={summary} currency={currency} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueAreaChart data={monthlyRevenue} currency={currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-1">
          <FinanceInvoiceTable invoices={invoices} currency={currency} />
        </CardContent>
      </Card>
    </>
  );
}
```

- [ ] **Step 2: Fix invoice amount display**

In `FinanceInvoiceTable`, the amount column currently shows `0`. Update the component to accept pre-computed amounts from `listFinanceInvoices`. Since fetching line items per invoice in the table causes N+1 queries, instead update `listFinanceInvoices` to compute the total in a single join:

Update `lib/finance/finance-queries.ts` — replace the `listFinanceInvoices` function:

```typescript
export async function listFinanceInvoices(
  range: DateRange
): Promise<(DocumentListRow & { computedTotal: number })[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: docs } = await supabase
    .from("documents")
    .select("*, clients:client_id(id, name), projects:project_id(id, title)")
    .eq("user_id", user.id)
    .eq("type", "invoice")
    .gte("created_at", range.from.toISOString())
    .lte("created_at", range.to.toISOString())
    .order("created_at", { ascending: false })
    .limit(20);

  if (!docs || docs.length === 0) return [];

  const ids = docs.map((d) => d.id);
  const { data: lineItems } = await supabase
    .from("line_items")
    .select("document_id, quantity, unit_price")
    .in("document_id", ids);

  const liByDoc = new Map<string, typeof lineItems>();
  for (const li of lineItems ?? []) {
    const existing = liByDoc.get(li.document_id) ?? [];
    existing.push(li);
    liByDoc.set(li.document_id, existing);
  }

  return docs.map((row) => {
    const normalized = normalizeDocumentListRow(row);
    const items = liByDoc.get(row.id) ?? [];
    const subtotal = calcLineItemsTotal(items);
    const computedTotal = applyDiscount(subtotal, row.discount_type, row.discount_value);
    return { ...normalized, computedTotal };
  });
}
```

Update `FinanceInvoiceTable` props type and amount cell:

```typescript
// In finance-invoice-table.tsx
type Props = { invoices: (DocumentListRow & { computedTotal: number })[]; currency: string };

// In the amount cell:
<TableCell className="text-right font-medium tabular-nums text-sm">
  {formatMoney(invoice.computedTotal, currency)}
</TableCell>
```

- [ ] **Step 3: Run build**

```bash
npm run build
```
Expected: Build succeeds with no TypeScript errors

- [ ] **Step 4: Run tests**

```bash
npm run test
```
Expected: All tests pass (including new date-utils and revenue-calc tests)

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/finance/page.tsx lib/finance/finance-queries.ts components/features/finance/finance-invoice-table.tsx
git commit -m "feat(finance): wire finance page with KPI cards, area chart, and invoice table"
```

---

## Task 12: Smoke Test + PR

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Smoke test checklist**

Navigate to `http://localhost:3000/finance` and verify:

- [ ] Page loads without error
- [ ] KPI cards show with correct colors and icons (blue/green/amber/violet)
- [ ] "This Month" preset is active by default
- [ ] Clicking "Last 3 Months" updates URL params and refetches data
- [ ] Clicking "This Year" updates URL params and refetches data
- [ ] "Custom range" picker opens calendar, selecting a range and clicking Apply updates data
- [ ] Area chart renders (or shows empty state if no data)
- [ ] Chart tooltip shows on hover
- [ ] Invoice table shows recent invoices with correct status badges
- [ ] Amount column shows computed totals (not 0)
- [ ] "View" button navigates to correct document
- [ ] Empty state shows when no invoices in range
- [ ] `npm run build` passes clean

- [ ] **Step 3: Push and open PR**

```bash
git push -u origin feat/financial-dashboard
```

Open PR on GitHub: `feat/financial-dashboard` → `dev`

Title: `feat(finance): revenue analytics dashboard`

Body:
```
## Summary
- Adds /finance page with KPI cards (revenue, outstanding, overdue, avg pay time)
- Monthly revenue area chart with gradient fill (Recharts)
- Invoice table with status badges and computed totals
- Preset time filters (This Month / Last 3 Months / This Year) + custom date range picker
- All data from existing documents + line_items tables — no new migrations
- Pure utility functions tested with Vitest

## Test plan
- [ ] Navigate to /finance — page loads with real data
- [ ] All 3 preset filters work and update URL
- [ ] Custom date picker selects range and applies
- [ ] Area chart renders with tooltip
- [ ] Invoice table shows amounts and status badges correctly
- [ ] npm run test passes
- [ ] npm run build passes
```
