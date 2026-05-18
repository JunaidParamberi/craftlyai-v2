# SYSTEM.md — CraftlyAI Design Language

The complete specification. Every value here comes from `reference/styles/tokens.css`. Read that file alongside this doc — it is the source of truth.

---

## 1. Theming

Two themes: **light** and **dark**. Toggle by setting `data-theme="light"` or `data-theme="dark"` on `<html>`. Default to light, persist user choice in `localStorage`.

```html
<html data-theme="light">  <!-- or "dark" -->
```

No "system" auto-mode in v0.1 — explicit toggle in the topbar.

---

## 2. Color tokens

### Surfaces (background hierarchy, lightest → deepest)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg-canvas` | `#FBFBF9` | `#0E0F12` | App background, page body |
| `--bg-surface` | `#FFFFFF` | `#16181C` | Cards, sheets, popovers |
| `--bg-subtle` | `#F4F4F1` | `#1C1F24` | Hover states, inset panels, table header bg |
| `--bg-sunken` | `#EFEFEC` | `#0A0B0E` | Deepest inset (form group bg, code blocks) |
| `--bg-overlay` | `rgba(20, 22, 26, 0.32)` | `rgba(0, 0, 0, 0.6)` | Modal scrim |

### Borders

| Token | Light | Dark | Use |
|---|---|---|---|
| `--border` | `#ECECE7` | `#23262C` | Default 1px borders |
| `--border-strong` | `#D9D9D2` | `#2E3138` | Secondary buttons, table card edge |
| `--border-focus` | `#3550E0` | `#6E83F0` | Focus ring outline |

### Foreground

| Token | Light | Dark | Use |
|---|---|---|---|
| `--fg` | `#14161A` | `#ECEDEF` | Primary text |
| `--fg-2` | `#54585F` | `#9DA2AB` | Secondary text |
| `--fg-3` | `#898E96` | `#6B7079` | Tertiary / placeholder / icon hint |
| `--fg-on-accent` | `#FFFFFF` | `#FFFFFF` | Text on accent-filled surface |

### Accent — muted blue

| Token | Light | Dark | Use |
|---|---|---|---|
| `--accent` | `#3550E0` | `#6E83F0` | Primary button bg, links, focus border |
| `--accent-hover` | `#2D45C8` | `#8194F3` | Primary hover |
| `--accent-press` | `#2638B0` | `#5A71EC` | Primary active |
| `--accent-soft` | `#EAEEFC` | `#1B2244` | Tinted bg for accent badges, AI strip |
| `--accent-soft-2` | `#DCE3F9` | `#232C58` | Selection bg |
| `--accent-ring` | `rgba(53, 80, 224, 0.22)` | `rgba(110, 131, 240, 0.30)` | 3px focus ring |

### Semantic

| Token | Light bg / fg | Dark bg / fg | Use |
|---|---|---|---|
| `--success` / `--success-soft` | `#1F8A52` / `#E6F2EB` | `#3FB87D` / `#15291F` | Paid, done, approved |
| `--warning` / `--warning-soft` | `#B36A12` / `#FAF0DD` | `#E0995E` / `#2A1F0F` | On-hold, deadline soon, partial |
| `--danger`  / `--danger-soft`  | `#C13838` / `#FBE9E9` | `#E76B6B` / `#2A1414` | Overdue, errors, destructive |
| `--info`    / `--info-soft`    | `#2F6FB8` / `#E6EFF8` | `#6FA8E6` / `#14202D` | Sent, neutral status |

### Chart palette

`--chart-1` accent · `--chart-2` accent-light · `--chart-3` accent-fade · `--chart-4` success · `--chart-5` warning. Charts use no more than 5 colors. Series ordering by value desc.

---

## 3. Typography

### Families

```css
--font-display: "Inter Tight", "Neue Haas Grotesk", "Helvetica Neue", system-ui, sans-serif;
--font-body:    "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
--font-mono:    "JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace;
```

Inter Tight weights 500/600/700. Inter weights 400/500/600/700. JetBrains Mono 400/500.

### Scale

| Token | Size | Use |
|---|---|---|
| `--text-xs` | 11px | Tooltips, meta, kbd |
| `--text-sm` | 12.5px | Captions, helper text, table cells |
| `--text-base` | 14px | Default UI text |
| `--text-md` | 15px | Body, card title |
| `--text-lg` | 17px | Section subtitle |
| `--text-xl` | 20px | Card / large title |
| `--text-2xl` | 24px | Section heading |
| `--text-3xl` | 30px | Page title |
| `--text-4xl` | 38px | Hero |
| `--text-5xl` | 52px | Marketing display |
| `--text-6xl` | 72px | Marketing only |

### Tracking

- `--tracking-tight` `-0.02em` — display 4xl+
- `--tracking-snug` `-0.012em` — display xl/2xl/3xl
- `--tracking-normal` `-0.005em` — body
- `--tracking-wide` `0.04em` — eyebrows, uppercase labels

### Weight

- `--weight-regular` 400 · `--weight-medium` 500 · `--weight-semibold` 600 · `--weight-bold` 700.
- Display headings: 600. Never 700 unless extreme emphasis.

### Line height

- `--leading-tight` 1.1 — large display
- `--leading-snug` 1.25 — small display
- `--leading-normal` 1.5 — body
- `--leading-relaxed` 1.65 — long-form

### Casing

- **Sentence case for headings.** "Active pipeline", not "Active Pipeline".
- **UPPERCASE only for eyebrows** with `letter-spacing: 0.08em`, weight 600, size 10.5px, color `--fg-3`.

---

## 4. Spacing

4px base. Use `var(--space-N)` only.

