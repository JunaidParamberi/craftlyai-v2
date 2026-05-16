# Finance Dashboard Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `/finance` with correct currency symbols, pagination, sort, search, KPI drill-down, CSV export, and an invoice aging report — all driven by URL searchParams.

**Architecture:** All filter state (date range, page, sort, search, status) lives in URL searchParams so every view is bookmarkable. The RSC `page.tsx` reads params, passes them to server queries; client components update params via `router.push`. The cached fetcher retrieves all matching invoices (no page limit); sort + pagination are applied in-memory after the cache hit, enabling any sort order without extra round-trips.

**Tech Stack:** Next.js 15 App Router, Supabase JS v2, shadcn/ui Button, Tailwind CSS 4, Recharts, Vitest, date-fns

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `lib/finance/types.ts` | Add `SortKey`, `StatusFilter`, `InvoiceFilters`, `PaginatedInvoices`, `AgingBucket`, `AgingReport` |
| Create | `lib/finance/filter-utils.ts` | Pure param-parsing fns: `parsePageParam`, `parseSortParam`, `parseSearchParam`, `parseStatusParam` |
| Create | `lib/finance/filter-utils.test.ts` | Vitest for all four parse fns |
| Modify | `lib/finance/finance-queries.ts` | `listFinanceInvoices` (pagination + sort + search + status), add `exportFinanceInvoices`, add `getAgingReport` |
| Modify | `components/features/finance/revenue-area-chart.tsx` | Fix Y-axis hardcoded `$` symbol |
| Modify | `components/features/finance/finance-filter-bar.tsx` | Add debounced search input + status filter pills |
| Modify | `components/features/finance/finance-invoice-table.tsx` | Sortable headers, pagination controls, CSV export button |
| Modify | `components/features/finance/kpi-card.tsx` | Add `href?` + `isActive?` props for drill-down |
| Modify | `components/features/finance/finance-summary-cards.tsx` | Wire `href` + `isActive` to Overdue + Outstanding cards |
| Create | `components/features/finance/invoice-aging-report.tsx` | Horizontal bucket bars, 4 overdue buckets |
| Modify | `app/(app)/finance/page.tsx` | Read all new searchParams, pass `InvoiceFilters` to queries, render `InvoiceAgingReport` |

---

## Task 1: Create branch + extend types

**Files:**
- Modify: `lib/finance/types.ts`

- [ ] **Step 1: Create the feature branch**

```bash
git checkout dev && git pull origin dev
git checkout -b feat/finance-dashboard-upgrade
```

- [ ] **Step 2: Add new types to `lib/finance/types.ts`**

Replace the entire file with:

```ts
import type { DocumentStatus } from "@/types";
import type { DocumentListRow } from "@/types";

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
  month: string;
  monthKey: string;
  revenue: number;
  isCurrent: boolean;
};

export type DateRange = {
  from: Date;
  to: Date;
};

export type SortKey =
  | "date_asc"
  | "date_desc"
  | "amount_asc"
  | "amount_desc"
  | "client_asc"
  | "client_desc"
  | "status_asc"
  | "status_desc";

export type StatusFilter = DocumentStatus | "overdue" | "outstanding";

export type InvoiceFilters = {
  dateRange: DateRange;
  page: number;
  pageSize: number;
  sort: SortKey;
  search?: string;
  status?: StatusFilter;
};

export type FinanceInvoiceRow = DocumentListRow & { computedTotal: number };

export type PaginatedInvoices = {
  invoices: FinanceInvoiceRow[];
  total: number;
  pageCount: number;
};

export type AgingBucket = {
  label: string;
  count: number;
  total: number;
};

export type AgingReport = {
  current: AgingBucket;
  overdue1to30: AgingBucket;
  overdue31to60: AgingBucket;
  overdue60plus: AgingBucket;
  grandTotal: number;
};
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to types.ts (there may be pre-existing errors from `finance-queries.ts` referencing the old return type — those will be fixed in Task 4).

- [ ] **Step 4: Commit**

```bash
git add lib/finance/types.ts
git commit -m "feat(finance): add SortKey, InvoiceFilters, PaginatedInvoices, AgingReport types"
```

---

## Task 2: `filter-utils.ts` + tests

**Files:**
- Create: `lib/finance/filter-utils.ts`
- Create: `lib/finance/filter-utils.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `lib/finance/filter-utils.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  parsePageParam,
  parseSortParam,
  parseSearchParam,
  parseStatusParam,
} from "./filter-utils";

describe("parsePageParam", () => {
  it("returns 1 by default", () => expect(parsePageParam(undefined)).toBe(1));
  it("parses valid page number", () => expect(parsePageParam("3")).toBe(3));
  it("clamps zero to 1", () => expect(parsePageParam("0")).toBe(1));
  it("clamps negative to 1", () => expect(parsePageParam("-5")).toBe(1));
  it("falls back to 1 on NaN", () => expect(parsePageParam("abc")).toBe(1));
});

describe("parseSortParam", () => {
  it("returns date_desc by default", () => expect(parseSortParam(undefined)).toBe("date_desc"));
  it("accepts date_asc", () => expect(parseSortParam("date_asc")).toBe("date_asc"));
  it("accepts amount_desc", () => expect(parseSortParam("amount_desc")).toBe("amount_desc"));
  it("accepts client_asc", () => expect(parseSortParam("client_asc")).toBe("client_asc"));
  it("accepts status_desc", () => expect(parseSortParam("status_desc")).toBe("status_desc"));
  it("rejects unknown value", () => expect(parseSortParam("random_thing")).toBe("date_desc"));
});

describe("parseSearchParam", () => {
  it("returns undefined when absent", () => expect(parseSearchParam(undefined)).toBeUndefined());
  it("returns undefined for empty string", () => expect(parseSearchParam("")).toBeUndefined());
  it("returns undefined for whitespace only", () => expect(parseSearchParam("   ")).toBeUndefined());
  it("trims and returns search string", () => expect(parseSearchParam("  foo  ")).toBe("foo"));
  it("returns value unchanged when no whitespace", () => expect(parseSearchParam("INV-001")).toBe("INV-001"));
});

describe("parseStatusParam", () => {
  it("returns undefined when absent", () => expect(parseStatusParam(undefined)).toBeUndefined());
  it("returns undefined for empty string", () => expect(parseStatusParam("")).toBeUndefined());
  it("accepts paid", () => expect(parseStatusParam("paid")).toBe("paid"));
  it("accepts sent", () => expect(parseStatusParam("sent")).toBe("sent"));
  it("accepts overdue", () => expect(parseStatusParam("overdue")).toBe("overdue"));
  it("accepts outstanding", () => expect(parseStatusParam("outstanding")).toBe("outstanding"));
  it("rejects unknown value", () => expect(parseStatusParam("garbage")).toBeUndefined());
});
```

