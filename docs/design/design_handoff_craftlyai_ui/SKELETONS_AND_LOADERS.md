# SKELETONS_AND_LOADERS.md — Loading-state Policy

Two families. Pick exactly one per surface. Never combine.

| Family | When | Component |
|---|---|---|
| **Skeleton** | Low-energy shimmer placeholder while we wait for **fetched data**. Shape mirrors the final layout. | `Skeleton*` |
| **Loader** | Active indicator while **known work** runs (save, send, refresh, AI call). | `Spinner`, `DotPulse`, `ProgressIndeterminate`, `AIThinking`, `InlineLoader`, `ButtonLoading` |

> **400ms rule**: if the wait will likely exceed 400ms, show one of the above. Below that, just render.

---

## When to reach for a skeleton

- Initial page load — server data hasn't arrived.
- Route transition that fetches data.
- The final layout is **known** so the skeleton can mirror it (no CLS).
- Multiple regions of a page are loading independently — give each its own skeleton.

## When to reach for a loader

- The user triggered the work (save, send, refresh, submit).
- Background sync (use `ProgressIndeterminate`, not a spinner).
- An AI task is running (use `AIThinking` — NEVER a plain spinner for AI).
- Inside a button (use `ButtonLoading`, keep the label width).
- Awaiting another user's reply / typing indicator (use `DotPulse`).

---

## Skeleton primitives

All in `reference/src/components/skeletons.jsx`.

### `<Skeleton />` — the base block

```jsx
<Skeleton w="60%" h={12} r={4} />
<Skeleton variant="text" />        // height 12, radius 4
<Skeleton variant="textLg" />      // height 18, radius 5
<Skeleton variant="circle" w={32} h={32} />
<Skeleton variant="block" h={56} />
<Skeleton pulse />                 // softer pulse instead of shimmer
```

CSS: `--bg-subtle` base, gradient sweep `transparent → rgba(0,0,0,0.04) → transparent` over 220% width. Animation `shimmer 1.4s ease-in-out infinite`. Dark theme uses `rgba(255,255,255,0.045)`.

### `<SkeletonText lines={3} lastWidth="62%" />`

Paragraph placeholder. Last line shorter by default.

### `<SkeletonAvatar size={28} />`

Just a circle.

### `<SkeletonKPI />`

Mirrors `<KPICard>` exactly: label line, big number row with right-aligned badge, sub-line.

### `<SkeletonChart height={210} />`

SVG silhouette of a calm line+area chart. Pulse instead of shimmer (charts don't shimmer well).

### `<SkeletonList count={5} withAvatar />`

Stack of avatar + two-line rows. Use for activity feeds, notification lists, pane items.

### `<SkeletonListRow withAvatar withMeta />`

Single row variant.

### `<SkeletonTableRow cols={6} />` / `<SkeletonTable rows={5} cols={6} headers={[...]} />`

Drop into `<tbody>`. Column widths follow a built-in distribution (first cell widest, last shortest).

### `<SkeletonCard title body lines={3} height={...} />`

Generic card placeholder with title + body.

---

## Loaders

### `<Spinner size="sm|md|lg|xl" tone="muted|on-accent" />`

Border-style spinner. 0.8s linear. Use `on-accent` inside primary buttons.

### `<DotPulse accent />`

Three dots bouncing. Use for "waiting for a reply" / "indexing" / "syncing".

### `<ProgressIndeterminate />`

3px bar with a 35%-wide accent slug sliding left to right (1.4s). Place at the **top edge** of a table card or page header during background syncs. Calmer than a spinner.

### `<AIThinking label="Drafting reply" size={15} />`

The **brand AI loader**. Sparkle icon pulses; the label text has an accent shimmer gradient travelling through `--fg-3 → --accent → --fg-3`.

Use whenever an AI task is in flight. Never use a plain spinner for AI work. Common labels:

- `Thinking` (generic)
- `Drafting reply`
- `Summarizing`
- `Analyzing project`
- `Reviewing 12 documents`

### `<InlineLoader label="Saving changes" />`

Small spinner + muted label. For inline status next to a form, e.g. autosave.

### `<ButtonLoading loading={isSaving} className="btn btn--primary">…</ButtonLoading>`

Wraps a button. When `loading=true`:
- Children become `visibility: hidden` (width preserved).
- A spinner is positioned absolutely in the center.
- Button is disabled.
- Spinner tone auto-picks `on-accent` for primary buttons, `muted` otherwise.

---

## Anti-patterns

❌ **Layout shift on resolve.** If swapping in real data changes the height, the skeleton was wrong. Match the final dimensions.

❌ **Spinner on an AI task.** Use `AIThinking`. The brand voice depends on it.

❌ **Both skeleton and spinner on the same surface.** Pick one.

❌ **Skeleton on a button.** Buttons use `ButtonLoading`. They never "shimmer".

❌ **Skeleton that doesn't match the final layout.** A KPI loading state must look like a KPI card outline, not a generic grey rectangle.

❌ **Loader for an unknown wait.** If you don't know when it'll finish AND it's user-triggered, show progress via `ProgressIndeterminate`. Don't spin forever.

❌ **Animating loaders during reduced-motion.** Respect `prefers-reduced-motion: reduce` — fall back to a static low-opacity state. (Add this to `app.css` in your target project; the reference has it as a TODO.)

---

## Patterns in context

### A dashboard route

```jsx
function Dashboard() {
  const { data, loading } = useDashboardData();
  return (
    <div className="page">
      <PageHeader />

      {/* KPI grid */}
      <div className="kpi-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)
          : <>
              <KPICard kpi={data.revenue} />
              <KPICard kpi={data.outstanding} />
              <KPICard kpi={data.overdue} />
              <KPICard kpi={data.avgPay} />
            </>
        }
      </div>

      {/* Chart */}
      <Card title="Revenue">
        {loading ? <SkeletonChart height={210} /> : <AreaChart data={data.revenueByMonth} height={210} />}
      </Card>

      {/* Table */}
      <Card title="Active pipeline">
        <table className="table">
          <thead>…</thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={6} />)
              : data.pipeline.map(p => <PipelineRow key={p.id} p={p} />)}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
```

### A "save" button

```jsx
const [saving, setSaving] = useState(false);

<ButtonLoading
  className="btn btn--primary"
  loading={saving}
  onClick={async () => {
    setSaving(true);
    try { await save(); } finally { setSaving(false); }
  }}
>
  <Icon.Send size={13} />
  Send invoice
</ButtonLoading>
```

### An AI generation panel

```jsx
{aiPending ? (
  <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 10 }}>
    <AIThinking label="Drafting follow-up" />
  </div>
) : (
  <DraftEditor draft={draft} />
)}
```

### A background sync

```jsx
<div className="card">
  {syncing && <ProgressIndeterminate style={{ borderRadius: "12px 12px 0 0" }} />}
  <div className="card__header">…</div>
  …
</div>
```

---

## Reduced motion

Add to `app.css` in the target project:

```css
@media (prefers-reduced-motion: reduce) {
  .skeleton,
  .skeleton--pulse,
  .progress-indet::after,
  .spinner,
  .dot-pulse > span,
  .ai-thinking__text,
  .ai-thinking__icon {
    animation: none !important;
  }
  .skeleton { background-image: none; opacity: 0.7; }
  .progress-indet::after { left: 0; width: 100%; opacity: 0.6; }
}
```
