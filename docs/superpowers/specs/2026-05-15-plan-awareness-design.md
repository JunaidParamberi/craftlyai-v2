# Plan-Awareness System — Design Spec

**Date:** 2026-05-15
**Status:** Approved for implementation
**Phase:** 2 (billing)

---

## Goal

Make Free and Starter users feel their plan limits at exactly the right moment — not constantly, not never. The system should feel like a helpful product feature, not an upsell machine.

---

## Chosen Approach: Contextual Gate + Smart Nudges

Three surfaces, each triggered by context:

1. **Avatar dropdown** — always-visible usage bars (subtle)
2. **Ghost rows** — appear only when a limit is hit (at the friction point)
3. **Dashboard banner** — appears only when ≥ 80% of any limit is used

Nothing renders for Pro or Agency users.

---

## Surface 1: Avatar Dropdown

### What renders

Below the user name/email row, before the menu items:

```
┌─────────────────────────────────────┐
│  [JP]  Junaid P.          [Free]    │
│        junaid@email.com             │
├─────────────────────────────────────┤
│  Clients        ████████░░  3 / 3   │
│  Docs/month     ██████░░░░  4 / 5   │
│  [Upgrade plan →]                   │
├─────────────────────────────────────┤
│  Settings                           │
│  Billing & Plans                    │
│  Support                            │
│  ─────────────────                  │
│  Sign out                           │
└─────────────────────────────────────┘
```

### Bar colour logic

| Usage | Colour |
|-------|--------|
| ≤ 60% | `text-emerald-500` / `bg-emerald-500` |
| 61–80% | `text-amber-500` / `bg-amber-500` |
| > 80% | `text-red-500` / `bg-red-500` |

### Visibility rules

- Renders only when `plan_tier` is `free` or `starter`
- Pro/Agency: no usage section at all (they have no client/doc limits)
- Starter limit is 15 clients / unlimited docs — show clients bar only

### CTA

`Upgrade plan →` link — routes to `/settings/billing`. Not a button, an anchor. No hover animation. No emphasis. Just clearly there.

---

## Surface 2: Ghost Upgrade Rows

Appears at the bottom of a list **only when the user has reached their plan limit**.

### Client list ghost row

Triggered when `client_count >= plan_limit.clients`.

```
┌─────────────────────────────────────────────────────┐
│  [+]  Add more clients                    [Upgrade →]│
│       Upgrade to Starter — 15 clients,              │
│       unlimited documents                            │
└─────────────────────────────────────────────────────┘
```

- Dashed border on the avatar circle, `+` icon
- Soft green background (`bg-emerald-50`)
- Dashed top border on row (`border-dashed border-emerald-200`)
- `Upgrade →` pill: `bg-emerald-500 text-white`
- Clicking anywhere on row → `/settings/billing`

### Document list ghost row

Triggered when `doc_count_this_month >= plan_limit.docsPerMonth`.

Same pattern, copy: "Upgrade to Starter — unlimited documents every month"

### Rules

