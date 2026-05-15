# Financial Dashboard — Design Spec

**Date:** 2026-05-15  
**Phase:** Phase 2 — Documents & Finance  
**Route:** `/finance`  
**Status:** Approved design, ready for implementation

---

## Context

CraftlyAI's `/finance` page is currently a `SectionPlaceholder`. Phase 2 requires a financial dashboard giving freelancers a real-time view of revenue, outstanding balances, and overdue invoices. All data is already in the `documents` and `line_items` tables — no new migrations needed. Expenses are out of scope for this phase.

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Layout | Full-width stack | Matches existing dashboard page pattern |
| Chart type | Area chart + gradient fill | Premium feel, shows revenue momentum |
| KPI cards | White + colored top border + icon | Professional balance, uses Lucide icons |
| Time filter | Preset tabs + custom date picker | User requested both |
| Data scope | Revenue analytics only | No expenses table migration yet |

---

## Page Structure

```
/finance
├── Page header (title + description)
├── Filter bar (preset tabs + date range picker)  ← client component
├── KPI cards row (4 cards)                       ← server-rendered, re-fetched on filter
├── Area chart — Monthly Revenue                  ← Recharts, client component
├── Invoice table — Recent invoices               ← server-rendered list
```

---

## Filter Bar

**Preset tabs:** This Month | Last 3 Months | This Year  
**Custom picker:** shadcn Calendar popover with date range selection  
**State:** URL search params (`?from=2026-01-01&to=2026-05-15`) — enables SSR data fetch, shareable URLs, no client state management  
**Component:** `FinanceFilterBar` (client component, updates URL params via `router.push`)

---

## KPI Cards

Four cards in a 4-column grid (2-col on mobile). Each card:
- White background, 1px border
- Colored **top border accent** (3px)
- Tinted **icon pill** (28×28, rounded-md, Lucide icon)
- Metric label (uppercase, muted, 10px)
- Value (bold, 22px)
- Sub-label (trend % or count, colored by status)

| Card | Icon | Border/Icon Color | Sub-label |
|---|---|---|---|
| Total Revenue | `DollarSign` | Blue (#3b82f6) | ↑/↓ % vs previous period |
| Outstanding | `Clock` | Green (#10b981) | N invoices pending |
| Overdue | `AlertTriangle` | Amber (#f59e0b) | N invoices overdue |
| Avg Pay Time | `Timer` | Purple (#8b5cf6) | "Good" / "Slow" vs 30d industry avg |

---

## Revenue Area Chart

- **Library:** Recharts (`AreaChart`, `Area`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`)
- **Data:** Monthly aggregated paid invoice totals within selected date range
- **Gradient fill:** `linearGradient` — primary blue top (30% opacity) → transparent bottom
- **X-axis:** Month labels (Jan, Feb, …)
- **Y-axis:** Currency formatted (auto-scaled)
- **Tooltip:** Shows month + formatted revenue amount
- **Current month:** Dashed stroke, lower opacity (incomplete data indicator)
- **Component:** `RevenueAreaChart` (client component — Recharts requires browser)

---

## Invoice Table

Reuses existing table patterns from `clients-table.tsx` and `documents` list:

**Columns:** Invoice # | Client | Amount | Status | Due Date | Actions  
**Rows:** Last 20 invoices in selected period, ordered by `created_at DESC`  
**Status badge:** Uses existing `DOCUMENT_STATUS_VARIANTS` from `lib/documents/display.ts`  
**Actions:** View → `/documents/[id]` | Mark Paid (if status = sent/viewed)  
**Empty state:** Border-dashed card with "No invoices in this period"

---

## Data Layer

### New file: `lib/finance/finance-queries.ts`

```typescript
// All queries filtered by userId + date range

getFinancialSummary(userId, from, to): Promise<FinancialSummary>
// Returns: totalRevenue, outstanding, overdue, avgPayDays, revenueVsPrevious

getMonthlyRevenue(userId, from, to): Promise<MonthlyRevenuePoint[]>
// Returns: { month: "Jan", revenue: 4200 }[] — paid invoices grouped by month

listFinanceInvoices(userId, from, to): Promise<DocumentListRow[]>
// Returns: last 20 invoices in range with client join
```

### Calculation logic

- **Total revenue:** `SUM(line_items.quantity * line_items.unit_price)` for all `paid` invoices in range, then subtract discount (`discount_type = 'flat'` → subtract `discount_value`; `discount_type = 'percent'` → subtract `subtotal * discount_value / 100`)
- **Outstanding:** same sum for `sent` + `viewed` status invoices
- **Overdue:** outstanding invoices where `due_date < now()`
- **Avg pay time:** `AVG(paid_at - sent_at)` in days for paid invoices in range
- **Period comparison:** fetch previous equivalent period, compute delta %

### New file: `lib/finance/types.ts`

```typescript
type FinancialSummary = {
  totalRevenue: number
  outstanding: number
  overdue: number
  avgPayDays: number | null
  revenueChangePct: number | null
  overdueCount: number
  outstandingCount: number
}

type MonthlyRevenuePoint = {
  month: string      // "Jan 2026"
  monthKey: string   // "2026-01"
  revenue: number
  isCurrent: boolean
}
```

---

## Component Architecture

```
app/(app)/finance/page.tsx          ← server component, reads URL searchParams
  FinanceFilterBar                  ← client, updates URL
  FinanceSummaryCards               ← server, receives FinancialSummary
    KpiCard × 4                    ← pure presentational
  RevenueAreaChart                  ← client (Recharts), receives MonthlyRevenuePoint[]
  FinanceInvoiceTable               ← server, receives DocumentListRow[]
```

All data fetched in `page.tsx` via parallel `Promise.all([...])` — single round-trip.

---

## Dependencies

- **Install:** `recharts` (not yet in package.json)
- **Reuse:** `lib/documents/display.ts` (status labels/variants)
- **Reuse:** `lib/supabase/server.ts` (createClient pattern)
- **Reuse:** `components/ui/card`, `badge`, `button`, `tabs`, `popover`, `calendar`
- **Reuse:** `lib/utils` (cn, currency formatter)

---

## Date Filter Defaults

- Default on first load: **This Month** (current calendar month)
- URL params absent → server computes current month range
- Params present → server uses them directly (validated with Zod)

---

## Error Handling

- Query failures → return empty summary (zeros) + toast via server action result pattern
- Empty date range → show empty states, not errors
- No invoices → empty state card with link to `/documents/new`

---

## Testing

- Zod schema tests for `FinancialSummary` and `MonthlyRevenuePoint` types
- Pure utility tests for date range computation (current month, last 3 months, YTD)
- Pure utility tests for revenue calculation logic (discount application, avg pay days)
- Co-located: `lib/finance/finance-queries.test.ts`, `lib/finance/utils.test.ts`

---

## Verification

1. `npm run build` passes
2. Navigate to `/finance` — KPI cards show real data from existing invoices
3. Switch filter tabs — data re-fetches, URL updates
4. Custom date range — picker selects range, data updates
5. Area chart renders with gradient, tooltip shows on hover
6. Invoice table shows recent invoices with correct status badges
7. Mark Paid action works from table row
8. Empty state shows when no invoices in selected range
9. `npm run test` — all new utility tests pass
