# Premium UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved Ink+White design system — Inter font, #2c5bff tokens, flat 8px-radius cards, subtle-tint nav active state, and correctly-sized skeleton loaders — across all app pages without breaking any existing functionality.

**Architecture:** CSS token swap in globals.css propagates to all shadcn primitives automatically. Card flatness achieved via `[data-slot="card"]` CSS override (no shadcn file touch). Sidebar active state via SIDEBAR_NAV_BUTTON_CLASS constant. Skeleton files rebuilt to mirror real component dimensions.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS 4, shadcn/ui (base-ui), Inter (already loaded via next/font/google)

---

## File Map

| File | Change |
|---|---|
| `styles/globals.css` | Replace all `:root` + `.dark` + sidebar tokens; add `[data-slot="card"]` flat override |
| `lib/dashboard/shell.ts` | Update SIDEBAR_NAV_BUTTON_CLASS for subtle tint |
| `components/layout/app-sidebar.tsx` | Remove explicit active class override, let shell constant drive it |
| `components/layout/app-header.tsx` | Header bg, search bar padding/style |
| `app/(app)/dashboard/page.tsx` | Simplify hero banner |
| `components/features/dashboard/skeletons.tsx` | Rebuild to match real dimensions (hero, KPI grid, panels) |
| `components/features/dashboard/kpi-cards.tsx` | Update delta/status chip colors |
| `components/features/finance/skeletons.tsx` | Fix hero banner + KPI skeleton sizing |
| `components/features/tasks/skeletons.tsx` | Fix KPI card skeleton sizing (h-[7.5rem] → actual card height) |
| `components/features/expenses/skeletons.tsx` | Fix card skeleton rows (h-12 → h-[3.25rem]) |
| `components/features/clients/skeletons.tsx` | Remove rounded-3xl from table container |

---

### Task 1: CSS Token Overhaul

**Files:**
- Modify: `styles/globals.css`

- [ ] **Step 1: Replace `:root` color tokens and add card flat override**

Replace the entire `@theme inline` block, `:root` block, and `.dark` block, and add the card override. Do not touch the `@import` lines or `.doc-prose`/`.doc-render` blocks or the `@keyframes fadeUp` at the bottom.

```css
@theme inline {
  --font-heading: var(--font-sans);
  --font-sans: var(--font-sans);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --color-foreground: var(--foreground);
  --color-background: var(--background);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
  --background: oklch(0.972 0.003 247);
  --foreground: oklch(0.118 0.026 264);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.118 0.026 264);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.118 0.026 264);
  --primary: oklch(0.496 0.233 264);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.944 0.008 264);
  --secondary-foreground: oklch(0.118 0.026 264);
  --muted: oklch(0.944 0.008 264);
  --muted-foreground: oklch(0.556 0.04 264);
  --accent: oklch(0.944 0.008 264);
  --accent-foreground: oklch(0.118 0.026 264);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.878 0.018 264);
  --input: oklch(0.878 0.018 264);
  --ring: oklch(0.496 0.233 264);
  --chart-1: oklch(0.62 0.18 264);
  --chart-2: oklch(0.55 0.21 264);
  --chart-3: oklch(0.48 0.23 264);
  --chart-4: oklch(0.41 0.20 264);
  --chart-5: oklch(0.36 0.17 264);
  --radius: 0.5rem;
  --sidebar: oklch(0.118 0.026 264);
  --sidebar-foreground: oklch(0.94 0.01 264 / 0.88);
  --sidebar-primary: oklch(0.496 0.233 264);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(1 0 0 / 0.07);
  --sidebar-accent-foreground: oklch(0.94 0.01 264 / 0.88);
  --sidebar-border: oklch(1 0 0 / 0.05);
  --sidebar-ring: oklch(0.496 0.233 264);
}

.dark {
  --background: oklch(0.118 0.026 264);
  --foreground: oklch(0.94 0.01 264);
  --card: oklch(0.155 0.026 264);
  --card-foreground: oklch(0.94 0.01 264);
  --popover: oklch(0.155 0.026 264);
  --popover-foreground: oklch(0.94 0.01 264);
  --primary: oklch(0.58 0.22 264);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.20 0.026 264);
  --secondary-foreground: oklch(0.94 0.01 264);
  --muted: oklch(0.20 0.026 264);
  --muted-foreground: oklch(0.60 0.04 264);
  --accent: oklch(0.20 0.026 264);
  --accent-foreground: oklch(0.94 0.01 264);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 0.08);
  --input: oklch(1 0 0 / 0.12);
  --ring: oklch(0.58 0.22 264);
  --chart-1: oklch(0.70 0.15 264);
  --chart-2: oklch(0.63 0.18 264);
  --chart-3: oklch(0.56 0.21 264);
  --chart-4: oklch(0.49 0.23 264);
  --chart-5: oklch(0.42 0.20 264);
  --sidebar: oklch(0.118 0.026 264);
  --sidebar-foreground: oklch(0.94 0.01 264 / 0.88);
  --sidebar-primary: oklch(0.58 0.22 264);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(1 0 0 / 0.07);
  --sidebar-accent-foreground: oklch(0.94 0.01 264 / 0.88);
  --sidebar-border: oklch(1 0 0 / 0.05);
  --sidebar-ring: oklch(0.58 0.22 264);
}
```

