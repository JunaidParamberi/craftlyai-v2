# Real Dashboard — Design Spec

**Date:** 2026-05-15  
**Phase:** 2.5, Task 1  
**Status:** Approved for implementation  
**Branch:** `feat/real-dashboard`

---

## Goal

Replace all hardcoded data in `/dashboard` with live Supabase queries. Add pipeline strip and attention list. No new routes — same page, same layout shell.

---

## Layout (approved: Layout B — Attention-first)

```
┌─────────────────────────────────────────────────────┐
│  Hero band — "Welcome back, {firstName}"             │
├──────────┬──────────┬──────────┬────────────────────┤
│ Revenue  │ Projects │ Outstanding│ Overdue           │
│ (month)  │ (active) │ (unpaid $) │ (count + $)      │
├─────────────────────────────────────────────────────┤
│ ⚠ Attention banner (amber) — hidden when empty      │
│  [item 1 → ]  [item 2 → ]  [item 3 → ] ...          │
├───────────────────────────┬─────────────────────────┤
│ Recent activity (3/5)     │ Active pipeline (2/5)   │
│  ✓ Invoice paid           │  🔴 Brand Refresh       │
│  📤 Quote sent            │  🟡 API v2              │
│  ✅ Quote approved        │  🟢 SEO Overhaul        │
└───────────────────────────┴─────────────────────────┘
```

---

## Section 1 — KPI Cards (4 cards)

### Card 1: Monthly Revenue
- **Value:** sum of paid invoices this calendar month (gross after discount, including tax)
- **Sub-label:** percentage change vs previous calendar month (↑ green / ↓ red badge)
- **Data source:** reuse `getFinancialSummary(currentMonthRange())` from `lib/finance/finance-queries.ts` → `totalRevenue` + `revenueChangePct`
- **Format:** `$12,450` (USD default; currency formatting via `Intl.NumberFormat`)

### Card 2: Active Projects
- **Value:** count of projects where `status IN ('planning', 'active', 'on_hold')`
- **Sub-label:** "N nearing deadline" — projects with deadline within 7 days (amber text if > 0, muted if 0)
- **Data source:** new query in `lib/dashboard/dashboard-queries.ts`

### Card 3: Outstanding
- **Value:** sum of all unpaid invoices (status `sent` or `viewed`) regardless of date range
- **Sub-label:** "N unpaid invoices" (muted text)
- **Data source:** `getFinancialSummary` → `outstanding` + `outstandingCount`

### Card 4: Overdue
- **Value:** count of overdue invoices (unpaid + past due date)
- **Sub-label:** total dollar amount at risk (red text)
- **Border/background:** amber tint when count > 0 (`border-destructive/30 bg-destructive/5`)
- **Data source:** `getFinancialSummary` → `overdueCount` + `overdue`

---

## Section 2 — Attention Banner

Renders only when `attentionItems.length > 0`. Hidden entirely when empty — no empty state shown.

### Trigger rules

| Type | Condition | Link |
|---|---|---|
| Overdue invoice | `type='invoice'`, status `sent`/`viewed`, `due_date < NOW()` | `/documents/{id}` |
| Expiring quote | `type='quote'`, status `sent`, `valid_until BETWEEN NOW() AND NOW()+3d` | `/documents/{id}` |
| Project deadline | `status IN ('active','in_progress')`, `deadline BETWEEN NOW() AND NOW()+7d` | `/projects/{id}` |
| Quote no response | `type='quote'`, status `sent`, `sent_at < NOW()-7d` AND `valid_until > NOW()` (not already expiring) | `/documents/{id}` |

### Deduplication rule
A quote expiring within 3 days AND sent 7+ days ago → show as **expiring** only (higher urgency). Don't show as both.

### Item display format
- Overdue invoice: `Invoice #{number} · {client_name} · ${amount} · {N} days overdue`
- Expiring quote: `Quote #{number} · {client_name} · expires in {N} days`
- Project deadline: `{project_title} · {client_name} · due in {N} days`
- Quote no response: `Quote #{number} · {client_name} · no response in {N} days`

### Ordering
1. Overdue invoices (sorted by days overdue DESC)
2. Expiring quotes (sorted by days remaining ASC)
3. Project deadlines (sorted by days remaining ASC)
4. No-response quotes (sorted by days since sent DESC)

### Max shown
Show all items (no truncation). Freelancer needs to see everything that needs action.

---

## Section 3 — Recent Activity Feed

### Event types

| Event | Trigger field | Icon | Label format |
|---|---|---|---|
| Invoice paid | `status='paid'`, `paid_at` | `CheckCircle2` (green bg) | `Invoice #{number} paid · {client} · ${amount}` |
| Document sent | `sent_at IS NOT NULL` (any type) | `Send` (blue bg) | `{type_label} #{number} sent to {client}` |
| Quote approved | `approved_at IS NOT NULL` | `ThumbsUp` (green bg) | `Quote #{number} approved by {client}` |
| Quote declined | `declined_at IS NOT NULL` | `ThumbsDown` (red bg) | `Quote #{number} declined by {client}` |
| Project status changed | `updated_at` when status changes | `FolderOpen` (purple bg) | `{project_title} marked {status}` |