- Never shows for Pro/Agency
- Greyed-out "Add" button remains visible (don't hide it — users need to see the action exists)
- Ghost row replaces nothing — it appends below the last real item

---

## Surface 3: Dashboard Smart Banner

### When it renders

- `plan_tier` is `free` or `starter`
- AND any of: `client_count / limit >= 0.8` OR `doc_count_this_month / limit >= 0.8`
- AND user has not dismissed it this calendar month

### Priority — show the most urgent metric

1. Clients if `client_count / limit >= doc_count / doc_limit`
2. Docs otherwise

### Appearance

```
┌─────────────────────────────────────────────────────┐
│ ⚡ 4/5 documents used this month — 1 remaining   [Upgrade] [×] │
└─────────────────────────────────────────────────────┘
```

- Amber background (`bg-amber-50 border border-amber-200`)
- Slim: `py-2 px-4` — not a full banner, more like a notice strip
- Sits above the page title, below the header
- `Upgrade` pill → `/settings/billing`
- `×` dismiss button: saves `plan-banner-dismissed-{YYYY-MM}` to `localStorage`. Cleared next month automatically (key changes with month).

### What it never does

- Never animates in/out with motion (too aggressive)
- Never shows more than one banner
- Never shows outside `/dashboard`

---

## Data Architecture

### Query (added to `app/(app)/layout.tsx`)

```typescript
// Parallel fetch alongside existing profile query
const [clientCountResult, docCountResult] = await Promise.all([
  supabase
    .from("clients")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id),
  supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", startOfCurrentMonth()),
]);

const planUsage = {
  planTier: profile.plan_tier,
  clientCount: clientCountResult.count ?? 0,
  docCountThisMonth: docCountResult.count ?? 0,
};
```

`startOfCurrentMonth()` is a pure util: `new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()`.

### Context propagation

New `PlanUsageContext` + `PlanUsageProvider`:

```typescript
// lib/plan-usage/context.tsx
type PlanUsageContext = {
  planTier: PlanTier;
  clientCount: number;
  docCountThisMonth: number;
};
```

`DashboardShell` wraps children in `<PlanUsageProvider value={planUsage}>`. Any page/component reads it via `usePlanUsage()` hook — no extra fetches.

### Limit lookup

`getPlanLimit(tier, 'clients')` and `getPlanLimit(tier, 'docsPerMonth')` — thin helpers reading from `config/plans.ts` (already exists). Returns `Infinity` for `"unlimited"` so comparison arithmetic always works.

---

## Files to create / modify

| Action | File | What |
|--------|------|------|
| Create | `lib/plan-usage/context.tsx` | `PlanUsageContext`, `PlanUsageProvider`, `usePlanUsage()` |
| Create | `lib/plan-usage/helpers.ts` | `getPlanLimit()`, `startOfCurrentMonth()`, `getUsageColor()`, `shouldShowBanner()` |
| Modify | `app/(app)/layout.tsx` | Add parallel client/doc count queries; pass `planUsage` to `DashboardShell` |
| Modify | `components/layout/dashboard-shell.tsx` | Accept `planUsage` prop; wrap children in `PlanUsageProvider` |
| Modify | `components/layout/app-header.tsx` | Accept `planUsage` prop; render usage bars + plan chip in dropdown |
| Create | `components/features/billing/plan-usage-bars.tsx` | Usage bars sub-component used inside dropdown |
| Create | `components/features/billing/upgrade-ghost-row.tsx` | Ghost "add more" row for lists |
| Create | `components/features/billing/plan-limit-banner.tsx` | Slim dashboard banner (client component, reads localStorage) |
| Modify | `app/(app)/clients/page.tsx` | Pass `clientCount` + `planLimit` → render ghost row when at limit |
| Modify | `app/(app)/documents/page.tsx` | Pass `docCount` + `planLimit` → render ghost row when at limit |
| Modify | `app/(app)/dashboard/page.tsx` | Render `PlanLimitBanner` when usage ≥ 80% |

---

## Out of scope

- AI action counter (Phase 3)
- Modals / overlays (link to billing page only)
- Banner on non-dashboard pages
- Sidebar plan widget
- Animations on banner (CSS fade-in max, no Framer Motion)
- Email nudges

---

## Test requirements

Vitest tests for all pure helpers in `lib/plan-usage/helpers.ts`:
- `getPlanLimit('free', 'clients')` → `3`
- `getPlanLimit('pro', 'clients')` → `Infinity`
- `shouldShowBanner({ planTier: 'free', clientCount: 3, docCountThisMonth: 2 })` → `true` (clients at 100%)
- `shouldShowBanner({ planTier: 'free', clientCount: 1, docCountThisMonth: 2 })` → `false` (both under 80%)
- `shouldShowBanner({ planTier: 'pro', clientCount: 100, docCountThisMonth: 100 })` → `false` (pro, no limits)
- `getUsageColor(0.5)` → `'emerald'`
- `getUsageColor(0.75)` → `'amber'`
- `getUsageColor(0.95)` → `'red'`
- `startOfCurrentMonth()` → ISO string matching `YYYY-MM-01T00:00:00`