- [ ] **Step 2: Add card flat override and shimmer skeleton animation**

Add after the `.dark` block (before the existing `@keyframes fadeUp`):

```css
/* Flat card override — removes shadcn ring/shadow, enforces 8px radius */
[data-slot="card"] {
  border-radius: 8px;
  box-shadow: none;
  outline: none;
  ring: none;
  border: 1px solid var(--border);
}

/* Skeleton shimmer — blue-tinted wave instead of plain pulse */
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

[data-slot="skeleton"] {
  animation: shimmer 1.6s ease infinite;
  background: linear-gradient(
    90deg,
    var(--muted) 25%,
    color-mix(in oklch, var(--muted) 88%, var(--primary)) 50%,
    var(--muted) 75%
  );
  background-size: 200% 100%;
}
```

- [ ] **Step 3: Verify build still compiles**

```bash
cd /Users/junaidparamberi/projects/CraftlyAi/craftlyai && npm run build 2>&1 | tail -20
```

Expected: build succeeds (no new errors).

- [ ] **Step 4: Commit**

```bash
git checkout -b feat/premium-ui
git add styles/globals.css
git commit -m "feat(ui): apply Ink+White token system — brand blue primary, navy sidebar, flat card override"
```

---

### Task 2: Sidebar Active State (Subtle Tint)

**Files:**
- Modify: `lib/dashboard/shell.ts`

- [ ] **Step 1: Update SIDEBAR_NAV_BUTTON_CLASS**

In `lib/dashboard/shell.ts`, replace the `SIDEBAR_NAV_BUTTON_CLASS` constant:

```ts
/** Subtle tint: white text + 7% white bg on active. Icon turns primary via sidebar-primary token. */
export const SIDEBAR_NAV_BUTTON_CLASS =
  "text-sidebar-foreground/35 hover:text-sidebar-foreground/70 hover:bg-sidebar-accent/60 data-active:bg-sidebar-accent data-active:text-sidebar-foreground data-active:font-semibold [&_svg]:text-sidebar-foreground/30 data-active:[&_svg]:text-sidebar-primary transition-colors";
```

- [ ] **Step 2: Update sidebar section label style**

In `components/layout/app-sidebar.tsx`, update the `SidebarGroupLabel` className:

Change:
```tsx
<SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
```

To:
```tsx
<SidebarGroupLabel className="text-[9px] font-semibold uppercase tracking-[0.1em] text-sidebar-foreground/22 px-2">
```

- [ ] **Step 3: Commit**

```bash
git add lib/dashboard/shell.ts components/layout/app-sidebar.tsx
git commit -m "feat(ui): subtle-tint sidebar active state — white tint bg, icon turns brand blue"
```

---

### Task 3: Header Refinement