### Query strategy
Fetch last 30 days of:
- Documents: `SELECT id, type, status, sent_at, paid_at, approved_at, declined_at, invoice_number, quote_number, clients(name), discount_value, discount_type FROM documents WHERE user_id=? AND updated_at > NOW()-30d ORDER BY updated_at DESC LIMIT 30`
- Then fetch line items for those docs to compute amounts
- Projects: `SELECT id, title, status, updated_at, clients(name) FROM projects WHERE user_id=? AND updated_at > NOW()-30d ORDER BY updated_at DESC LIMIT 20`

### Merging
Each document row can produce multiple events (e.g. same doc: `sent_at` event + `paid_at` event). Extract events from each row, assign the correct timestamp per event type, merge with project events, sort by timestamp DESC, limit to **10 items** displayed.

Pure function `extractDocumentEvents(doc)` → `ActivityEvent[]` lives in `lib/dashboard/activity-utils.ts`. Testable in isolation.

### Timestamp display
Use `formatDistanceToNow` from `date-fns`: "2 hours ago", "Yesterday", "3 days ago". Over 7 days: show `format(date, 'MMM d')`.

---

## Section 4 — Active Pipeline

Shows active/in-progress projects, ordered by deadline ASC (soonest first). Limit 5, with "+N more" link if more exist.

### Project card fields
- Project title
- Client name
- Deadline label (e.g. "due in 3 days" / "due Jun 15" / "no deadline")
- Status indicator (dot + label)

### Status indicator logic (pure function `classifyProjectRisk`)

| Condition | Indicator |
|---|---|
| `deadline < NOW()` | 🔴 Overdue |
| `deadline <= NOW() + 7d` | 🔴 At risk |
| `deadline <= NOW() + 14d` | 🟡 Watch |
| `deadline > NOW() + 14d` OR no deadline | 🟢 On track |

### Active project filter
Query projects where `status IN ('planning', 'active', 'on_hold')`. Completed and archived projects excluded.

### Projects without deadline
Show at bottom of list, always "🟢 On track" unless project has other risk signals.

---

## Architecture

### Data fetching — all parallel, server component

```
app/(app)/dashboard/page.tsx  ← RSC, no "use client"
  └─ Promise.all([
       getFinancialSummary(currentMonthRange()),   // revenue, outstanding, overdue
       getDashboardCounts(),                        // active projects count, nearing-deadline count
       getAttentionItems(),                         // all 4 trigger types
       getRecentActivity(),                         // merged events, limit 10
       getActivePipeline(),                         // projects, limit 5+count
     ])
```

All 5 queries run in parallel. Page load = slowest single query (not sum of all).

### New files to create

```
lib/dashboard/
  types.ts               ← TypeScript interfaces
  dashboard-queries.ts   ← getDashboardCounts, getAttentionItems, getActivePipeline, getRecentActivity
  activity-utils.ts      ← extractDocumentEvents, mergeAndSortEvents (pure, testable)
  activity-utils.test.ts ← Vitest tests
  attention-utils.ts     ← classifyProjectRisk, deduplicateAttentionItems (pure, testable)
  attention-utils.test.ts← Vitest tests

components/features/dashboard/
  kpi-cards.tsx          ← DashboardKpiCards component (receives pre-fetched data as props)
  attention-banner.tsx   ← AttentionBanner (hidden when items=[])
  activity-feed.tsx      ← ActivityFeed (receives events as props)
  pipeline-panel.tsx     ← PipelinePanel (receives projects as props)
  skeletons.tsx          ← already exists, update if needed
```

### Modified files

```
app/(app)/dashboard/page.tsx   ← wire all queries, replace hardcoded sections
```

### Component boundaries

- All 4 new components are **server-rendered display components** — they receive props, render HTML, no `"use client"`.
- No client components needed for this feature (no interactivity beyond links).
- Exception: attention banner items are links (`<Link href={...}>`), which works fine in RSC.

---

## TypeScript interfaces

```typescript
// lib/dashboard/types.ts

export type DashboardCounts = {
  activeProjectsCount: number;
  nearingDeadlineCount: number; // deadline within 7 days
};

export type AttentionItemType =
  | "overdue_invoice"
  | "expiring_quote"
  | "project_deadline"
  | "quote_no_response";

export type AttentionItem = {
  type: AttentionItemType;
  id: string;           // document id or project id
  href: string;         // nav target
  label: string;        // formatted display string
  urgencyDays: number;  // days overdue (positive) or days remaining (positive)
};

export type ActivityEventType =
  | "invoice_paid"
  | "doc_sent"
  | "quote_approved"
  | "quote_declined"
  | "project_status_changed";

export type ActivityEvent = {
  type: ActivityEventType;
  id: string;
  href: string;
  label: string;
  timestamp: Date;
};

export type PipelineProject = {
  id: string;
  title: string;
  clientName: string | null;
  deadline: Date | null;
  risk: "overdue" | "at_risk" | "watch" | "on_track";
  daysLabel: string; // "due in 3 days" | "due Jun 15" | "no deadline" | "overdue by 2 days"
};
```