- [ ] **Step 2: Run — expect FAIL (module not found)**

```bash
npm run test -- lib/finance/filter-utils 2>&1 | tail -10
```

Expected: `Cannot find module './filter-utils'`

- [ ] **Step 3: Implement `lib/finance/filter-utils.ts`**

```ts
import type { DocumentStatus } from "@/types";
import type { SortKey, StatusFilter } from "./types";

const VALID_SORTS: SortKey[] = [
  "date_asc",
  "date_desc",
  "amount_asc",
  "amount_desc",
  "client_asc",
  "client_desc",
  "status_asc",
  "status_desc",
];

const VALID_STATUSES: (DocumentStatus | "overdue" | "outstanding")[] = [
  "draft",
  "sent",
  "viewed",
  "signed",
  "paid",
  "partially_paid",
  "written_off",
  "archived",
  "approved",
  "declined",
  "overdue",
  "outstanding",
];

export function parsePageParam(s: string | undefined): number {
  const n = parseInt(s ?? "1", 10);
  return isNaN(n) || n < 1 ? 1 : n;
}

export function parseSortParam(s: string | undefined): SortKey {
  if (s && (VALID_SORTS as string[]).includes(s)) return s as SortKey;
  return "date_desc";
}

export function parseSearchParam(s: string | undefined): string | undefined {
  const trimmed = s?.trim();
  return trimmed || undefined;
}

export function parseStatusParam(s: string | undefined): StatusFilter | undefined {
  if (s && (VALID_STATUSES as string[]).includes(s)) return s as StatusFilter;
  return undefined;
}
```

- [ ] **Step 4: Run tests — expect all pass**

```bash
npm run test -- lib/finance/filter-utils 2>&1 | tail -10
```

Expected: `Tests 18 passed (18)`

- [ ] **Step 5: Commit**

```bash
git add lib/finance/filter-utils.ts lib/finance/filter-utils.test.ts
git commit -m "feat(finance): add filter-utils with parsePageParam/Sort/Search/Status + tests"
```

---

## Task 3: Fix Y-axis currency symbol

**Files:**
- Modify: `components/features/finance/revenue-area-chart.tsx`

- [ ] **Step 1: Replace `formatYAxis` with a currency-aware version**

In `revenue-area-chart.tsx`, remove the existing `formatYAxis` function and replace with:

```ts
function getCurrencySymbol(currency: string): string {
  return (
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? currency
  );
}

function makeYAxisFormatter(currency: string): (value: number) => string {
  const symbol = getCurrencySymbol(currency);
  return (value: number) => {
    if (value >= 1000) return `${symbol}${(value / 1000).toFixed(0)}k`;
    return `${symbol}${value}`;
  };
}
```

- [ ] **Step 2: Wire the formatter into the component**

In `RevenueAreaChart`, add before the `return`:

```tsx
const formatYAxis = makeYAxisFormatter(currency);
```

Remove `const fewPoints = chartData.length <= 3;` and add it back right after (keep it). Then in the `<YAxis>` element, it already has `tickFormatter={formatYAxis}` — this now calls the new closure. No other JSX change needed.

- [ ] **Step 3: Run full tests**

```bash
npm run test 2>&1 | tail -5
```

Expected: all tests pass (no tests cover this component directly — the fix is visual).

- [ ] **Step 4: Commit**

```bash
git add components/features/finance/revenue-area-chart.tsx
git commit -m "fix(finance): Y-axis uses correct currency symbol instead of hardcoded \$"
```

---

## Task 4: Update `finance-queries.ts`

**Files:**
- Modify: `lib/finance/finance-queries.ts`

This is the largest task. Replace `listFinanceInvoices` with a paginated version, add `exportFinanceInvoices` and `getAgingReport`.

