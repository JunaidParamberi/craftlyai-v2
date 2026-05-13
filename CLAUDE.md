# CLAUDE.md — CraftlyAI Project Context

Last updated: 2026-05-18
Current phase: Phase 1 — Foundation complete; Phase 2 — Documents & Finance in-progress

Tick **`[x]`** when a task is finished. For open tasks, put **`todo ·`** or **`in-progress ·`** right after the checkbox (before the task text).

---

## What this project is

CraftlyAI is an AI-powered operating system for freelancers, creatives, developers, and small agencies. It replaces fragmented tools (invoicing, CRM, time tracking, client portals) with a single app where AI does the heavy lifting invisibly in the background.

North star: every interaction should save the user at least 10 minutes. If it doesn't, it shouldn't exist.

Web app first (Next.js 15 App Router) → mobile (Expo, Phase 4) → desktop (Tauri, Phase 5 if warranted).

Target user at launch: solo freelancers earning $2,000–$15,000/month in tech, design, or content. Based in UAE, UK, US, MENA. English-language only at launch.

---

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 15 App Router | SSR, RSC, streaming for AI output |
| UI | shadcn/ui | Copy-paste — you own 100% of the code |
| Styling | Tailwind CSS 4 | Utility-first, no inline styles ever |
| State | Zustand (global) + TanStack Query (server) | |
| Forms | react-hook-form + Zod | No uncontrolled inputs |
| Rich text | Tiptap (ProseMirror) | Document Studio editor |
| PDF | React-PDF + pdf-lib | Pixel-perfect output |
| Charts | Recharts | Lightweight, MIT license |
| Icons | Lucide React | |
| Animation | Framer Motion | Transitions only; micro-interactions in CSS |
| Backend | Supabase | Postgres, Auth, Storage, Edge Functions, Realtime |
| Auth | Supabase Auth | Email + magic link + Google OAuth. JWT tokens. |
| AI API | Anthropic Claude API | Haiku (routing/fast), Sonnet (docs), Opus (monthly strategy) |
| Agent runtime | Supabase Edge Functions (Deno) | All AI calls here. Never from browser or Next.js API routes. |
| Email | Resend | Transactional. 3,000/month free. |
| Payments (user billing) | Lemon Squeezy | Merchant of Record — handles global VAT. Switch to Stripe at $5k MRR. |
| Payments (client-to-freelancer) | Stripe | Embedded in client portal. |
| Hosting | Vercel | Next.js first-class, preview deployments per PR |
| CI/CD | GitHub Actions | Lint, typecheck, build, deploy on push to main |
| Monitoring | Sentry + Vercel Analytics + PostHog | Errors / performance / product analytics |
| Marketing email | Loops | Separate from transactional |

---

## Folder structure

```
craftlyai.app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (app)/                 ← route group: URLs have no “app” segment
│   │   ├── dashboard/         ← /dashboard
│   │   ├── clients/
│   │   ├── projects/
│   │   ├── documents/
│   │   ├── finance/
│   │   ├── time/
│   │   ├── settings/
│   │   └── support/
│   ├── (marketing)/
│   │   ├── pricing/
│   │   ├── about/
│   │   └── blog/
│   ├── onboarding/            ← post-signup, 3-step flow
│   └── api/
│       ├── ai/                ← thin proxies to Edge Functions only
│       ├── auth/
│       ├── stripe/
│       └── webhooks/
├── components/
│   ├── ui/                    ← shadcn/ui base components — DO NOT MODIFY
│   ├── features/              ← feature-specific components
│   ├── layout/                ← sidebar, header, shell
│   ├── auth/
│   ├── dashboard/
│   ├── marketing/
│   └── shared/
├── lib/
│   ├── supabase/              ← client.ts, server.ts, middleware.ts
│   ├── types/                 ← all TypeScript interfaces
│   ├── validations/           ← Zod schemas
│   ├── utils/                 ← helpers, formatters
│   ├── auth/
│   ├── db/
│   ├── stripe/
│   ├── time/                  ← server actions (timer + manual entries)
│   └── email/
├── agents/                    ← system prompt definitions per agent
│   ├── router/
│   ├── document-writer/
│   ├── finance-analyst/
│   ├── communication-drafter/
│   ├── project-intelligence/
│   ├── relationship-manager/
│   ├── pricing-advisor/       ← Pro tier only
│   └── business-strategist/   ← Pro tier only, Opus, once/month
├── supabase/
│   ├── migrations/            ← SQL migration files, numbered sequentially
│   └── functions/             ← Deno Edge Functions (one per agent)
│       ├── router/
│       ├── document-writer/
│       ├── finance-analyst/
│       ├── communication-drafter/
│       ├── project-intelligence/
│       ├── relationship-manager/
│       ├── pricing-advisor/
│       └── business-strategist/
├── hooks/                     ← custom React hooks (useClients, useProjects…)
├── styles/                    ← global CSS, Tailwind config
├── emails/                    ← Resend email templates
├── docs/
│   ├── specs/                 ← feature spec files
│   └── weekly-reviews/        ← Cowork-generated weekly summaries
├── assets/
│   ├── branding/              ← logos, brand kit files
│   └── screenshots/           ← product screenshots for marketing / PH launch
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
└── config/                    ← app config, constants, env types
```