---

## Currency formatting

Use `Intl.NumberFormat` with `USD` (no currency field on profiles yet — Phase 2.6 adds multi-currency). Extract a shared `formatCurrency(amount: number, currency = "USD")` util in `lib/utils/format.ts` (create if doesn't exist). Dashboard KPI amounts always render as USD until Phase 2.6.

---

## Loading state

`app/(app)/dashboard/loading.tsx` already exists with `DashboardPageSkeleton`. It already mirrors the current 3-card + activity layout. After this feature adds the 4th KPI card and attention banner, update `DashboardPageSkeleton` to:
- Use `statCardCount={4}` (already parameterized)
- Add a skeleton row for the attention banner (a single `Skeleton` with `h-24 w-full rounded-xl`)
- Keep the rest unchanged

---

## Testing requirements

### Unit tests (Vitest) — required, co-located

**`lib/dashboard/activity-utils.test.ts`**
- `extractDocumentEvents` returns correct event types and timestamps for a paid invoice
- `extractDocumentEvents` returns `doc_sent` event when `sent_at` is set
- `extractDocumentEvents` returns `quote_approved` event when `approved_at` is set
- `extractDocumentEvents` returns nothing for a draft document (no sent_at, no paid_at, no approved_at)
- `mergeAndSortEvents` sorts by timestamp DESC
- `mergeAndSortEvents` limits to N events correctly
- `mergeAndSortEvents` handles empty arrays

**`lib/dashboard/attention-utils.test.ts`**
- `classifyProjectRisk` returns `overdue` when deadline is in the past
- `classifyProjectRisk` returns `at_risk` when deadline is 3 days away
- `classifyProjectRisk` returns `watch` when deadline is 10 days away
- `classifyProjectRisk` returns `on_track` when deadline is 20 days away
- `classifyProjectRisk` returns `on_track` when no deadline
- `deduplicateAttentionItems` removes quote_no_response when same quote is also expiring_quote
- `deduplicateAttentionItems` keeps both when different items

### No tests needed for
- `dashboard-queries.ts` (requires Supabase, not unit-testable)
- RSC page component (integration concern)
- Display components (no logic)

### Run before marking done
```bash
npm run test
npm run build
```

---

## UI/UX details

### KPI cards
- Same `Card size="sm"` pattern as existing cards
- Revenue change badge: green `bg-emerald-500/10 text-emerald-500` for positive, red for negative, hidden if `null`
- Overdue card: amber border + faint amber background when count > 0

### Attention banner
- Background: `bg-amber-500/10 border border-amber-500/30`
- Header: `⚠ {N} items need your attention` in `text-amber-500 font-semibold`
- Each item row: faint amber inner bg, full-width, right-aligned "View →" link
- The entire banner is absent from DOM when `attentionItems.length === 0`

### Activity feed
- Icon container: `size-9 rounded-2xl` colored by event type:
  - Paid: `bg-emerald-500/10` with `CheckCircle2 text-emerald-500`
  - Sent: `bg-blue-500/10` with `Send text-blue-500`
  - Approved: `bg-emerald-500/10` with `ThumbsUp text-emerald-500`
  - Declined: `bg-destructive/10` with `ThumbsDown text-destructive`
  - Project: `bg-purple-500/10` with `FolderOpen text-purple-500`
- Timestamp: `text-xs text-muted-foreground`
- Separator between items (existing pattern)

### Pipeline panel
- Each project row: small card with left border colored by risk (`border-l-2`):
  - `border-destructive` for overdue/at_risk
  - `border-amber-500` for watch
  - `border-emerald-500` for on_track
- Risk dot + label in matching color
- "View all →" link to `/projects`

---

## What this feature does NOT include

- No real-time updates (Supabase Realtime) — static server render on page load
- No date range filter — dashboard always shows current month for revenue, all-time for outstanding
- No AI assistant card changes — keep existing stub unchanged
- No notifications system — that is Phase 2.5 Task 5
- No chart on dashboard — chart lives on `/finance` page only

---

## Definition of done

- [ ] All hardcoded numbers replaced with live data
- [ ] 4 KPI cards rendering correct values
- [ ] Attention banner hidden when no items, shows all items when present
- [ ] Activity feed shows last 10 real events
- [ ] Pipeline panel shows active projects sorted by deadline, risk-classified
- [ ] All Vitest tests pass (`npm run test`)
- [ ] Build passes (`npm run build`)
- [ ] Smoke-tested in browser with real Supabase data
