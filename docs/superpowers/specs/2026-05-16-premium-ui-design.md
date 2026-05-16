# CraftlyAI Premium UI Design System

**Date:** 2026-05-16  
**Status:** Approved — ready for implementation  
**Scope:** Global design token overhaul + component reskin across all app pages

---

## Design Direction: Ink + White

Dark navy sidebar anchors brand identity. White/light-gray main area keeps content readable. Electric brand blue `#2c5bff` is the single accent color. No gradients, no glass, no decoration — content does the work.

**Inspiration:** Notion, Linear, GitHub — editorial precision over visual novelty.

---

## Color Tokens

Replace all CSS custom properties in `styles/globals.css` `:root` block.

### Light mode

| Token | Value | Usage |
|---|---|---|
| `--background` | `#f5f6fa` | Main content area bg |
| `--foreground` | `#0b1220` | All body text |
| `--card` | `#ffffff` | Card / panel surface |
| `--card-foreground` | `#0b1220` | Text on cards |
| `--popover` | `#ffffff` | Dropdowns, popovers |
| `--popover-foreground` | `#0b1220` | |
| `--primary` | `#2c5bff` | CTAs, active icons, links, accents |
| `--primary-foreground` | `#ffffff` | Text on blue buttons |
| `--secondary` | `#eef1f8` | Secondary button bg |
| `--secondary-foreground` | `#0b1220` | |
| `--muted` | `#f0f2f8` | Muted bg (input fill, hover) |
| `--muted-foreground` | `#8090b0` | Labels, placeholder, meta text |
| `--accent` | `#eef1f8` | Hover state bg |
| `--accent-foreground` | `#0b1220` | |
| `--destructive` | `#ef4444` | Errors, delete, overdue |
| `--border` | `#dde2ef` | All card borders, dividers |
| `--input` | `#dde2ef` | Input border |
| `--ring` | `#2c5bff` | Focus ring |

### Sidebar tokens (separate namespace)

| Token | Value |
|---|---|
| `--sidebar` | `#0b1220` |
| `--sidebar-foreground` | `rgba(255,255,255,0.88)` |
| `--sidebar-primary` | `#2c5bff` |
| `--sidebar-primary-foreground` | `#ffffff` |
| `--sidebar-accent` | `rgba(255,255,255,0.07)` |
| `--sidebar-accent-foreground` | `rgba(255,255,255,0.88)` |
| `--sidebar-border` | `rgba(255,255,255,0.05)` |
| `--sidebar-ring` | `#2c5bff` |
| `--sidebar-muted-foreground` | `rgba(255,255,255,0.28)` |

### Dark mode

Dark mode inverts the main area only. Sidebar stays near-identical (already dark).

| Token | Value |
|---|---|
| `--background` | `#0d1120` |
| `--foreground` | `#e8ecf8` |
| `--card` | `#131a2e` |
| `--card-foreground` | `#e8ecf8` |
| `--border` | `rgba(255,255,255,0.08)` |
| `--input` | `rgba(255,255,255,0.1)` |
| `--muted` | `#1a2240` |
| `--muted-foreground` | `#6070a0` |
| `--primary` | `#4d78ff` | Slightly lighter for dark bg contrast |

---

## Typography

### Font

Replace system-ui stack with Inter from Google Fonts (or `next/font/google`).

```tsx
// app/layout.tsx
import { Inter } from "next/font/google"
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
```

No separate heading font — Inter at `font-weight: 700` + `letter-spacing: -0.02em` handles headings.

### Scale

| Role | Size | Weight | Tracking |
|---|---|---|---|
| Page title (h1) | `1.25rem` (20px) | 700 | `-0.02em` |
| Section heading (h2) | `1rem` (16px) | 700 | `-0.01em` |
| Card title | `0.875rem` (14px) | 600 | `0` |
| Body / table | `0.875rem` (14px) | 400 | `0` |
| Label / meta | `0.75rem` (12px) | 500 | `0` |
| Uppercase label | `0.625rem` (10px) | 600 | `0.05em` + `uppercase` |
| KPI value | `1.375rem` (22px) | 700 | `-0.02em` + `tabular-nums` |

