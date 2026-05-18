# PROMPTS.md — Copy/paste prompts for Claude Code

Paste these one at a time into Claude Code in the target project. They assume `CLAUDE.md` is at the project root and `docs/design/` contains the rest of this handoff.

---

## 0 — Kickoff / audit

```
Read CLAUDE.md, then docs/design/SYSTEM.md, then docs/design/MIGRATION.md.

Audit this codebase against the CraftlyAI design system. For each file under
src/ (or app/), report:
  - Hardcoded hex colors (should be tokens)
  - Hardcoded pixel spacing not on the 4px grid
  - Buttons / inputs / cards / badges that don't match the system
  - Async surfaces without skeletons / empty / error states
  - AI surfaces using spinners instead of AIThinking
  - Dark-theme-broken styles

Output as a numbered to-do list grouped by migration phase (0–6).
Do NOT change any files yet — wait for me to approve the plan.
```

---

## 1 — Phase 0: install tokens + fonts + theme switch

```
Execute Phase 0 from docs/design/MIGRATION.md:

1. Copy docs/design/reference/styles/tokens.css into the project at
   <best location for this stack>. Import it globally before all other CSS.
2. Load Inter Tight, Inter, JetBrains Mono via the appropriate mechanism
   for this stack.
3. Add a theme provider / hook that sets data-theme on <html> and persists
   to localStorage (default: light).
4. If shadcn/ui is installed, paste the variable mapping from
   docs/design/SYSTEM.md → "shadcn/ui variable mapping" into globals.css.
5. If Tailwind is configured, extend theme.extend.colors with the semantic
   token names.

After: confirm the app builds, fonts load, and toggling data-theme in
DevTools visibly changes colors. Show me the diff.
```

---

## 2 — Phase 1: shell

```
Execute Phase 1: app shell.

Read docs/design/reference/src/app.jsx and docs/design/reference/styles/app.css
for the rail/pane/topbar pattern.

Build <Rail>, <Pane>, <Topbar> components in this codebase using the
existing framework. Wire them into the root layout.

For SECTIONS and PANES, infer the navigation from the existing routes in
this project. Match the data shape exactly (id, icon, label, route, count).
List the inferred structure in chat for me to confirm before wiring.

The topbar must have:
  - Breadcrumb (from current route)
  - "Ask AI" ghost button with Sparkles icon + ⌘K kbd hint (no-op for now)
  - Notification bell (no-op for now)
  - Theme toggle (sun/moon)

Active state: rail icon shows a 2px accent left bar; pane item shows
--bg-subtle background.
```

---

## 3 — Phase 2: primitive swap

```
Execute Phase 2: replace primitives.

For each primitive below, find every existing usage in the codebase and
replace with the system equivalent. Follow docs/design/COMPONENTS.md.
Work through them in order and stop after each for review:

a) Button → .btn with variants primary/secondary/ghost/danger and sizes
   default/sm/lg/icon.
b) Input + textarea + select → .input + .field + .field__label.
c) Card / panel / box → .card + .card__header + .card__body.
d) Status pill / chip → <StatusBadge status="…"> using canonical mapping.
e) User circle / profile picture → <Avatar name size>.
f) Tab strip → .tabs + .tabs__item.

For each, before changing files, list every file that needs editing and
the count of replacements. Wait for my OK.
```

---

## 4 — Phase 3: page-level components

```
Execute Phase 3: page-level components.

Port these reusable components from docs/design/reference/src/components/primitives.jsx
into this codebase:

  KPICard, AreaChart, MiniBars, Progress, HealthRing, StatusBadge, Avatar

Match the API exactly. Use the codebase's preferred component conventions
(default export vs named, .tsx vs .jsx, etc.).

Then replace existing equivalents in the app with these.
```

---

## 5 — Phase 4: loading states (CRITICAL)

```
Read docs/design/SKELETONS_AND_LOADERS.md.

Port docs/design/reference/src/components/skeletons.jsx and the corresponding
CSS block from docs/design/reference/styles/app.css ("=== Skeletons ===" through
"=== Inline loader ===") into this codebase. Match the exported names exactly:

  Skeleton, SkeletonText, SkeletonAvatar, SkeletonKPI, SkeletonListRow,
  SkeletonList, SkeletonTableRow, SkeletonTable, SkeletonChart, SkeletonCard,
  Spinner, DotPulse, ProgressIndeterminate, AIThinking, InlineLoader,
  ButtonLoading

Then audit every async surface in the app. For each route / data fetch:
  - Add a skeleton matching the final layout (no CLS).
  - Add an empty state (icon + headline + 1-line explanation + primary action).
  - Add an error state (inline card or toast).
  - Wrap submit/send buttons in <ButtonLoading>.
  - Use <AIThinking label="…"> instead of spinners on AI features.
  - Use <ProgressIndeterminate> for background syncs.

Produce a checklist of every surface and tick them off one PR at a time.
```