**Files:**
- Modify: `components/layout/app-header.tsx`

- [ ] **Step 1: Update header className**

In `components/layout/app-header.tsx`, update the `<header>` className. Change:
```tsx
"sticky top-0 z-20 flex items-center gap-3 border-b border-sidebar-border/70 bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 md:gap-4 md:px-6",
```
To:
```tsx
"sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-sm md:gap-4 md:px-6",
```

- [ ] **Step 2: Update search bar styling**

Change the search `<Button>` className from:
```tsx
className="hidden h-9 min-w-0 max-w-lg flex-1 justify-start gap-2 px-3 text-muted-foreground md:flex"
```
To:
```tsx
className="hidden h-8 min-w-0 max-w-md flex-1 justify-start gap-2 rounded-lg px-3 text-muted-foreground md:flex"
```

- [ ] **Step 3: Commit**

```bash
git add components/layout/app-header.tsx
git commit -m "feat(ui): header — flat border, tighter search bar"
```

---

### Task 4: Dashboard Page — Simplify Hero Banner

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Replace the hero banner div**

In `app/(app)/dashboard/page.tsx`, replace the decorative hero section:

Change:
```tsx
<div className="relative shrink-0 rounded-3xl border border-border/60 bg-gradient-to-br from-muted/40 via-background to-background px-4 py-6 md:overflow-hidden md:px-8 md:py-10">
  <div
    aria-hidden
    className="pointer-events-none absolute -end-24 -top-24 hidden size-72 rounded-full bg-primary/[0.07] blur-3xl md:block"
  />
  <div className="relative flex flex-col gap-2">
    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
      Overview
    </p>
    <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
      Welcome back, {firstName}
    </h1>
    <p className="max-w-xl text-muted-foreground text-sm md:text-base">
      Here&apos;s what&apos;s happening with your projects today.
    </p>
  </div>
</div>
```

With:
```tsx
<div className="flex flex-col gap-1">
  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
    Overview
  </p>
  <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
    Welcome back, {firstName}
  </h1>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add "app/(app)/dashboard/page.tsx"
git commit -m "feat(ui): dashboard — clean flat page header, remove gradient hero"
```

---

### Task 5: Dashboard Skeleton — Match Real Dimensions

**Files:**
- Modify: `components/features/dashboard/skeletons.tsx`

- [ ] **Step 1: Rebuild DashboardPageSkeleton to match real page**

Replace the entire `DashboardPageSkeleton` function (keep `ProtectedPlaceholderSkeleton` unchanged):

```tsx
export function DashboardPageSkeleton({
  statCardCount = 4,
  activityRowCount = 3,
}: DashboardPageSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading dashboard"
      className="flex flex-col gap-6"
    >
      {/* Page header — matches Task 4 simplified header */}
      <div className="flex flex-col gap-1">
        <Skeleton className="h-[10px] w-16 rounded-[3px]" />
        <Skeleton className="h-7 w-48 rounded-[4px] md:h-8" />
      </div>

      {/* KPI cards — same grid as DashboardKpiCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SkeletonRepeat
          count={statCardCount}
          render={(i) => (
            <Card key={i} size="sm">
              <CardHeader className="pb-2">
                {/* matches kpi-label: 10px uppercase */}
                <Skeleton className="h-[10px] w-24 rounded-[3px]" />
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-0">
                {/* matches kpi-val: 22px font → ~28px line-height */}
                <Skeleton className="h-7 w-28 rounded-[4px]" />
                {/* matches delta chip: h-5 badge */}
                <Skeleton className="h-5 w-20 rounded-[4px]" />
              </CardContent>
            </Card>
          )}
        />
      </div>

      {/* Attention banner placeholder — matches rounded-xl border */}
      <Skeleton className="h-[3.5rem] w-full rounded-lg" />

      {/* Activity + Pipeline — same lg:grid-cols-5 layout */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3" size="sm">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-[14px] w-32 rounded-[3px]" />
              <Skeleton className="h-[11px] w-52 rounded-[3px]" />
            </div>
            <Skeleton className="h-8 w-20 shrink-0 rounded-md" />
          </CardHeader>
          <CardContent className="flex flex-col gap-0 pt-6">
            <SkeletonRepeat
              count={activityRowCount}
              render={(row) => (
                <div key={row}>
                  {row > 0 ? <Separator className="my-0" /> : null}
                  {/* matches activity row: size-9 icon + text */}
                  <div className="flex gap-3 py-3">
                    <Skeleton className="size-9 shrink-0 rounded-2xl" />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <Skeleton className="h-[14px] w-full max-w-xs rounded-[3px]" />
                      <Skeleton className="h-[10px] w-20 rounded-[3px]" />
                    </div>
                  </div>
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2" size="sm">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-[14px] w-28 rounded-[3px]" />
              <Skeleton className="h-[11px] w-44 rounded-[3px]" />
            </div>
            <Skeleton className="h-8 w-20 shrink-0 rounded-md" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-6">
            {/* pipeline rows: matches PipelineRow — rounded-lg border h ~ 4.5rem */}
            <SkeletonRepeat
              count={3}
              render={(i) => (
                <Skeleton key={i} className="h-[4.5rem] w-full rounded-lg" />
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/features/dashboard/skeletons.tsx
git commit -m "feat(ui): dashboard skeleton — match real component dimensions exactly (8px radius, correct heights)"
```