---

## Shape

| Element | Radius |
|---|---|
| Cards / panels | `8px` (`--radius: 0.5rem`) |
| Buttons (md) | `7px` |
| Badges / chips | `4px` |
| Inputs | `7px` |
| Avatars | `50%` |
| Nav items | `7px` |
| Popovers / dropdowns | `10px` |

**No shadows on cards.** Border `1px solid var(--border)` only. Elevation is expressed by color contrast between `--background` (#f5f6fa) and `--card` (#ffffff), not box-shadow.

---

## Sidebar

### Structure

Full-width labeled nav (not icon-only). Width: `200px` collapsed → responsive icon-only at `< md`.

```
[logo mark] [Craftly wordmark]

WORK
  [icon] Dashboard       ← active state
  [icon] Clients
  [icon] Projects
  [icon] Tasks
  [icon] Time

BUSINESS
  [icon] Finance
  [icon] Documents
  [icon] Expenses

────────────────────
[avatar] Name · Plan
```

### Active state: Subtle Tint

```css
/* inactive */
color: rgba(255,255,255,0.35);
background: transparent;

/* active */
color: rgba(255,255,255,0.9);
font-weight: 600;
background: rgba(255,255,255,0.07);
border-radius: 7px;

/* active icon */
background: #2c5bff;  /* icon turns brand blue */
```

No left border stripe. No pill fill. Icon is the only blue element on active state.

### Section labels

```css
font-size: 9px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.1em;
color: rgba(255,255,255,0.22);
```

---

## Header

Sticky, `52px` tall, `backdrop-filter: blur(8px)`.

- Left: `SidebarTrigger`
- Center: Search bar — white bg, `--border` border, `7px` radius, `⌘K` kbd chip
- Right: `ThemeToggle` → `NotificationBell` → avatar dropdown

Header background: `rgba(245,246,250,0.85)` light / `rgba(13,17,32,0.85)` dark.

---

## Cards / KPI Cards

```css
background: var(--card);           /* white */
border: 1px solid var(--border);   /* #dde2ef */
border-radius: 8px;
box-shadow: none;
padding: 14px;
```

KPI value typography: `22px / 700 / tabular-nums / letter-spacing: -0.02em`

Status delta chips (inside KPI cards):

| State | Bg | Text |
|---|---|---|
| Positive | `rgba(44,91,255,0.08)` | `#2c5bff` |
| Warning | `rgba(245,158,11,0.10)` | `#d97706` |
| Danger | `rgba(239,68,68,0.08)` | `#dc2626` |
| Success | `rgba(34,197,94,0.08)` | `#16a34a` |

---

## Skeleton Loaders

**Critical rule:** Skeleton must match the real component exactly — same border-radius, same heights, same grid columns, same padding. A skeleton that renders at a different size causes layout shift.

### Skeleton base style

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--muted) 25%,
    color-mix(in oklch, var(--muted) 85%, var(--primary)) 50%,
    var(--muted) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: inherit;  /* inherit from container */
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Skeleton rules per component

| Component | Skeleton radius | Skeleton height |
|---|---|---|
| KPI card | `8px` (matches card) | full card height — same grid |
| Panel / table card | `8px` | same height as real panel |
| KPI value line | `4px` | `22px` (matches `kpi-val` font-size) |
| KPI label line | `3px` | `10px` |
| KPI delta chip | `4px` | `18px` |
| Table row | `4px` | `36px` (matches `tr` height) |
| Badge | `4px` | `20px` |
| Avatar | `50%` | `28px × 28px` |
| Page title | `4px` | `20px` |

### Skeleton grid must match real grid

