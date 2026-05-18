# CraftlyAI Design System — Handoff

## What to do

1. **Unzip this folder into `docs/design/`** in your existing project.
2. **Open Claude Code in that project.**
3. **Paste the entire contents of `PASTE_THIS_PROMPT.txt`** as your first message.

That's it. The prompt makes Claude Code:
- Install tokens / fonts / theme switcher / global CSS
- Append a Design System section to your existing `CLAUDE.md` (so future work follows the rules automatically)
- Port the shared layer (icons, primitives, skeletons, Cmd+K, app shell)
- **Recreate every screen pixel-for-pixel** from `reference/src/screens/` — Dashboard, Clients, Projects, Documents, Finance, Tasks, Time, Expenses, Settings, Login, Design System
- Ensure skeleton + empty + error states on every async surface, in light AND dark themes

Claude Code pauses after each phase for your review, so you can approve before changes land.

---

## What's inside

| File | What it's for |
|---|---|
| `PASTE_THIS_PROMPT.txt` | **The one prompt to paste.** |
| `DESIGN_SYSTEM.md` | The binding rules. Your existing `CLAUDE.md` will reference this. |
| `SYSTEM.md` | Tokens, type, spacing, motion, theming |
| `COMPONENTS.md` | Component catalog |
| `SKELETONS_AND_LOADERS.md` | Loading-state policy |
| `MIGRATION.md` | Phase-by-phase rollout |
| `PROMPTS.md` | Per-phase prompts if you want finer control |
| `reference/` | Canonical HTML/CSS/JSX — the source of truth |

> The files in `reference/` are **design references** — prototypes showing the intended look. The dev/Claude Code job is to recreate them in your project's framework (Next.js, Remix, Vite + React, etc.) using your existing patterns. CSS variables in `tokens.css` are framework-agnostic and drop in directly.