---

### Task 6: KPI Cards — Delta Chip Colors

**Files:**
- Modify: `components/features/dashboard/kpi-cards.tsx`

- [ ] **Step 1: Update the positive delta Badge classes**

In `DashboardKpiCards`, find the positive delta Badge and update from emerald to brand-blue tint (matches spec status table):

Change:
```tsx
className={cn(
  "w-fit gap-1 border-0 font-normal",
  revenueChangePct !== null && revenueChangePct >= 0
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500"
    : "bg-destructive/10 text-destructive"
)}
```
To:
```tsx
className={cn(
  "w-fit gap-1 border-0 font-medium text-xs",
  revenueChangePct !== null && revenueChangePct >= 0
    ? "bg-primary/8 text-primary"
    : "bg-destructive/8 text-destructive"
)}
```

- [ ] **Step 2: Tighten KPI card heading size**

In each `<CardTitle>` in the KPI cards, add consistent muted styling:

Change all four instances of:
```tsx
<CardTitle className="text-sm font-medium text-muted-foreground">
```
To:
```tsx
<CardTitle className="text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
```

- [ ] **Step 3: Update KPI value typography**

In each `<p className="font-heading text-3xl font-semibold tabular-nums tracking-tight">`, change to:
```tsx
<p className="text-[22px] font-bold tabular-nums tracking-tight text-foreground leading-none mt-1">
```

- [ ] **Step 4: Commit**

```bash
git add components/features/dashboard/kpi-cards.tsx
git commit -m "feat(ui): KPI cards — brand-blue delta chips, uppercase labels, tighter type"
```

---

### Task 7: Finance Skeleton — Fix Hero + Sizing

**Files:**
- Modify: `components/features/finance/skeletons.tsx`

- [ ] **Step 1: Remove hero banner from finance skeleton, match real finance page header**

In `FinancePageSkeleton`, replace the gradient hero div:

Change:
```tsx
<div className="relative shrink-0 rounded-3xl border border-border/60 bg-gradient-to-br from-muted/40 via-background to-background px-4 py-6 md:overflow-hidden md:px-8 md:py-10">
  <div aria-hidden className="pointer-events-none absolute -end-24 -top-24 hidden size-72 rounded-full bg-primary/[0.07] blur-3xl md:block" />
  <div className="relative flex flex-col gap-2">
    <Skeleton className="h-2.5 w-16" />
    <Skeleton className="h-9 w-full max-w-xs md:h-10" />
    <Skeleton className="h-4 w-full max-w-xl" />
  </div>
</div>
```