---

## Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Files | kebab-case | `client-form.tsx` |
| Component exports | PascalCase | `export function ClientForm` |
| DB tables | snake_case plural | `clients`, `line_items` |
| TypeScript types | PascalCase | `Client`, `Project`, `Document` |
| Hooks | useNoun | `useClients`, `useProjects` |
| Server actions | verbNoun | `createClient`, `updateProject` |
| Edge Functions | kebab-case | `document-writer/index.ts` |

---

## Coding patterns — ALWAYS follow these

- **Data fetching:** server components only. No `useEffect` for data fetching ever.
- **Mutations:** server actions in `actions.ts` co-located per feature folder.
- **Forms:** react-hook-form + Zod. No uncontrolled inputs.
- **Client components:** only when strictly necessary (event handlers, browser APIs, `useEffect` for UI only).
- **AI calls:** only from Supabase Edge Functions. Never from Next.js API routes or the browser.
- **Auth checks:** server component or middleware. Never client-side only.
- **Streaming:** all AI responses stream to UI via Server-Sent Events (SSE). Never block UI waiting for full response.
- **RLS:** every Supabase table has Row Level Security. Users can only access their own data.

## Coding patterns — NEVER do these

- Never use `any` type
- Never fetch in `useEffect` (use server components)
- Never put business logic in `page.tsx` — keep pages as thin shells
- Never call Claude API from the browser or a Next.js API route
- Never use inline styles (Tailwind only)
- Never modify files in `components/ui/` — shadcn/ui owns those
- Never write DB schema changes in code — always write a migration file
- Never continue old Claude.ai chats — start fresh each session, paste this file first

---

## AI agent fleet

| Agent | Model | Tier | Purpose |
|---|---|---|---|
| 0 — Router | claude-haiku-4-5 | All | Receives every Cmd+K input, classifies intent, delegates to specialist |
| 1 — Document Writer | claude-sonnet-4-6 | All | Generates proposals, quotes, invoices, contracts from brief |
| 2 — Finance Analyst | claude-haiku-4-5 | All | Revenue Q&A, cashflow summaries, anomaly detection |
| 3 — Communication Drafter | claude-haiku-4-5 | Starter+ | Follow-up emails, reply suggestions, tone matching |
| 4 — Project Intelligence | claude-haiku-4-5 | Starter+ | Daily digest, risk scoring, deadline warnings |
| 5 — Relationship Manager | claude-haiku-4-5 | Starter+ | Client health scores, churn signals, check-in suggestions |
| 6 — Pricing Advisor | claude-sonnet-4-6 | Pro only | Scope analysis, market rate recommendations |
| 7 — Business Strategist | claude-opus-4-6 | Pro only | Monthly strategic briefing — used once/month per user max |

**Cost target:** ~$0.50–$2.00/active user/month. 80% of requests go to Haiku. Opus runs batch, once monthly.

**Caching:** Supabase stores agent outputs with TTL. Same question in same session returns cached response. Context compression: each agent receives only the data it needs, not the full database.

---

## Plan tiers

| Tier | Price | Key limits |
|---|---|---|
| Free | $0 | 3 clients, 5 docs/month, 2 templates, 20 AI actions/month (Router + Doc Writer only) |
| Starter | $19/mo ($15 annual) | 15 clients, unlimited docs, agents 1–4, 100 AI actions/month |
| Pro | $49/mo ($39 annual) | Unlimited everything, all agents 0–7, custom portal domain, API access |
| Agency | $99/mo ($79 annual) | Pro + 5 team members, shared workspace, white-label portal |

Plan gating: Supabase RLS + middleware check plan tier before every AI call.

---

## Database tables (core)

| Table | Key columns |
|---|---|
| users | id, email, full_name, plan_tier, plan_expires_at, brand_kit_id |
| brand_kits | id, user_id, logo_url, primary_color, secondary_color, font, email_signature |
| clients | id, user_id, name, email, phone, company, address, currency, notes, health_score |
| projects | id, user_id, client_id, title, status, budget, spent, start_date, deadline |
| tasks | id, project_id, title, status, due_date, priority |
| documents | id, user_id, client_id, project_id, type, status, content_json, pdf_url, sent_at, viewed_at, signed_at |
| line_items | id, document_id, description, quantity, unit_price, tax_rate, amount |
| payments | id, document_id, amount, currency, method, paid_at |
| expenses | id, user_id, project_id, category, amount, receipt_url, date |
| time_entries | id, user_id, project_id, task_id, started_at, ended_at, duration_seconds, billed |
| templates | id, user_id, name, type, content_json, is_default |
| ai_conversations | id, user_id, agent_id, messages_json, context_snapshot, tokens_used |
| notifications | id, user_id, type, payload, read_at, action_taken_at |
| subscriptions | id, user_id, lemon_squeezy_id, plan, status, current_period_end |

