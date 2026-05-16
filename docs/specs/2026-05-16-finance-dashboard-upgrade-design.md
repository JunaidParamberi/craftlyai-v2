# Finance Dashboard Upgrade — Design Spec

**Date:** 2026-05-16  
**Status:** Approved  
**Branch:** `feat/finance-dashboard-upgrade`

---

## Overview

Upgrade `/finance` from a static summary page to a fully interactive finance dashboard on par with tools like Zoho Books and FreshBooks. All interactivity is URL-driven (searchParams) so every view is bookmarkable and shareable.

---

## Bug Fix

### Y-axis currency symbol hardcoded to `$`

`formatYAxis` in `revenue-area-chart.tsx` always returns `$${value}k` regardless of the user's `currency` prop.

**Fix:** Accept `currency` string in `formatYAxis`, use `Intl.NumberFormat` with `notation: "compact"` or manually format with the correct symbol via a currency-to-symbol map. Simplest correct approach: derive the symbol once from `Intl.NumberFormat` and use it in the formatter.

---

## URL Search Params

All filter state lives in the URL. The `page.tsx` RSC reads all params and passes them to queries.

| Param | Default | Values |
|---|---|---|
| `from` | start of current month | `yyyy-MM-dd` |
| `to` | today | `yyyy-MM-dd` |
| `page` | `1` | positive integer |
| `sort` | `date_desc` | `date_asc`, `date_desc`, `amount_asc`, `amount_desc`, `client_asc`, `client_desc`, `status_asc`, `status_desc` |
| `search` | — | free text; matches invoice number or client name (case-insensitive) |
| `status` | — | `paid`, `sent`, `viewed`, `outstanding`, `overdue`, `draft`; absent = show all |

Param parsing lives in `lib/finance/date-utils.ts` (date params) and a new `lib/finance/filter-utils.ts` (page, sort, search, status). Both must validate and fall back to defaults on invalid input.

---

## Data Layer

### `listFinanceInvoices` — updated signature

```ts
type InvoiceFilters = {
  from: Date;
  to: Date;
  page: number;           // 1-indexed
  pageSize: number;       // always 20
  sort: SortKey;
  search?: string;
  status?: InvoiceStatus | "overdue";
};

type PaginatedInvoices = {
  invoices: (DocumentListRow & { computedTotal: number })[];
  total: number;          // total matching rows (for pagination UI)
  pageCount: number;
};
```

- Supabase `.range(from, to)` for pagination (offset-based).
- `search` applies `.or("invoice_number.ilike.%q%,clients.name.ilike.%q%")` — requires the `clients` join already present.
- `status === "overdue"` translates to `.in("status", ["sent", "viewed"]).lt("due_date", now.toISOString())`.
- Sort maps to Supabase `.order()` calls. `client_*` sorts on the joined `clients.name` — use `.order("clients(name)", ...)`.
- Cache key includes all filter params. Tag: `"finance"`.

### `exportFinanceInvoices` — new server action

Same filters as `listFinanceInvoices` but no pagination limit. Returns all matching rows. Called from the CSV export button. Returns `(DocumentListRow & { computedTotal: number })[]`. Not cached (always fresh).

### `getAgingReport` — new query

Fetches all unpaid invoices (`status IN ('sent','viewed')`) with `due_date < now`. Groups into three buckets:

| Bucket | Condition |
|---|---|
| Current (not yet due) | `due_date >= now` or `due_date IS NULL` |
| 1–30 days overdue | `0 < days_overdue <= 30` |
| 31–60 days | `30 < days_overdue <= 60` |
| 60+ days | `days_overdue > 60` |

Returns per-bucket: `{ count, total }`. Computed in TypeScript (not SQL) from a single query fetch. Cached 60 s, tag `"finance"`.

---

## Components

### `finance-filter-bar.tsx` — extended

Adds below the existing date preset row:

1. **Search input** — debounced 300 ms, updates `search` param. Preserves all other params.
2. **Status filter pills** — `All | Draft | Sent | Viewed | Paid | Overdue`. Active pill highlighted. Updates `status` param, resets `page` to 1.

On any filter change: reset `page` to 1.

### `finance-invoice-table.tsx` — sortable + paginated

**Sortable column headers:** `Invoice`, `Client`, `Due`, `Status`, `Amount`. Clicking a header sets `sort` param. Active column shows arrow indicator (↑/↓). Clicking the active column toggles direction. Implemented as a client component `SortableHeader` that pushes to router.

**Pagination controls** at bottom of table:
- Shows: `Showing 1–20 of 87 invoices`
- Prev / page numbers / Next buttons
- shadcn `Button` variant `outline` / `default` for active page
- Only renders when `pageCount > 1`

**CSV Export button** in the table card header (right side). On click: calls `exportFinanceInvoices` server action with current filters, builds CSV blob client-side, triggers download. Columns: Invoice #, Client, Issue Date, Due Date, Status, Amount.

### `kpi-card.tsx` — interactive

Accepts optional `href?: string`. When provided, wraps card in Next.js `Link`. Active state (URL `status` param matches) adds a ring highlight. 

Mappings:
- **Overdue card** → `?status=overdue` (resets page, preserves date range)
- **Outstanding card** → `?status=outstanding` (maps to `sent` + `viewed` in query)
- Revenue and Avg Pay Time cards remain display-only.

### `invoice-aging-report.tsx` — new component

New `<Card>` section below the invoice table. Shows 4 horizontal bar rows (Current, 1–30d, 31–60d, 60+ days). Each row:
- Label + count badge
- Horizontal bar (proportional width, color-coded: green → amber → orange → red)
- Dollar amount right-aligned

No chart library needed — pure CSS `div` bars with `transition-all`. Empty state: "All invoices are current" with a green check.

### `lib/finance/filter-utils.ts` — new

Pure parsing functions for non-date params. Vitest-tested.

```ts
parsePageParam(s?: string): number         // clamps to [1, ∞], default 1
parseSortParam(s?: string): SortKey        // validates against allowed list, default "date_desc"
parseSearchParam(s?: string): string | undefined
parseStatusParam(s?: string): InvoiceStatus | "overdue" | "outstanding" | undefined
```

---

## Page Layout Changes

`app/(app)/finance/page.tsx` reads expanded searchParams:

```ts
type SearchParams = Promise<{
  from?: string; to?: string;
  page?: string; sort?: string;
  search?: string; status?: string;
}>;
```

Parallel fetches remain. `getAgingReport` added to `Promise.all`.

---

## Error Handling

- Invalid `page` → clamp to 1
- Invalid `sort` → fall back to `date_desc`
- Supabase error on `listFinanceInvoices` → return `{ invoices: [], total: 0, pageCount: 0 }` with `console.error`
- CSV export failure → sonner toast error

---

## Testing

- `lib/finance/filter-utils.ts`: Vitest for all four parse functions (valid, invalid, edge cases)
- `lib/finance/date-utils.ts`: existing tests unchanged; `parseDateRangeParams` `to` is `endOfDay` (already fixed)
- No unit tests for queries (require Supabase) — test parse + compute layers only

---

## Out of Scope

- Stacked paid-vs-outstanding chart (deferred)
- Server-side search (current `ilike` is sufficient for freelancer scale)
- Real-time updates
- Saved filter presets