With (matches the real finance page header pattern):
```tsx
<div className="flex flex-col gap-1">
  <Skeleton className="h-[10px] w-16 rounded-[3px]" />
  <Skeleton className="h-7 w-36 rounded-[4px] md:h-8" />
</div>
```

- [ ] **Step 2: Fix finance KPI card skeleton to match real finance KPI card**

The existing KPI skeleton uses `rounded-lg border-l-[3px]` which matches the finance KPI card style. Keep that structure. Only update the internal skeleton heights to match real content:

Change:
```tsx
<Skeleton className="h-[1.6rem] w-32" />
<Skeleton className="mt-2 h-[11px] w-32" />
```
To:
```tsx
<Skeleton className="h-7 w-32 rounded-[4px]" />
<Skeleton className="mt-2 h-[10px] w-28 rounded-[3px]" />
```

- [ ] **Step 3: Commit**

```bash
git add components/features/finance/skeletons.tsx
git commit -m "feat(ui): finance skeleton — remove gradient hero, match real KPI dimensions"
```

---

### Task 8: Tasks + Expenses + Clients Skeletons — Radius Fix

**Files:**
- Modify: `components/features/tasks/skeletons.tsx`
- Modify: `components/features/expenses/skeletons.tsx`
- Modify: `components/features/clients/skeletons.tsx`

- [ ] **Step 1: Fix tasks skeleton KPI block**

In `components/features/tasks/skeletons.tsx`, find:
```tsx
<div className="grid gap-4 sm:grid-cols-3">
  {Array.from({ length: 3 }).map((_, i) => (
    <Skeleton key={i} className="h-[7.5rem] w-full rounded-lg" />
  ))}
</div>
```

Replace with Card skeletons that match the actual KPI card layout:
```tsx
<div className="grid gap-4 sm:grid-cols-3">
  {Array.from({ length: 3 }).map((_, i) => (
    <Card key={i} size="sm">
      <CardHeader className="pb-2">
        <Skeleton className="h-[10px] w-20 rounded-[3px]" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0">
        <Skeleton className="h-7 w-16 rounded-[4px]" />
        <Skeleton className="h-[10px] w-24 rounded-[3px]" />
      </CardContent>
    </Card>
  ))}
</div>
```

Add `Card, CardHeader, CardContent` to the imports at the top if not already present.

- [ ] **Step 2: Fix expenses skeleton row height**

In `components/features/expenses/skeletons.tsx`, change:
```tsx
{Array.from({ length: 6 }).map((_, i) => (
  <Skeleton key={i} className="h-12 w-full" />
))}
```
To:
```tsx
{Array.from({ length: 6 }).map((_, i) => (
  <Skeleton key={i} className="h-[3.25rem] w-full rounded-[6px]" />
))}
```

- [ ] **Step 3: Fix clients skeleton table container**

In `components/features/clients/skeletons.tsx`, find:
```tsx
<div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm ring-1 ring-border/50">
```
Change to:
```tsx
<div className="overflow-hidden rounded-lg border border-border bg-card">
```

- [ ] **Step 4: Commit**

```bash
git add components/features/tasks/skeletons.tsx components/features/expenses/skeletons.tsx components/features/clients/skeletons.tsx
git commit -m "feat(ui): tasks/expenses/clients skeletons — match 8px radius, correct row heights"
```

---

### Task 9: Final Build + Smoke Test

- [ ] **Step 1: Run tests**

```bash
cd /Users/junaidparamberi/projects/CraftlyAi/craftlyai && npm run test 2>&1 | tail -10
```
Expected: all existing tests pass.

- [ ] **Step 2: Run build**

```bash
npm run build 2>&1 | tail -20
```
Expected: compiled successfully.

- [ ] **Step 3: Lint check**

```bash
npm run lint 2>&1 | grep -v "warning" | tail -20
```
Expected: no new errors.

- [ ] **Step 4: Merge commit**

```bash
git checkout dev && git merge feat/premium-ui --no-ff -m "feat(ui): premium design system — Ink+White, Inter, brand blue, flat cards, matched skeletons"
git branch -d feat/premium-ui
```
