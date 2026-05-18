# COMPONENTS.md — Catalog

Every component below is implemented in `reference/`. When recreating in the target codebase, match the API, the markup shape, and the CSS rules. Use the project's existing component library if it has equivalents (shadcn/ui, Mantine, MUI) — just remap their tokens via the shadcn mapping in `SYSTEM.md`.

---

## Button — `.btn`

**Variants:** `primary` · `secondary` · `ghost` · `danger`
**Sizes:** default 30px · `sm` 26px · `lg` 38px · `icon` square

```jsx
<button className="btn btn--primary">Save</button>
<button className="btn btn--secondary"><Icon.Download size={13} />Download</button>
<button className="btn btn--ghost btn--sm">Cancel</button>
<button className="btn btn--danger">Delete</button>
<button className="btn btn--secondary btn--icon"><Icon.More size={14} /></button>
```

Rules:
- 6px gap between icon and label.
- Icons are 13px in `sm`/default, 15px in `lg`.
- `:focus-visible` → 3px `--accent-ring`.
- Loading state: see `SKELETONS_AND_LOADERS.md → ButtonLoading`.

---

## Input — `.input`

Default 32px height; `lg` 38px.

```jsx
<div className="field">
  <label className="field__label">Client name</label>
  <input className="input" placeholder="Hawthorn & Co" />
</div>
```

Rules:
- Border `--border`, focus `--border-focus` + 3px `--accent-ring`.
- Placeholder color `--fg-3`.
- Textarea: same class, `padding: 8px 10px`, `resize: vertical`, `min-height: 80px`.
- Select trigger looks like an input with a `ChevronDown` 13px on the right.

---

## Card — `.card`

```jsx
<section className="card">
  <div className="card__header">
    <div className="card__title">Revenue</div>
    <button className="btn btn--ghost btn--sm">…</button>
  </div>
  <div className="card__body">…</div>
  <div className="card__footer">…</div>
</section>
```

Rules:
- `--shadow-xs` rest, `--shadow-sm` hover (when interactive).
- 12px radius. 1px `--border`. Body padding 16px. Header 14px 16px with bottom border.
- Dashed-border variant for `shadcn mapping`-style explainer cards: `borderStyle: dashed`, `background: var(--bg-subtle)`.

---

## Badge — `.badge`

Variants: `success` `warning` `danger` `info` `accent` `outline` + optional `--dot` for leading dot.

```jsx
<span className="badge badge--success badge--dot">Paid</span>
<span className="badge badge--accent">⌘K</span>
<span className="badge badge--outline">Draft</span>
```

Use `<StatusBadge status="paid|sent|draft|overdue|partially_paid|active|planning|on hold|done|todo|in_progress|cancelled|high|med|low|approved" />` — it has the canonical mapping baked in. See `reference/src/components/primitives.jsx`.

---

## Avatar

Deterministic gradient based on the name. Size in pixels.

```jsx
<Avatar name="Lena Marchetti" size={28} />
```

Falls back to initials. 6 hand-tuned palettes; picks one via name hash.

---

## Health ring

Small circular score ring (size default 32px). Tint changes by score band:
- ≥ 80 → success · ≥ 60 → warning · else danger.

```jsx
<HealthRing score={73} size={40} />
```

---

## KPI card

```jsx
<KPICard kpi={{
  label: "Revenue",
  value: "AED 42,180",
  delta: "+12%",
  trend: "up",     // "up" | "down" | "flat"
  sub: "vs last 30 days",
}} delay={2} />
```

Layout: tiny label top, big tabular number, badge with arrow + delta on the right, optional sub-line.

Loading: `<SkeletonKPI />` mirrors this exactly.

---

## Area chart

SVG line-area chart, 600 viewBox-wide, responsive.

```jsx
<AreaChart data={[{m:"Jan", v:23000}, ...]} height={210} />
```

Uses `--accent` for line + soft accent gradient fill. 4 grid lines, dashed `--border`.

Loading: `<SkeletonChart height={210} />`.

---

## Progress bar

```jsx
<Progress value={0.68} tint="var(--accent)" />
```

6px bar, `--bg-subtle` track, animated fill (`--dur-slow`).

For indeterminate: `<ProgressIndeterminate />` (see `SKELETONS_AND_LOADERS.md`).

---

## Mini bars

```jsx
<MiniBars values={[3,5,2,8,4,6,7]} color="var(--accent)" height={28} />
```

Sparkline-style bar chart. Used in row-level summaries (e.g. weekly time per client).

---

## Table — `.table` + `.table--card`