All tables: `created_at`, `updated_at`, and RLS enabled. Users only read/write their own rows.

---

## Build phases

| Phase | Weeks | Goal |
|---|---|---|
| 1 — Foundation | 1–3 | Auth, CRM, dashboard shell, basic time tracker |
| 2 — Documents & Finance | 4–6 | Document Studio, invoices, quotes, proposals, client portal, Lemon Squeezy billing |
| 3 — AI Layer | 7–10 | Cmd+K palette, Router + 5 agents, Follow-Up Engine, SSE streaming |
| 4 — Pro AI Agents | 11–14 | Pricing Advisor, Business Strategist, email/calendar integrations, pgvector, mobile (Expo) |
| 5 — Growth & Scale | Month 4+ | Agency tier, public API, AppSumo, Zapier, accounting export, Tauri desktop |

---

## Feature status

- **`[x]`** = done (ticked)
- **`[ ] todo ·`** = not started
- **`[ ] in-progress ·`** = you are building it now (change to `[x]` when finished)

### Phase 1 — Foundation (Weeks 1–3)

- [x] Project setup — Next.js 15 App Router, Tailwind 4, shadcn/ui, ESLint, TypeScript
- [x] Supabase wiring — `@supabase/supabase-js`, `@supabase/ssr`, `lib/supabase/*`, root `middleware.ts`, env pattern
- [x] `GET /api/health/supabase` — connectivity check
- [x] Auth — login, signup, magic link, Google OAuth
- [x] Onboarding — 3-step: profile, brand kit, first client (routes, RLS, server actions, merged to `main`)
- [x] Dashboard shell — sidebar, main app layout, header (search / Cmd+K stub), protected routes + placeholder pages (`feat/dashboard-shell` → `main`)
- [x] Clients — CRUD, list, detail page
- [x] Projects — linked to client, status, project-scoped tasks
- [x] Time tracker — `/time` running timer (start/stop/pause/resume), manual entry with 12h popover time + date-before-time gate; `lib/time/actions`, migrations `time_entries` (+ pause/description); merged `main` (`feat/time-tracker`)

### Phase 2 — Documents & Finance (Weeks 4–6)

- [x] Document Studio — Tiptap editor + system/user templates + `{{variable}}` substitution (`/documents`, `lib/documents/*`, spec `docs/specs/document-studio.md`)
- [x] Brand kit — logo upload, colors, fonts, applied globally (/settings/brand)
- [ ] todo · PDF generation
- [ ] todo · Invoice flow — create, send (Resend), mark paid
- [ ] todo · Quote flow — create, send, approval tracking
- [ ] todo · Proposal flow — multi-section, client approval
- [ ] todo · Client portal — public link, no login, payment embed
- [ ] todo · Financial dashboard — revenue, outstanding, expenses
- [ ] todo · Lemon Squeezy — plans, webhooks, plan gating

### Phase 3 — AI Layer (Weeks 7–10)

- [ ] todo · Cmd+K command palette
- [ ] todo · Router Agent (Edge Function)
- [ ] todo · Document Writer Agent
- [ ] todo · Communication Drafter Agent
- [ ] todo · Finance Analyst Agent
- [ ] todo · Project Intelligence Agent
- [ ] todo · Follow-Up Engine — triggers, draft, one-click send
- [ ] todo · Relationship Manager Agent

### Phase 4 — Pro AI & integrations (Weeks 11–14)

- [ ] todo · Pricing Advisor Agent (Pro)
- [ ] todo · Business Strategist Agent (Pro)
- [ ] todo · Email integration (Gmail / Outlook OAuth)
- [ ] todo · Calendar integration (Google Calendar)
- [ ] todo · pgvector semantic search
- [ ] todo · Mobile app (Expo)

### Phase 5 — Growth & scale (Month 4+)

- [ ] todo · Agency tier — multi-user, roles, shared workspace
- [ ] todo · Public API

---

## Known issues / gotchas

- [ ] (add as discovered)

---

## Last session summary

