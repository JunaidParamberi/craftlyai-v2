# MIGRATION.md — Retrofitting an Existing Codebase

A phased plan to apply CraftlyAI to a project that already has UI. **Do not skip phases.** Each phase ships independently; the app should remain usable between phases.

> Read this top-to-bottom before starting. Then ask Claude Code to execute one phase at a time using the prompts in `PROMPTS.md`.

---

## Phase 0 — Foundation (no visual change yet)

Goal: get tokens + fonts + theme switching in place. Nothing should look different yet beyond color/typography drift toward the new palette.

1. Copy `reference/styles/tokens.css` into the target project (e.g. `app/globals.css` import or `src/styles/tokens.css`).
2. Ensure it loads before all other CSS.
3. Load fonts:
   - Next.js: `next/font/google` for `Inter`, `Inter_Tight`, `JetBrains_Mono`.
   - Vite: `<link>` to Google Fonts in `index.html`.
4. Wire theme: set `data-theme="light|dark"` on `<html>`, persist in `localStorage`, expose a `useTheme()` hook or context.
5. If using **shadcn/ui**: paste the variable mapping from `SYSTEM.md → shadcn/ui variable mapping` into `globals.css`. Existing shadcn components instantly pick up the system.
6. If using **Tailwind**: extend `theme.extend.colors` with semantic names mapped to the CSS vars (e.g. `bg-canvas: 'var(--bg-canvas)'`, `text-fg: 'var(--fg)'`, `bg-accent: 'var(--accent)'`).

**Done when:** rotating `data-theme` in DevTools changes app colors; fonts have loaded; no console errors.

---

## Phase 1 — Shell

Goal: app uses the 3-column rail + pane + topbar layout.

1. Build `<Rail>`, `<Pane>`, `<Topbar>` from `reference/src/app.jsx`.
2. Define the `SECTIONS` and `PANES` map for the target product's navigation. Match the same shape (id, icon, label, route, optional count, optional pinned).
3. Wire route → section mapping so the correct pane opens when a deep link is hit.
4. Move existing nav into this shell.

**Done when:** every existing page is reachable from the new shell, breadcrumbs render, theme toggle works in topbar.

---

## Phase 2 — Primitives swap

Replace existing low-level UI with system primitives, one type at a time:

1. **Button.** Replace all button variants with `.btn` + variant + size modifiers (or shadcn `<Button>` if mapped). Audit hover/focus/disabled.
2. **Input + textarea + select.** Replace with `.input`. Use `.field` + `.field__label` for label stacking.
3. **Card.** Replace any "panel" / "box" / "tile" container with `.card` + `.card__header` / `.card__body` / `.card__footer`.
4. **Badge.** Replace status pills with `<StatusBadge status="…">` for canonical mapping; raw `.badge--variant` for one-offs.
5. **Avatar.** Replace any "user circle" with `<Avatar name size>`.
6. **Tabs.** Replace tab strips with `.tabs` + `.tabs__item`.

**Done when:** primitives across the app all derive from `tokens.css`. No hex codes outside `tokens.css`.

---

## Phase 3 — Page-level components

1. **KPI tiles** → `<KPICard kpi={…}>`.
2. **Charts** → `<AreaChart>` + `<MiniBars>`. Match the data shape (`{m: "Jan", v: 23000}` for area; flat number array for bars).
3. **Tables** → `.table` + `.table--card` wrapper. Add hover row, sticky thead.
4. **Progress** + **health rings** in cards / table cells.
5. **Empty states** — every list / table needs the pattern from `COMPONENTS.md → Empty state`.

**Done when:** every dashboard, list, and detail page looks like the reference.

---

## Phase 4 — Loading states (CRITICAL)

Audit every async surface in the app. For each:

1. Does it have a skeleton matching the final layout? If no → add it from `SKELETONS_AND_LOADERS.md`.
2. Does it have an empty state with one-line explanation + primary action? If no → add it.
3. Does it have an error state? If no → add toast or inline error card.
4. Buttons that submit/send: do they use `<ButtonLoading>`? If no → wrap them.
5. AI-flagged surfaces: do they use `<AIThinking>` (not spinner)? If no → swap.
6. Background syncs: do they use `<ProgressIndeterminate>` at the card top? If no → add.

Build a checklist of every async region in the app (Claude Code can generate this — see `PROMPTS.md → Audit loading states`). Knock it down one card at a time.

**Done when:** no surface in the app shows a spinner mid-fetch where a skeleton would match the final layout. No AI feature shows a plain spinner.

---

## Phase 5 — AI surfaces

1. **Cmd+K palette.** Port `reference/src/components/cmdk.jsx`. Populate with the target product's navigation + actions + recent items.
2. **Ask AI button.** Add to topbar (`<Icon.Sparkles> Ask AI ⌘K`). Triggers the same palette.
3. **AI sidekick strip.** If the target product has a "today's summary" or "what changed" surface, render it with the accent-gradient strip pattern from `reference/src/screens/dashboard.jsx`.
4. **AI thinking everywhere AI runs.** Audit existing AI features.

**Done when:** AI is visibly first-class — there's a clear way to invoke it from anywhere (Cmd+K) and a consistent indicator when it runs.

---

## Phase 6 — Dark theme audit

1. For every screen, switch to dark and screenshot.
2. Look for:
   - Contrast failures (anything below WCAG AA).
   - Hardcoded `#fff` / `#000` / theme-specific values that didn't come through tokens.
   - Shadow heaviness — dark theme shadows are more pronounced; check they don't feel like punched holes.
   - Borders fading into the canvas — should be `--border` which is tuned to be visible in both themes.
3. Fix violations by routing through tokens.

**Done when:** the app looks deliberate (not just inverted) in dark mode.

---

## Going forward

Once Phase 0–6 are done, the **`CLAUDE.md`** file at the project root keeps the system enforced. Every new feature is built against it. Every new screen ships with skeletons, empty states, error states, and dual themes.

If a new use case truly needs a new primitive (e.g. a calendar component, a kanban board), add it by:
1. Designing in the reference HTML / Storybook first.
2. Extending `tokens.css` ONLY if a new token is genuinely needed.
3. Documenting in `COMPONENTS.md`.
4. Building in the codebase.

Never invent visuals directly in product code.

---

## Common gotchas

- **Inter Tight vs Inter.** They have similar metrics but the tight variant is for display only. Don't use Inter Tight for body text.
- **Letter-spacing on display text.** Negative tracking (`-0.02em` to `-0.03em`) is what makes the type feel "designed" — if you forget, headings will look mushy.
- **`tabular-nums` on numbers in tables.** Without it, columns of dollar amounts will jitter.
- **`box-sizing: border-box`** is assumed everywhere (set in `app.css`). If you're embedding into a codebase that doesn't have this globally, scope it to your wrapper.
- **CSS resets.** Don't import a heavy reset — `app.css` does just enough (`* { box-sizing }`, `body { margin: 0 }`, font-smoothing). Heavy resets fight the system.
- **Dark theme must be opt-in.** Don't auto-flip based on OS — wait until users toggle.
- **Don't tweak `--accent`.** It's been balanced against the rest of the system. If a feature really needs a different tint, use one of the semantic colors (`--info`, `--warning`).