- [ ] **Step 1: Add imports at the top of `finance-queries.ts`**

Add to the existing imports block (keep all existing imports):

```ts
import type {
  DateRange,
  FinancialSummary,
  MonthlyRevenuePoint,
  SortKey,
  InvoiceFilters,
  FinanceInvoiceRow,
  PaginatedInvoices,
  AgingBucket,
  AgingReport,
} from "./types";
```

Remove the old `import type { DateRange, FinancialSummary, MonthlyRevenuePoint } from "./types";` line and replace with the block above.

- [ ] **Step 2: Add `sortInvoices` helper after the `coerceDiscountType` function**

Insert after the `coerceDiscountType` function (around line 22), before `import { previousPeriodRange }`:

```ts
function sortInvoices(invoices: FinanceInvoiceRow[], sort: SortKey): FinanceInvoiceRow[] {
  const underscoreIdx = sort.lastIndexOf("_");
  const field = sort.slice(0, underscoreIdx);
  const dir = sort.slice(underscoreIdx + 1) as "asc" | "desc";
  const asc = dir === "asc";

  return [...invoices].sort((a, b) => {
    switch (field) {
      case "date":
        return asc
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "amount":
        return asc ? a.computedTotal - b.computedTotal : b.computedTotal - a.computedTotal;
      case "client":
        return asc
          ? (a.client?.name ?? "").localeCompare(b.client?.name ?? "")
          : (b.client?.name ?? "").localeCompare(a.client?.name ?? "");
      case "status":
        return asc ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
      default:
        return 0;
    }
  });
}
```

Note: `lastIndexOf("_")` handles `"client_asc"` → field=`"client"`, dir=`"asc"` correctly. It also handles `"date_desc"` → field=`"date"`, dir=`"desc"`.

- [ ] **Step 3: Add a type alias for line item shape (reduce repetition)**

After the `sortInvoices` function:

```ts
type LineItemLike = {
  quantity: number | string;
  unit_price: number | string;
  tax_rate: number | string | null;
};
```

(Remove the inline `as { quantity: number | string; ... }[]` casts throughout the file; replace with `as LineItemLike[]`.)

- [ ] **Step 4: Replace `_cachedListFinanceInvoices` and `listFinanceInvoices`**

Delete the existing `_cachedListFinanceInvoices` and `listFinanceInvoices` functions entirely. Replace with:

```ts
// ---------------------------------------------------------------------------
// Internal: fetch all invoices matching date + status + search (no pagination)
// Sort + pagination applied in-memory after cache hit.
// ---------------------------------------------------------------------------
const _cachedFetchFilteredInvoices = unstable_cache(
  async (
    userId: string,
    fromIso: string,
    toIso: string,
    statusKey: string,
    search: string
  ): Promise<FinanceInvoiceRow[]> => {
    const { supabase } = await getServerContext();
    const from = new Date(fromIso);
    const to = new Date(toIso);
    const now = new Date().toISOString();

    let query = supabase
      .from("documents")
      .select(
        "*, clients:client_id(id, name), projects:project_id(id, title), line_items(quantity, unit_price, tax_rate)"
      )
      .eq("user_id", userId)
      .eq("type", "invoice")
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString())
      .order("created_at", { ascending: false });

    if (statusKey === "overdue") {
      query = query.in("status", ["sent", "viewed"]).lt("due_date", now);
    } else if (statusKey === "outstanding") {
      query = query.in("status", ["sent", "viewed"]);
    } else if (statusKey) {
      query = query.eq("status", statusKey);
    }

    if (search) {
      const { data: matchingClients } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", userId)
        .ilike("name", `%${search}%`);
      const clientIds = (matchingClients ?? []).map((c) => c.id);

      if (clientIds.length > 0) {
        query = query.or(
          `invoice_number.ilike.%${search}%,client_id.in.(${clientIds.join(",")})`
        );
      } else {
        query = query.ilike("invoice_number", `%${search}%`);
      }
    }

    const { data: docs, error } = await query;
    if (error) console.error("[finance-queries] fetch invoices error:", error.message);

    return (docs ?? []).map((row) => {
      const normalized = normalizeDocumentListRow(row);
      const items = (row.line_items ?? []) as LineItemLike[];
      const subtotal = calcLineItemsTotal(items);
      const tax = calcTaxTotal(items);
      const computedTotal =
        applyDiscount(subtotal, coerceDiscountType(row.discount_type), row.discount_value ?? 0) +
        tax;
      return { ...normalized, computedTotal };
    });
  },
  ["finance-invoices"],
  { revalidate: 60, tags: ["finance"] }
);

export async function listFinanceInvoices(filters: InvoiceFilters): Promise<PaginatedInvoices> {
  const { user } = await getServerContext();
  if (!user) return { invoices: [], total: 0, pageCount: 0 };

  const all = await _cachedFetchFilteredInvoices(
    user.id,
    filters.dateRange.from.toISOString(),
    filters.dateRange.to.toISOString(),
    filters.status ?? "",
    filters.search ?? ""
  );

  const sorted = sortInvoices(all, filters.sort);
  const total = sorted.length;
  const pageCount = Math.ceil(total / filters.pageSize);
  const start = (filters.page - 1) * filters.pageSize;
  const invoices = sorted.slice(start, start + filters.pageSize);

  return { invoices, total, pageCount };
}

// ---------------------------------------------------------------------------
// exportFinanceInvoices — all matching rows for CSV download (no page limit)
// ---------------------------------------------------------------------------
export async function exportFinanceInvoices(
  filters: Omit<InvoiceFilters, "page">
): Promise<FinanceInvoiceRow[]> {
  const { user } = await getServerContext();
  if (!user) return [];

  const all = await _cachedFetchFilteredInvoices(
    user.id,
    filters.dateRange.from.toISOString(),
    filters.dateRange.to.toISOString(),
    filters.status ?? "",
    filters.search ?? ""
  );

  return sortInvoices(all, filters.sort);
}
```