- 2026-05-10: Project initialized; Next.js + Tailwind + shadcn; Supabase wired; health check endpoint added. Feature status: checkboxes + `todo ·` / `in-progress ·` prefixes.
- 2026-05-11: Onboarding 3-step shipped and merged to `main`; shadcn **base-luma** (mist) + UI tokens; Git workflow section expanded in this file.
- 2026-05-11: **Dashboard shell** merged to `main` — sidebar + header + dashboard home + placeholder section routes (`feat/dashboard-shell`). Phase 1 next focus: **Clients** CRUD.
- 2026-05-11: **Clients CRM** — list `/clients`, new + detail/edit/delete, Vitest for `parseClientCreateInput`, spec `docs/specs/clients-crm.md` (`feat/clients-crm`).
- 2026-05-17: **Time tracker** merged to `main` — `/time` live + paused timers, manual log (`FormTimePopover`, gate time until date), server actions + Zod `lib/validations/time-entry`, migrations `20260516120000_time_entries.sql` / pause+description follow-up; branch `feat/time-tracker` removed after merge; root layout `suppressHydrationWarning` on `<body>` for extension-induced hydration noise.
- 2026-05-18: **Brand Kit settings** merged to `dev` — `/settings/brand` page, settings nav index, logo cleanup via path extraction, two-column form layout with sticky preview, font dropdown, inline save confirmation. Phase 2 progress: 1/8 tasks done. (`feat/brand-kit` → `dev`)
- 2026-05-18: **Document Studio** merged to `dev` — Tiptap editor (StarterKit + Placeholder + Link + Typography), system-seeded templates (Simple Proposal / Basic Quote / Standard Invoice / Blank) plus user `saveAsTemplate`, mustache `{{variable}}` engine grouped Client/Project/Brand/Date, server-only `buildVariableContext` reading clients + projects + brand kit + profile. Migrations `20260518120000_documents.sql`, `20260518120100_document_templates.sql`, `20260518120200_document_templates_seed.sql`; 15 Zod tests in `lib/validations/document.test.ts`; routes `/documents`, `/documents/new`, `/documents/[id]`, `/documents/[id]/edit`; shared `.doc-prose` / `.doc-render` styles in `styles/globals.css`. Branch was first cut from stale `main`, then rebased onto `dev` to pick up Brand Kit + base-luma refresh + metadata templates; `feat/document-studio` removed after merge. PDF, send-via-email, signing, line items, portal links remain stubbed for later Phase 2 tasks. Phase 2 progress: 2/8 tasks done.

---

## Git workflow rules (respect these)

Agents and humans follow the same flow: **`main` is always deployable**; real work happens on **short-lived branches**, then merges back via PR.

### Non-negotiables

- Never do feature work directly on `main` (except trivial docs/meta when unavoidable).
- **One branch per task** — name it by intent: `feat/onboarding-scroll`, `fix/middleware-css`, `chore/bump-deps`.
- **Commit and push** that branch, **open a PR into `main`**, merge when checks pass.
- **Delete the branch** after merge (local + remote). Keeping old `feat/*` branches does not help isolate bugs once merged — `main` already contains the work; use a **new** `fix/*` branch from `main` for follow-ups.

### Standard loop (copy-paste)

```bash
git checkout main && git pull origin main
git checkout -b feat/short-task-name
# … edit, commit often …
git push -u origin feat/short-task-name
```

Then open a PR on GitHub → review → merge → locally:

```bash
git checkout main && git pull origin main
git branch -d feat/short-task-name
# Remote: delete branch in GitHub UI or: git push origin --delete feat/short-task-name
```

### Before merging a PR

- Run **`npm run build`** (and **`npm run lint`** if the project uses it).
- Smoke-test the flows you touched in the browser.

### After a bug ships to `main`

- Branch from **current `main`**: `git checkout -b fix/issue-short-label`.
- Do **not** rely on an old feature branch name for isolation — it usually points at the same commits as `main` after merge.

### Mental model

| Branch | Purpose |
|--------|---------|
| `main` | Single source of truth for deploy; stays green |
| `feat/*`, `fix/*`, `chore/*` | Sandboxed work until merged |

### Solo vs team

- **Solo:** still use PRs if you want a single diff view and GitHub “Merge”; merging locally is OK only if you still reviewed your own diff.
- **Team:** PR required; optional reviewers; CI on PR when wired up.

---

## Tool split rules (respect these)

- **Claude.ai:** architecture decisions, schema design, agent prompts, TypeScript types, Zod schemas, server action logic, Edge Function first drafts, code review (max 80 lines). Fresh chat every session — paste this file first.
- **Cursor:** all file editing, component building, debugging, installing packages, wiring Supabase to UI, Tailwind fixes. Open the full project folder, never paste files into Claude.ai when Cursor can read them directly.
- **Cowork:** updating this file, organizing /docs and /assets, drafting marketing copy, writing feature specs to /docs/specs/, weekly reviews, scheduled reminders. Never touches code files.

