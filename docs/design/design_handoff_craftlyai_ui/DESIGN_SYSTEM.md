# CraftlyAI Design System — Project Rules

This project uses the **CraftlyAI design system**. Every UI change, retrofit, or new feature MUST follow these rules. They are non-negotiable defaults. If you need to deviate, ask first.

> **Where to look:** the full spec lives in `docs/design/`:
> - `SYSTEM.md` — tokens, type, spacing, motion, theming
> - `COMPONENTS.md` — component catalog
> - `SKELETONS_AND_LOADERS.md` — loading-state policy
> - `MIGRATION.md` — phased plan for retrofitting existing screens
> - `reference/` — the canonical HTML/CSS/JSX source. When in doubt, READ THIS.

## Read-before-coding rule

Before touching any UI file, read:
1. This `CLAUDE.md`
2. `docs/design/SYSTEM.md` (always)
3. The relevant section of `docs/design/COMPONENTS.md`
4. The matching file under `docs/design/reference/` for the component you are recreating

Do not infer styling from the existing codebase if it diverges from the system — the system wins, and existing code is what we're migrating.

## Hard rules (never violate)

1. **Colors come from `tokens.css`.** Never hand-write hex codes in components. If a color is missing from the token set, add it to `tokens.css` and reuse — don't inline it.
2. **No pure black, no pure white.** Foreground is `#14161A` (light) / `#ECEDEF` (dark). Surfaces are `#FBFBF9` canvas + `#FFFFFF` card (light) / `#0E0F12` canvas + `#16181C` card (dark).
3. **Accent is muted blue `#3550E0`** (light) / `#6E83F0` (dark). One accent only.
4. **Type:** Inter Tight (display) + Inter (body) + JetBrains Mono (code). Display headings use `letter-spacing: -0.018em` to `-0.03em`. Never use system-ui as a primary stack.
5. **Spacing is a 4px base.** Use `var(--space-N)` only. No arbitrary values like `margin: 13px`.
6. **Radius:** `xs 4 · sm 6 · md 8 · lg 12 · xl 16 · 2xl 20`. Soft, never sharp.
7. **Borders are always 1px solid `--border`.** No double borders. No 2px+ borders.
8. **Cards:** `--shadow-xs` at rest, `--shadow-sm` on hover. Never heavier than `--shadow-lg` unless it's a modal/dialog.
9. **Icons:** Lucide React with `strokeWidth={1.6}`. Default size 14–16px in dense UI, 18–22px in headers.
10. **Buttons:** 30px default height, 26px sm, 38px lg. 6px gap between icon and label. See `COMPONENTS.md → Button`.
11. **Focus state:** 3px outer ring (`--accent-ring`) + 1px `--border-focus` border. Apply via `box-shadow`, not `outline`.
12. **Motion:** all transitions use `var(--ease-out)` = `cubic-bezier(0.16, 1, 0.3, 1)` at `var(--dur-base)` = 200ms. Never spring-bounce. Never longer than 400ms for UI moves.
13. **Light + dark themes both required.** Toggle via `data-theme="light|dark"` on `<html>`. Never hardcode theme-specific values.

## Loading states (mandatory)

Every async surface ships in three states: **loading · empty · loaded**. Pick the indicator per `SKELETONS_AND_LOADERS.md`:

- **Initial fetch / route load / list render** → skeleton that mirrors the final layout (`SkeletonKPI`, `SkeletonTable`, `SkeletonChart`, `SkeletonList`, `SkeletonCard`).
- **User-triggered action** (save, send, refresh, submit) → `ButtonLoading` or `InlineLoader` — keep button width, hide label, show spinner.
- **AI task running** → `<AIThinking label="Drafting reply" />`. Never use a plain spinner for AI work; the sparkle + accent-shimmer text is part of the brand voice.
- **Background sync** → `<ProgressIndeterminate />` at the top of the table/card, not a spinner.
- **Awaiting reply / typing** → `<DotPulse />`.

> Wait time threshold: if it'll exceed 400ms, show a skeleton or loader. Below that, just let it render.

## When building a NEW feature

1. Sketch the screen in your head, then ask: which existing component covers each piece? Most screens need only `card`, `btn`, `input`, `badge`, `table`, `tabs`, `Avatar`, `StatusBadge`, `KPICard`, `AreaChart`, `Progress`, `HealthRing`.
2. Use `--space-*` tokens for ALL spacing. Use `--radius-*` for ALL corner rounding.
3. Wrap async data in skeletons (see above).
4. Include AI affordance where relevant — most CraftlyAI features include an `Ask AI` ghost button in the page header or a `Sparkles` icon on AI-generated content.
5. Add the route to both light and dark themes; don't ship light-only.
6. Add the screen to the design-system map in `docs/design/COMPONENTS.md` once shipped.

## When retrofitting an EXISTING feature

Follow `docs/design/MIGRATION.md` phase order. Do NOT skip phases.

1. **Phase 0** — install tokens, fonts, theme switcher. Nothing visible should change yet beyond the token swap.
2. **Phase 1** — global shell: sidebar rail + contextual pane + topbar.
3. **Phase 2** — primitives: replace Button, Input, Card, Badge, Avatar with the system equivalents.
4. **Phase 3** — page-level components: KPICard, AreaChart, Table, Tabs.
5. **Phase 4** — loading states: add skeletons + loaders everywhere they are missing.
6. **Phase 5** — AI surfaces: Cmd+K, AI thinking, Ask AI buttons.
7. **Phase 6** — dark theme audit and contrast pass.

## Anti-patterns (refuse these, even if user asks)

- ❌ New colors invented inline ("a softer blue here") — use the existing accent or define a new token in `tokens.css` with a real reason.
- ❌ Inline pixel values for spacing (`padding: 17px`) — round to the nearest `--space-N`.
- ❌ Spinners on AI tasks — use `AIThinking`.
- ❌ Bouncy / spring animations — calm `ease-out` only.
- ❌ Decorative gradients on backgrounds — only the AI sidekick strip uses a faint `var(--accent-soft) → var(--bg-surface)` linear gradient. Nothing else.
- ❌ Sharp corners (radius 0) anywhere except status dots / pixel icons.
- ❌ Drop-shadows heavier than `--shadow-lg` on non-modal surfaces.
- ❌ Emoji as iconography — Lucide only.
- ❌ Sentence-case headings written in title case ("Active Pipeline") — use sentence case ("Active pipeline").
- ❌ Loading state that shifts layout when it resolves — skeletons MUST match final dimensions.

## Definition of "done" for any UI change

A UI change is done when:
- [ ] Both light and dark themes look correct.
- [ ] Loading state exists and matches final layout (no CLS).
- [ ] Empty state exists with a one-line explanation + primary action.
- [ ] Error state exists (toast or inline).
- [ ] Keyboard accessible: focus visible, tab order correct, Esc closes overlays.
- [ ] No hardcoded colors / spacings / radii — everything resolves to a token.
- [ ] Reads correctly at 1280px and 1920px wide.

## How to ask Claude Code for design work

Always frame the request with the screen name and the system. Examples:

- *"Add skeletons to the Clients table. Match the pattern in `docs/design/reference/src/screens/dashboard.jsx` line ~165."*
- *"Build a new Reports screen following `COMPONENTS.md`. Use KPICard + AreaChart + Tabs. Skeleton states required."*
- *"Audit the Settings page against `SYSTEM.md` and list every token violation."*

Avoid: *"make it nicer"*, *"more modern"*, *"use a cool blue"* — these invite drift.