```jsx
<table className="table">
  <thead>
    <tr><th>Project</th>…</tr>
  </thead>
  <tbody>…</tbody>
</table>
```

Wrap with `<div className="card table--card">` for the standard bordered card-table.

Rules:
- TH: 10px 14px, uppercase, letter-spacing 0.05em, `--fg-3`, sticky.
- TD: 12px 14px. Vertical-align middle.
- Hover row: `--bg-subtle`.
- First/last cells get 18px side padding inside `table--card`.
- Tabular numerals on $ values: `font-variant-numeric: tabular-nums`.

Loading: `<SkeletonTableRow cols={6} />` for each placeholder row.

---

## Tabs — `.tabs`

```jsx
<div className="tabs">
  <div className="tabs__item" data-active="true">Overview <span className="tabs__count">8</span></div>
  <div className="tabs__item">Documents <span className="tabs__count">14</span></div>
</div>
```

1.5px underline aligned to the divider. Count pill on the right.

---

## Cmd+K — `.cmdk`

Full implementation in `reference/src/components/cmdk.jsx`. Keyboard:

- `⌘K` / `Ctrl+K` toggles.
- `↑/↓` move selection.
- `Enter` triggers.
- `Esc` closes.

Layout: 640px max-width modal, 12vh from top. Input row → grouped result list → footer with kbd hints + accent AI hint.

---

## Sidebar shell

Three structural pieces, all in `reference/src/app.jsx`:

1. **Rail** (`.rail`) — 56px wide, top: logo + section icons; bottom: settings + ⌘K.
2. **Contextual pane** (`.pane`) — 240px wide, header with title + add button, search box, scrollable body of section items (with optional pinned section), footer with user card.
3. **Topbar** (`.topbar`) — 52px tall, breadcrumb + Ask AI / bell / theme toggle.

Active state: section icon shows a 2px accent left bar; pane item shows `--bg-subtle` background.

---

## Theme toggle — `.theme-toggle`

Compact pill in the topbar with sun/moon segments. Uses `--bg-subtle` track + `--bg-surface` thumb with `--shadow-xs`.

```jsx
<ThemeToggle theme={theme} setTheme={setTheme} />
```

Persist in `localStorage` and apply via `document.documentElement.setAttribute("data-theme", theme)`.

---

## Empty state

Pattern (no dedicated class — compose):

```jsx
<div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
  <div style={{
    width: 48, height: 48, borderRadius: 12, margin: "0 auto 12px",
    background: "var(--bg-subtle)", color: "var(--fg-3)",
    display: "grid", placeItems: "center",
  }}>
    <Icon.Inbox size={22} />
  </div>
  <h3 style={{ fontSize: 17, marginBottom: 4 }}>No invoices yet</h3>
  <p className="dim" style={{ fontSize: 13, maxWidth: 280, margin: "0 auto 16px" }}>
    Create your first invoice from a project, a quote, or from scratch.
  </p>
  <button className="btn btn--primary btn--sm"><Icon.Plus size={12} />New invoice</button>
</div>
```

Required: icon, headline (sentence case), one-line explanation, single primary action.

---

## Skeletons & loaders

See `SKELETONS_AND_LOADERS.md`. Quick links:

- `Skeleton`, `SkeletonText`, `SkeletonAvatar`, `SkeletonKPI`, `SkeletonList`, `SkeletonTableRow`, `SkeletonTable`, `SkeletonChart`, `SkeletonCard`
- `Spinner`, `DotPulse`, `ProgressIndeterminate`, `AIThinking`, `InlineLoader`, `ButtonLoading`

All in `reference/src/components/skeletons.jsx`.

---

## File-by-file map

| File | What's in it |
|---|---|
| `reference/styles/tokens.css` | All color / type / spacing / radius / motion tokens for light + dark |
| `reference/styles/app.css` | Global styles + every component class (`.btn`, `.card`, `.table`, `.cmdk`, etc.) + skeletons + loaders CSS |
| `reference/src/icons.jsx` | Lucide-style icon set, stroke 1.6. Replace with `lucide-react` in target codebase. |
| `reference/src/components/primitives.jsx` | `Avatar`, `StatusBadge`, `KPICard`, `AreaChart`, `MiniBars`, `Progress`, `HealthRing` |
| `reference/src/components/skeletons.jsx` | All skeletons + loaders |
| `reference/src/components/cmdk.jsx` | Cmd+K palette |
| `reference/src/app.jsx` | App shell — rail + pane + topbar + routing |
| `reference/src/screens/design-system.jsx` | Live system reference page |
| `reference/src/screens/dashboard.jsx` | Reference page combining KPI + chart + activity + table |