- [ ] **Step 5: Add `getAgingReport` at the bottom of the file**

```ts
// ---------------------------------------------------------------------------
// getAgingReport — overdue buckets for all unpaid invoices (ignores date filter)
// ---------------------------------------------------------------------------
const _cachedGetAgingReport = unstable_cache(
  async (userId: string): Promise<AgingReport> => {
    const { supabase } = await getServerContext();
    const now = new Date();

    const { data: docs, error } = await supabase
      .from("documents")
      .select("id, due_date, discount_value, discount_type, status, line_items(quantity, unit_price, tax_rate)")
      .eq("user_id", userId)
      .eq("type", "invoice")
      .in("status", ["sent", "viewed"]);

    if (error) console.error("[finance-queries] aging report error:", error.message);

    const empty = (label: string): AgingBucket => ({ label, count: 0, total: 0 });

    const report = {
      current: empty("Current (not yet due)"),
      overdue1to30: empty("1–30 days overdue"),
      overdue31to60: empty("31–60 days overdue"),
      overdue60plus: empty("60+ days overdue"),
      grandTotal: 0,
    };

    for (const doc of docs ?? []) {
      const items = (doc.line_items ?? []) as LineItemLike[];
      const subtotal = calcLineItemsTotal(items);
      const tax = calcTaxTotal(items);
      const amount =
        applyDiscount(subtotal, coerceDiscountType(doc.discount_type), doc.discount_value ?? 0) +
        tax;

      report.grandTotal += amount;

      if (!doc.due_date) {
        report.current.count++;
        report.current.total += amount;
        continue;
      }

      const daysOverdue = Math.floor(
        (now.getTime() - new Date(doc.due_date).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysOverdue <= 0) {
        report.current.count++;
        report.current.total += amount;
      } else if (daysOverdue <= 30) {
        report.overdue1to30.count++;
        report.overdue1to30.total += amount;
      } else if (daysOverdue <= 60) {
        report.overdue31to60.count++;
        report.overdue31to60.total += amount;
      } else {
        report.overdue60plus.count++;
        report.overdue60plus.total += amount;
      }
    }

    return report;
  },
  ["finance-aging"],
  { revalidate: 60, tags: ["finance"] }
);

export async function getAgingReport(): Promise<AgingReport> {
  const { user } = await getServerContext();
  if (!user)
    return {
      current: { label: "Current (not yet due)", count: 0, total: 0 },
      overdue1to30: { label: "1–30 days overdue", count: 0, total: 0 },
      overdue31to60: { label: "31–60 days overdue", count: 0, total: 0 },
      overdue60plus: { label: "60+ days overdue", count: 0, total: 0 },
      grandTotal: 0,
    };
  return _cachedGetAgingReport(user.id);
}
```