---

## 6 — Phase 5: AI surfaces

```
Execute Phase 5: AI surfaces.

1. Port docs/design/reference/src/components/cmdk.jsx into this codebase.
   Populate the command list with navigation + actions + recent items from
   this project. Hook up ⌘K / Ctrl+K global trigger.

2. Wire the "Ask AI" ghost button in the topbar to open the same palette.

3. If this product has a "today's summary" / "what changed" / "your digest"
   surface, render it as the AI sidekick strip pattern from
   docs/design/reference/src/screens/dashboard.jsx (the strip with
   linear-gradient(135deg, var(--accent-soft), var(--bg-surface) 60%),
   38px accent square, Sparkles icon, message, Review CTA, dismiss).

4. Find every AI-driven loading state in the app and replace with
   <AIThinking label="…">. Pick labels that describe the work:
   "Drafting reply", "Summarizing", "Analyzing project", etc.
```

---

## 7 — Phase 6: dark theme audit

```
Execute Phase 6: dark theme audit.

Switch the app to data-theme="dark" and walk every route. For each:
  - Screenshot.
  - Identify any hardcoded #fff / #000 / non-tokenized colors.
  - Identify contrast failures (WCAG AA = 4.5:1 for body, 3:1 for large).
  - Check that shadows aren't punching holes (dark shadows are heavier
    by design — if it's distracting, drop one shadow level).
  - Check that borders are still visible (--border is tuned for both).

Output a list of fixes by file, then ask for approval before applying.
```

---

## NEW FEATURE — build from scratch in the system

Use this template for upcoming features:

```
I want to build a new <feature name> screen. It should:

  - <user goal 1>
  - <user goal 2>
  - <key data shown>
  - <key actions>

Build it following CraftlyAI:
  1. Read docs/design/SYSTEM.md and docs/design/COMPONENTS.md first.
  2. Compose from existing components — KPICard, AreaChart, .table,
     .tabs, .card, .btn, StatusBadge, Avatar, HealthRing as needed.
  3. Use page padding 28px 32px 80px and max-width 1320px (see .page).
  4. Sentence-case headings only.
  5. Skeleton state matching the final layout (no CLS).
  6. Empty state with icon + headline + 1-line explanation + primary action.
  7. Error state.
  8. Both light AND dark theme.
  9. Page-enter animation via .fade-up + delay-1/2/3/4 on cards.
  10. Include an "Ask AI" affordance in the page header if AI can help here.

Before writing code, sketch the layout in prose: which existing components
sit in which grid cells. Wait for my OK before generating the file.
```

---

## RETROFIT — single existing screen

```
Audit the <screen name> screen at <file path> against the CraftlyAI design
system. Report every violation grouped by:

  - Tokens (hex colors, off-grid spacing, off-scale type)
  - Primitives (buttons / inputs / cards / badges not matching the system)
  - Loading / empty / error states missing
  - AI surfaces using wrong indicator
  - Light/dark theme issues

Then propose a single-file refactor that fixes them all, keeping the
component API and routing untouched. Show me the proposed diff before
writing.
```

---

## QUICK CHECKS — paste anytime

**Color audit:**
```
Find every hardcoded hex color in src/ (excluding node_modules and the
tokens file). For each, suggest the right --token replacement.
```

**Spacing audit:**
```
Find every pixel value used as margin/padding/gap in src/ that is NOT on
the 4px grid. Suggest the nearest --space-N replacement.
```

**Loading audit:**
```
List every component in src/ that conditionally renders based on
loading/isPending/isFetching state. For each, describe what loading
indicator it currently uses and what it SHOULD use per
docs/design/SKELETONS_AND_LOADERS.md.
```

**Skeleton coverage:**
```
For every page-level route in this app, confirm whether the initial-load
state shows a skeleton that mirrors the final layout. List the misses.
```

---

## Tips for working with Claude Code on this

- **Approve plans, not files.** Always ask for a plan first, then approve before writing.
- **One phase at a time.** Don't run Phases 2–6 as a single prompt — it'll miss things.
- **Reference, don't paraphrase.** When in doubt, paste the exact file path from `docs/design/reference/` so Claude reads the canonical source.
- **Keep `CLAUDE.md` updated.** As your team adds genuinely new patterns (calendar, kanban), document them in `CLAUDE.md` so they survive across sessions.
- **The reference is read-only.** Never edit `docs/design/reference/`. If something needs to change in the system, change the canonical mocks first, then re-run the relevant migration prompt.