`--space-0` 0 · `--space-1` 4 · `--space-2` 8 · `--space-3` 12 · `--space-4` 16 · `--space-5` 20 · `--space-6` 24 · `--space-7` 28 · `--space-8` 32 · `--space-10` 40 · `--space-12` 48 · `--space-16` 64 · `--space-20` 80 · `--space-24` 96.

**Page-level layout:**
- Page padding: `28px 32px 80px`.
- Section gap: `22–32px`.
- Card-to-card gap: `12–20px`.
- Inside cards: `16px` body padding, `14px 16px` header padding.

**Component-level:**
- Button icon-to-label gap: `6px`.
- Form field row gap: `12px`.
- Row gap between form fields: `16px`.

---

## 5. Radius

`xs 4 · sm 6 · md 8 · lg 12 · xl 16 · 2xl 20 · full 999`.

- Buttons / inputs / badges (small): `md` (8px).
- Cards / sheets / dialogs: `lg` (12px).
- Cmd+K / large modals: `xl` (16px).
- Pills, kbd, avatars: `full`.

---

## 6. Elevation

- `--shadow-xs` — buttons, table rows, default card rest.
- `--shadow-sm` — card hover.
- `--shadow-md` — popovers, dropdowns.
- `--shadow-lg` — sheets, side panels.
- `--shadow-pop` — Cmd+K, dialogs.

Dark theme shadows are markedly heavier; this is intentional and handled in `tokens.css`.

---

## 7. Motion

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--dur-fast: 120ms;  /* hover/press */
--dur-base: 200ms;  /* default transition */
--dur-slow: 320ms;  /* page enter, fade-up */
```

Rules:
- Default transition: `200ms var(--ease-out)`.
- Never spring/bounce.
- Page enter animation: `fade-up` (6px translate + opacity, 320ms).
- Stagger card entries with `delay-1/2/3/4` (40ms steps).
- Skeleton shimmer: 1.4s linear infinite.
- Spinner: 0.8s linear infinite.
- AI thinking text shimmer: 2.2s linear infinite.

---

## 8. Layout shell

The app uses a **3-column grid**: 56px icon rail · 240px contextual pane · 1fr main area, with a 52px topbar inside the main column.

```
--rail-w: 56px;
--pane-w: 240px;
--topbar-h: 52px;
```

Patterns:
- Rail icons are 18px Lucide, centered in 36px round-rect buttons (radius 9px).
- Pane items are 6px 10px padding with 1px margin, radius 7px.
- Active rail/pane item: `--bg-subtle` background with a left rail accent bar (2px, `--accent`).
- Topbar: breadcrumb left, `Ask AI` + bell + theme toggle right.

See `reference/src/app.jsx` for the canonical implementation.

---

## 9. shadcn/ui variable mapping

If the target codebase uses shadcn/ui, edit `globals.css` to alias their variables to ours:

```css
:root {
  --background:          var(--bg-canvas);
  --foreground:          var(--fg);
  --card:                var(--bg-surface);
  --card-foreground:     var(--fg);
  --popover:             var(--bg-surface);
  --popover-foreground:  var(--fg);
  --primary:             var(--accent);
  --primary-foreground:  var(--fg-on-accent);
  --secondary:           var(--bg-subtle);
  --secondary-foreground: var(--fg);
  --muted:               var(--bg-subtle);
  --muted-foreground:    var(--fg-2);
  --accent:              var(--accent-soft);
  --accent-foreground:   var(--accent);
  --destructive:         var(--danger);
  --destructive-foreground: #fff;
  --border:              var(--border);
  --input:               var(--border);
  --ring:                var(--border-focus);
  --radius:              0.5rem; /* 8px = our --radius-md */
}
```

This means shadcn `Button`, `Card`, `Input`, etc. inherit our system without forking.

---

## 10. Iconography

Lucide React. Always:

```jsx
<Icon name strokeWidth={1.6} size={14|16|18|22} />
```

1.6 stroke is a calm, slightly thinner default. Defaults by context:
- Pane / table cells: 13–15
- Buttons: 13–14
- Header / topbar: 15–18
- Empty state hero icon: 22–28

No emoji. No two icon sets.

---

## 11. AI surfaces

The AI sidekick is a first-class brand surface, not a feature flag.

- **Cmd+K** opens a global launcher (see `reference/src/components/cmdk.jsx`). Header has a "Ask CraftlyAI" input plus a grouped list of navigation + actions + recent.
- **AI sidekick strip** on Dashboard: `linear-gradient(135deg, var(--accent-soft), var(--bg-surface) 60%)` background, accent-filled 38px square with `Sparkles` icon, message text, "Review" CTA, dismiss button.
- **AI thinking indicator**: the only motion-y loader we use. Sparkle icon pulses (2.2s) + accent shimmer over `--fg-3` text. Reserved for AI work only.
- **Ask AI button**: ghost variant, always with `Sparkles` icon and `⌘K` kbd hint.

---

## 12. Density

CraftlyAI is medium-density. Reference points:
- Table row: 12px vertical padding, 14px horizontal. Hover: `--bg-subtle`.
- Card header: 14px 16px. Card body: 16px.
- Form input height: 32px (`--input-lg` 38px).
- Default button height: 30px (sm 26px, lg 38px).
- Sidebar item: 6px 10px.

This is denser than Material, looser than GitHub. Closer to Linear-light.

---

## 13. Light + dark contrast pass

Every component must meet:
- **Body text on canvas**: `--fg` on `--bg-canvas` ≥ 12:1 contrast (both themes).
- **Secondary text**: `--fg-2` ≥ 5:1.
- **Tertiary**: `--fg-3` ≥ 3:1 (decorative meta only — never for primary information).
- **Accent on white / dark**: ≥ 4.5:1.

If you add a token, run a contrast check in both themes before merging.