- [ ] **Step 6: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "finance" | head -20
```

Expected: no errors in finance files.

- [ ] **Step 7: Run tests**

```bash
npm run test 2>&1 | tail -5
```

Expected: all existing tests pass.

- [ ] **Step 8: Commit**

```bash
git add lib/finance/finance-queries.ts
git commit -m "feat(finance): paginated listFinanceInvoices, exportFinanceInvoices, getAgingReport"
```

---

## Task 5: Update `finance-filter-bar.tsx`

**Files:**
- Modify: `components/features/finance/finance-filter-bar.tsx`

Add a debounced search input and status filter pills below the existing date preset row.

- [ ] **Step 1: Replace `finance-filter-bar.tsx` entirely**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, Search, X } from "lucide-react";
import type { DateRange as DayPickerRange } from "react-day-picker";

import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  currentMonthRange,
  formatDateParam,
  lastNMonthsRange,
  yearToDateRange,
} from "@/lib/finance/date-utils";

const PRESETS = [
  { label: "This Month", getRange: currentMonthRange },
  { label: "Last 3M", getRange: () => lastNMonthsRange(3) },
  { label: "This Year", getRange: yearToDateRange },
] as const;

type PresetLabel = (typeof PRESETS)[number]["label"];

const STATUS_PILLS = [
  { label: "All", value: "" },
  { label: "Paid", value: "paid" },
  { label: "Outstanding", value: "outstanding" },
  { label: "Overdue", value: "overdue" },
  { label: "Draft", value: "draft" },
] as const;

export function FinanceFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const statusParam = searchParams.get("status") ?? "";
  const searchParam = searchParams.get("search") ?? "";

  const [activePreset, setActivePreset] = useState<PresetLabel | null>(
    !fromParam && !toParam ? "This Month" : null
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [customRange, setCustomRange] = useState<DayPickerRange | undefined>();
  const [searchValue, setSearchValue] = useState(searchParam);

  // Sync searchValue when URL param changes (e.g. browser back/forward)
  useEffect(() => {
    setSearchValue(searchParam);
  }, [searchParam]);

  // Debounce search → URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue.trim()) {
        params.set("search", searchValue.trim());
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.push(`/finance?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  function applyRange(from: Date, to: Date) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", formatDateParam(from));
    params.set("to", formatDateParam(to));
    params.delete("page");
    router.push(`/finance?${params.toString()}`);
  }

  function handlePreset(preset: (typeof PRESETS)[number]) {
    setActivePreset(preset.label);
    setCustomRange(undefined);
    const { from, to } = preset.getRange();
    applyRange(from, to);
  }

  function handleStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.delete("page");
    router.push(`/finance?${params.toString()}`);
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
      : activePreset === null && fromParam && toParam
        ? `${format(new Date(fromParam), "MMM d")} – ${format(new Date(toParam), "MMM d, yyyy")}`
        : "Custom";

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: date presets + custom picker */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-full border border-border bg-muted/40 p-0.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePreset(preset)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                activePreset === preset.label
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger
            className={cn(
              buttonVariants({
                variant: activePreset === null ? "default" : "outline",
                size: "sm",
              }),
              "h-8 gap-1.5 rounded-full text-xs"
            )}
          >
            <CalendarIcon className="size-3" />
            {customLabel}
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
              <Button variant="outline" size="sm" onClick={() => setCalendarOpen(false)}>
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

      {/* Row 2: status pills + search */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {STATUS_PILLS.map((pill) => (
            <button
              key={pill.label}
              onClick={() => handleStatus(pill.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                statusParam === pill.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search invoices…"
            className="h-8 w-56 rounded-full pl-8 pr-8 text-xs"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run tests**

```bash
npm run test 2>&1 | tail -5
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add components/features/finance/finance-filter-bar.tsx
git commit -m "feat(finance): add search input and status filter pills to filter bar"
```

---

## Task 6: Update `finance-invoice-table.tsx`

**Files:**
- Modify: `components/features/finance/finance-invoice-table.tsx`

Add sortable column headers, pagination controls, and CSV export button.

- [ ] **Step 1: Replace `finance-invoice-table.tsx` entirely**

```tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parseISO, isPast } from "date-fns";
import { ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";

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
import { cn } from "@/lib/utils";
import {
  documentStatusLabel,
  documentStatusVariant,
} from "@/lib/documents/display";
import type { FinanceInvoiceRow, InvoiceFilters, SortKey } from "@/lib/finance/types";
import { exportFinanceInvoices } from "@/lib/finance/finance-queries";

type Props = {
  invoices: FinanceInvoiceRow[];
  total: number;
  pageCount: number;
  currentPage: number;
  currentSort: SortKey;
  currency: string;
  filters: Omit<InvoiceFilters, "page">;
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function buildCsv(invoices: FinanceInvoiceRow[]): string {
  const headers = ["Invoice #", "Client", "Issue Date", "Due Date", "Status", "Amount"];
  const rows = invoices.map((inv) => [
    inv.invoice_number ?? inv.title,
    inv.client?.name ?? "",
    format(parseISO(inv.created_at), "yyyy-MM-dd"),
    inv.due_date ? format(parseISO(inv.due_date), "yyyy-MM-dd") : "",
    inv.status,
    inv.computedTotal.toFixed(2),
  ]);
  return [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function downloadBlob(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type SortableHeaderProps = {
  label: string;
  field: string;
  currentSort: SortKey;
  className?: string;
};

function SortableHeader({ label, field, currentSort, className }: SortableHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentField, currentDir] = (() => {
    const idx = currentSort.lastIndexOf("_");
    return [currentSort.slice(0, idx), currentSort.slice(idx + 1)];
  })();

  const isActive = currentField === field;
  const nextDir = isActive && currentDir === "asc" ? "desc" : "asc";
  const nextSort: SortKey = `${field}_${nextDir}` as SortKey;

  function handleSort() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", nextSort);
    params.delete("page");
    router.push(`/finance?${params.toString()}`);
  }

  return (
    <TableHead className={cn("cursor-pointer select-none", className)} onClick={handleSort}>
      <span className="flex items-center gap-1">
        {label}
        {isActive ? (
          currentDir === "asc" ? (
            <ArrowUp className="size-3" />
          ) : (
            <ArrowDown className="size-3" />
          )
        ) : (
          <ArrowUpDown className="size-3 text-muted-foreground/40" />
        )}
      </span>
    </TableHead>
  );
}

function Pagination({
  currentPage,
  pageCount,
}: {
  currentPage: number;
  pageCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (pageCount <= 1) return null;

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/finance?${params.toString()}`);
  }

  const pages: (number | "…")[] = [];
  if (pageCount <= 7) {
    for (let i = 1; i <= pageCount; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(pageCount - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < pageCount - 2) pages.push("…");
    pages.push(pageCount);
  }

  return (
    <div className="flex items-center justify-center gap-1 border-t border-border/40 px-6 py-3">
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs"
        disabled={currentPage <= 1}
        onClick={() => goTo(currentPage - 1)}
      >
        ← Prev
      </Button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === currentPage ? "default" : "outline"}
            size="sm"
            className="h-7 w-7 p-0 text-xs"
            onClick={() => goTo(p)}
          >
            {p}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs"
        disabled={currentPage >= pageCount}
        onClick={() => goTo(currentPage + 1)}
      >
        Next →
      </Button>
    </div>
  );
}

export function FinanceInvoiceTable({
  invoices,
  total,
  pageCount,
  currentPage,
  currentSort,
  currency,
  filters,
}: Props) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const all = await exportFinanceInvoices(filters);
      const csv = buildCsv(all);
      downloadBlob(csv, `invoices-${format(new Date(), "yyyy-MM-dd")}.csv`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      {/* Table header with count + export */}
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <span className="text-base font-semibold">
          Invoices
          {total > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({total})</span>
          )}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={handleExport}
          disabled={exporting || invoices.length === 0}
        >
          <Download className="size-3" />
          {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-b-lg py-14 text-center">
          <p className="text-sm font-medium text-foreground">No invoices in this period</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create an invoice to start tracking revenue
          </p>
          <Link href="/documents/new">
            <Button variant="outline" size="sm" className="mt-4">
              New invoice
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/60">
                <SortableHeader
                  label="Invoice"
                  field="date"
                  currentSort={currentSort}
                  className="w-[220px] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                />
                <SortableHeader
                  label="Client"
                  field="client"
                  currentSort={currentSort}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                />
                <SortableHeader
                  label="Due"
                  field="date"
                  currentSort={currentSort}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                />
                <SortableHeader
                  label="Status"
                  field="status"
                  currentSort={currentSort}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                />
                <SortableHeader
                  label="Amount"
                  field="amount"
                  currentSort={currentSort}
                  className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                />
                <TableHead className="w-16 px-4 py-3" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const isOverdue =
                  invoice.status !== "paid" &&
                  invoice.due_date &&
                  isPast(parseISO(invoice.due_date));

                return (
                  <TableRow
                    key={invoice.id}
                    className="group border-border/40 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="px-6 py-4">
                      <span className="text-sm font-semibold text-foreground">
                        {invoice.invoice_number ?? invoice.title}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <span className="text-sm text-muted-foreground">
                        {invoice.client?.name ?? <span className="text-border">—</span>}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <span
                        className={cn(
                          "text-sm",
                          isOverdue ? "font-medium text-amber-500" : "text-muted-foreground"
                        )}
                      >
                        {invoice.due_date ? (
                          format(parseISO(invoice.due_date), "MMM d, yyyy")
                        ) : (
                          <span className="text-border">—</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <Badge
                        variant={documentStatusVariant(invoice.status)}
                        className="text-[11px] font-medium"
                      >
                        {documentStatusLabel(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <span
                        className={cn(
                          "font-mono text-sm tabular-nums",
                          invoice.computedTotal === 0
                            ? "text-muted-foreground"
                            : "font-semibold text-foreground"
                        )}
                      >
                        {formatMoney(invoice.computedTotal, currency)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      <Link href={`/documents/${invoice.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                        >
                          View →
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Footer: showing X–Y of Z + pagination */}
          <div className="flex items-center justify-between border-t border-border/40 px-6 py-3">
            <span className="text-xs text-muted-foreground">
              Showing{" "}
              {Math.min((currentPage - 1) * 20 + 1, total)}–
              {Math.min(currentPage * 20, total)} of {total}
            </span>
            <Pagination currentPage={currentPage} pageCount={pageCount} />
          </div>
        </>
      )}
    </div>
  );
}
```

Note: add `import { useState } from "react";` at the top — the component uses `useState` for `exporting`.

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "finance-invoice-table" | head -10
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/features/finance/finance-invoice-table.tsx
git commit -m "feat(finance): sortable columns, pagination controls, CSV export button"
```

---

## Task 7: Make KPI cards interactive

**Files:**
- Modify: `components/features/finance/kpi-card.tsx`
- Modify: `components/features/finance/finance-summary-cards.tsx`

- [ ] **Step 1: Update `kpi-card.tsx`**

```tsx
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string;
  subLabel: string;
  icon: LucideIcon;
  accentColor: string;
  iconBg: string;
  iconColor: string;
  subLabelColor?: string;
  index?: number;
  href?: string;
  isActive?: boolean;
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
  index = 0,
  href,
  isActive,
}: KpiCardProps) {
  const card = (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-card px-5 py-4",
        "border-l-[3px]",
        accentColor,
        "opacity-0 animate-[fadeUp_0.4s_ease_forwards]",
        href && "cursor-pointer transition-shadow hover:shadow-md",
        isActive && "ring-2 ring-primary ring-offset-1"
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </span>
        <div className={cn("flex size-7 items-center justify-center rounded-md", iconBg)}>
          <Icon className={cn("size-3.5", iconColor)} />
        </div>
      </div>
      <p className="font-heading text-[1.6rem] font-semibold tabular-nums tracking-tight text-foreground leading-none">
        {value}
      </p>
      <p className={cn("mt-2 text-[11px]", subLabelColor)}>{subLabel}</p>
    </div>
  );

  if (href) return <Link href={href} className="block">{card}</Link>;
  return card;
}
```

- [ ] **Step 2: Update `finance-summary-cards.tsx`**

Add `dateParams` and `activeStatus` props:

```tsx
import { AlertTriangle, Clock, DollarSign, Timer } from "lucide-react";

import type { FinancialSummary } from "@/lib/finance/types";
import { KpiCard } from "./kpi-card";

type Props = {
  summary: FinancialSummary;
  currency: string;
  dateParams: string;
  activeStatus?: string;
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function FinanceSummaryCards({ summary, currency, dateParams, activeStatus }: Props) {
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
      ? "No prior period data"
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
        ? `${avgPayDays}d — on track`
        : `${avgPayDays}d — above avg`;

  const avgColor =
    avgPayDays === null
      ? undefined
      : avgPayDays <= 30
        ? "text-emerald-600"
        : "text-amber-600";

  const sep = dateParams ? `${dateParams}&` : "";

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard
        index={0}
        label="Total Revenue"
        value={formatMoney(totalRevenue, currency)}
        subLabel={changeLabel}
        icon={DollarSign}
        accentColor="border-l-blue-500"
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        subLabelColor={changeColor}
      />
      <KpiCard
        index={1}
        label="Outstanding"
        value={formatMoney(outstanding, currency)}
        subLabel={`${outstandingCount} invoice${outstandingCount !== 1 ? "s" : ""} pending`}
        icon={Clock}
        accentColor="border-l-emerald-500"
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        href={`/finance?${sep}status=outstanding`}
        isActive={activeStatus === "outstanding"}
      />
      <KpiCard
        index={2}
        label="Overdue"
        value={formatMoney(overdue, currency)}
        subLabel={
          overdueCount === 0
            ? "None overdue"
            : `${overdueCount} invoice${overdueCount !== 1 ? "s" : ""} overdue`
        }
        icon={AlertTriangle}
        accentColor="border-l-amber-500"
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
        subLabelColor={overdueCount > 0 ? "text-amber-600" : undefined}
        href={`/finance?${sep}status=overdue`}
        isActive={activeStatus === "overdue"}
      />
      <KpiCard
        index={3}
        label="Avg Pay Time"
        value={avgPayDays === null ? "—" : `${avgPayDays}d`}
        subLabel={avgLabel}
        icon={Timer}
        accentColor="border-l-violet-500"
        iconBg="bg-violet-50"
        iconColor="text-violet-600"
        subLabelColor={avgColor}
      />
    </div>
  );
}
```

- [ ] **Step 3: Run tests**

```bash
npm run test 2>&1 | tail -5
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add components/features/finance/kpi-card.tsx components/features/finance/finance-summary-cards.tsx
git commit -m "feat(finance): KPI cards link to status filter; Overdue + Outstanding are clickable drill-downs"
```

---

## Task 8: Invoice aging report component

**Files:**
- Create: `components/features/finance/invoice-aging-report.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AgingReport } from "@/lib/finance/types";

type Props = { report: AgingReport; currency: string };

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const BUCKET_STYLES = [
  { key: "current" as const, color: "bg-emerald-500" },
  { key: "overdue1to30" as const, color: "bg-amber-400" },
  { key: "overdue31to60" as const, color: "bg-orange-500" },
  { key: "overdue60plus" as const, color: "bg-red-500" },
];

export function InvoiceAgingReport({ report, currency }: Props) {
  const buckets = BUCKET_STYLES.map(({ key, color }) => ({
    ...report[key],
    color,
  }));

  const maxBucketTotal = Math.max(...buckets.map((b) => b.total), 1);
  const hasOverdue =
    report.overdue1to30.count > 0 ||
    report.overdue31to60.count > 0 ||
    report.overdue60plus.count > 0;

  return (
    <Card>
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="text-base">Invoice Aging</CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        {!hasOverdue && report.current.count === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No outstanding invoices
          </p>
        ) : !hasOverdue ? (
          <p className="py-4 text-center text-sm text-emerald-600 font-medium">
            ✓ All outstanding invoices are current — none overdue
          </p>
        ) : (
          <div className="space-y-4">
            {buckets.map((bucket) => (
              <div key={bucket.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm text-foreground">{bucket.label}</span>
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    {formatMoney(bucket.total, currency)}
                    {bucket.count > 0 && (
                      <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
                        ({bucket.count} {bucket.count === 1 ? "invoice" : "invoices"})
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-2 rounded-full transition-all duration-500", bucket.color)}
                    style={{
                      width:
                        bucket.total > 0
                          ? `${Math.round((bucket.total / maxBucketTotal) * 100)}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Run tests**

```bash
npm run test 2>&1 | tail -5
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add components/features/finance/invoice-aging-report.tsx
git commit -m "feat(finance): InvoiceAgingReport component with 4-bucket horizontal bars"
```

---

## Task 9: Wire everything in `page.tsx`

**Files:**
- Modify: `app/(app)/finance/page.tsx`

- [ ] **Step 1: Replace `app/(app)/finance/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FinanceFilterBar } from "@/components/features/finance/finance-filter-bar";
import { SkeletonCountRecorder } from "@/hooks/use-skeleton-count";
import { FinanceSummaryCards } from "@/components/features/finance/finance-summary-cards";
import { RevenueAreaChart } from "@/components/features/finance/revenue-area-chart";
import { FinanceInvoiceTable } from "@/components/features/finance/finance-invoice-table";
import { InvoiceAgingReport } from "@/components/features/finance/invoice-aging-report";
import {
  getFinancialSummary,
  getMonthlyRevenue,
  listFinanceInvoices,
  getAgingReport,
} from "@/lib/finance/finance-queries";
import { parseDateRangeParams } from "@/lib/finance/date-utils";
import {
  parsePageParam,
  parseSortParam,
  parseSearchParam,
  parseStatusParam,
} from "@/lib/finance/filter-utils";
import type { InvoiceFilters } from "@/lib/finance/types";
import { getProfile } from "@/lib/profile/actions";

export const metadata: Metadata = { title: "Finance" };

type SearchParams = Promise<{
  from?: string;
  to?: string;
  page?: string;
  sort?: string;
  search?: string;
  status?: string;
}>;

export default async function FinancePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { from, to, page, sort, search, status } = await searchParams;
  const range = parseDateRangeParams(from, to);

  const filters: InvoiceFilters = {
    dateRange: range,
    page: parsePageParam(page),
    pageSize: 20,
    sort: parseSortParam(sort),
    search: parseSearchParam(search),
    status: parseStatusParam(status),
  };

  const profileResult = await getProfile();
  const currency =
    profileResult.ok && profileResult.profile?.default_currency
      ? profileResult.profile.default_currency
      : "USD";

  const [summary, monthlyRevenue, paginatedInvoices, agingReport] = await Promise.all([
    getFinancialSummary(range),
    getMonthlyRevenue(range),
    listFinanceInvoices(filters),
    getAgingReport(),
  ]);

  // Build date params string for KPI card hrefs (preserves date filter on drill-down)
  const dateParams = from && to ? `from=${from}&to=${to}` : "";

  return (
    <>
      <SkeletonCountRecorder
        id="finance:invoices"
        count={paginatedInvoices.invoices.length}
      />
      <div className="relative shrink-0 rounded-3xl border border-border/60 bg-gradient-to-br from-muted/40 via-background to-background px-4 py-6 md:overflow-hidden md:px-8 md:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -end-24 -top-24 hidden size-72 rounded-full bg-primary/[0.07] blur-3xl md:block"
        />
        <div className="relative flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Finance
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Revenue Overview
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground md:text-base">
            Track invoices, revenue, and payment performance.
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <FinanceFilterBar />
      </Suspense>

      <FinanceSummaryCards
        summary={summary}
        currency={currency}
        dateParams={dateParams}
        activeStatus={status}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Revenue
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <RevenueAreaChart data={monthlyRevenue} currency={currency} />
        </CardContent>
      </Card>

      <Card>
        <FinanceInvoiceTable
          invoices={paginatedInvoices.invoices}
          total={paginatedInvoices.total}
          pageCount={paginatedInvoices.pageCount}
          currentPage={filters.page}
          currentSort={filters.sort}
          currency={currency}
          filters={{ ...filters, page: undefined as never }}
        />
      </Card>

      <InvoiceAgingReport report={agingReport} currency={currency} />
    </>
  );
}
```

Note: the `filters` prop passed to `FinanceInvoiceTable` omits `page` — use:

```tsx
filters={{
  dateRange: filters.dateRange,
  pageSize: filters.pageSize,
  sort: filters.sort,
  search: filters.search,
  status: filters.status,
}}
```

Replace the `filters={{ ...filters, page: undefined as never }}` line with the explicit object above.

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Fix any type errors before continuing.

- [ ] **Step 3: Run full tests**

```bash
npm run test 2>&1 | tail -5
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/finance/page.tsx
git commit -m "feat(finance): wire all filters, pagination, aging report into finance page"
```

---

## Task 10: Build check + final commit

- [ ] **Step 1: Run full build**

```bash
npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully` with no errors. Fix any type errors before continuing.

- [ ] **Step 2: Run full test suite**

```bash
npm run test 2>&1 | tail -5
```

Expected: all tests pass (≥ 235 + 18 new = 253+).

- [ ] **Step 3: Push branch**

```bash
git push -u origin feat/finance-dashboard-upgrade
```

---

## Self-Review Checklist

- [x] Currency bug fix → Task 3
- [x] Pagination (numbered pages) → Task 4 (`listFinanceInvoices` returns `PaginatedInvoices`) + Task 6 (`Pagination` component)
- [x] Sort by date/amount/client/status → Task 4 (`sortInvoices`) + Task 6 (`SortableHeader`)
- [x] Search by invoice # or client name → Task 4 (`_cachedFetchFilteredInvoices`) + Task 5 (search input)
- [x] Status filter pills → Task 5
- [x] KPI drill-down → Task 7 (`href` + `isActive` on KPI cards)
- [x] CSV export (all matching rows) → Task 4 (`exportFinanceInvoices`) + Task 6 (export button)
- [x] Invoice aging report → Task 8 (component) + Task 4 (`getAgingReport`) + Task 9 (wired in page)
- [x] All filter state in URL → Every component uses `useSearchParams` + `router.push`
- [x] Types consistent: `FinanceInvoiceRow` used in Tasks 4, 6, 8; `InvoiceFilters` in Tasks 4, 6, 9; `SortKey` in Tasks 1, 2, 4, 6
- [x] `Omit<InvoiceFilters, "page">` used correctly in `exportFinanceInvoices` and as `filters` prop type on `FinanceInvoiceTable`