```tsx
// Example: KPI skeletons — must use same grid as real KpiCards
<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  {Array.from({ length: 4 }).map((_, i) => (
    <Card key={i} size="sm">   {/* same Card component, same size prop */}
      <CardHeader className="pb-2">
        <Skeleton className="h-[10px] w-24 rounded-[4px]" />
      </CardHeader>
      <CardContent className="pt-0 flex flex-col gap-3">
        <Skeleton className="h-[22px] w-32 rounded-[4px]" />  {/* matches kpi-val */}
        <Skeleton className="h-[18px] w-20 rounded-[4px]" />  {/* matches delta chip */}
      </CardContent>
    </Card>
  ))}
</div>
```

---

## Attention Banner

```css
background: white;
border: 1px solid #fbbf24;
border-left: 3px solid #f59e0b;
border-radius: 8px;
padding: 10px 14px;
```

---

## Buttons

| Variant | Bg | Text | Border |
|---|---|---|---|
| Primary (default) | `#2c5bff` | white | none |
| Secondary | `#eef1f8` | `#0b1220` | none |
| Outline | white | `#0b1220` | `1px #dde2ef` |
| Ghost | transparent | `#0b1220` | none |
| Destructive | `#ef4444` | white | none |

Border-radius: `7px`. Height: `36px` (md), `32px` (sm). Font: `13px / 600`.

---

## Status Badges

Used in invoice tables, project lists, task lists.

| Status | Bg | Text | Radius |
|---|---|---|---|
| Draft | `rgba(128,144,176,0.12)` | `#6070a0` | `4px` |
| Sent | `rgba(44,91,255,0.08)` | `#2c5bff` | `4px` |
| Paid | `rgba(34,197,94,0.08)` | `#16a34a` | `4px` |
| Overdue | `rgba(239,68,68,0.08)` | `#dc2626` | `4px` |
| Partially paid | `rgba(245,158,11,0.10)` | `#d97706` | `4px` |
| Approved | `rgba(34,197,94,0.08)` | `#16a34a` | `4px` |
| Declined | `rgba(239,68,68,0.08)` | `#dc2626` | `4px` |

---

## Tables

```css
/* header row */
th {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted-foreground);
  border-bottom: 1px solid var(--border);
  padding: 0 12px 10px;
}

/* body rows */
td {
  font-size: 13px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--foreground);
}

tr:last-child td { border-bottom: none; }
tr:hover td { background: var(--muted); }
```

---

## Implementation scope

### Files to change

| File | Change |
|---|---|
| `styles/globals.css` | Replace all `:root` + `.dark` + `--sidebar-*` tokens |
| `app/layout.tsx` | Add `Inter` from `next/font/google`, set `--font-sans` |
| `components/layout/app-sidebar.tsx` | Update active state classes to subtle tint pattern |
| `components/layout/app-header.tsx` | Update search bar, header bg |
| `components/features/dashboard/kpi-cards.tsx` | Update card styles, delta chip colors |
| `components/features/dashboard/skeletons.tsx` | Rebuild to match real component dimensions exactly |
| `components/features/finance/` | Apply token updates (border colors, badge styles) |
| `components/features/tasks/` | Apply table + badge token updates |
| `components/features/expenses/` | Apply token updates |
| `components/features/notifications/` | Apply token updates |
| All `<Badge>` usage | Update variant styles to match new status color table |

### Files NOT to change

- `components/ui/*` — shadcn primitives. Token changes propagate automatically.
- Any migration SQL files.
- Any Edge Function code.

### What does NOT need new components

Token changes in `globals.css` + `Inter` font propagate to all shadcn primitives automatically. Only layout-specific overrides (sidebar active state, skeleton heights, header bg) need targeted class changes.

---

## Definition of done

- [ ] All `:root` tokens replaced in `globals.css`
- [ ] Inter loaded via `next/font/google`
- [ ] Sidebar active state uses subtle tint (no pill fill, no left border)
- [ ] All skeleton loaders match real component radius + height exactly
- [ ] `npm run build` passes
- [ ] `npm run test` passes (no regressions)
- [ ] Visual smoke: dashboard, finance, clients, tasks, documents pages
