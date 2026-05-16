# CLAUDE.md — CraftlyAI Project Context

Last updated: 2026-05-15
Current phase: Phase 2 complete; Phase 2.5 — Foundation Gaps in-progress (5/8)

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
│   │   ├── expenses/          ← /expenses
│   │   ├── finance/
│   │   ├── tasks/             ← /tasks (cross-project inbox)
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
│   ├── features/              ← billing, clients, dashboard, documents, expenses, finance, tasks, …
│   ├── layout/                ← sidebar, header, shell
│   ├── auth/
│   ├── marketing/
│   └── shared/
├── lib/
│   ├── supabase/              ← client.ts, server.ts, middleware.ts
│   ├── types/                 ← all TypeScript interfaces
│   ├── validations/           ← Zod schemas
│   ├── utils/                 ← helpers, formatters
│   ├── auth/
│   ├── dashboard/             ← dashboard-queries, activity/attention utils
│   ├── db/
│   ├── finance/               ← revenue-calc, finance-queries, date-utils
│   ├── expenses/              ← expense-queries, mutations, receipt-utils
│   ├── tasks/                 ← actions, task-queries, task-utils, display
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
- **Testing:** every feature ships with Vitest tests for all Zod schemas, validation logic, normalizers, and pure utility functions. No new feature is complete without tests. Co-locate test files next to the file under test (`foo.ts` → `foo.test.ts`). Server actions and DB queries are not unit-tested (they require Supabase); test the pure logic layers instead. Run `npm run test` before marking a feature done.
- **Auth deduplication:** all query functions get `{ supabase, user }` from `getServerContext()` (`lib/supabase/get-server-context.ts`) — never call `createClient()` + `auth.getUser()` independently inside a query. React `cache()` reduces ~N auth calls per render to 1.
- **Query caching:** every new exported read query function must be wrapped with `unstable_cache` from `next/cache`. Define a module-level `_cached*` worker that receives only serializable args (strings, not Date/object). The public function calls `getServerContext()` for auth then delegates. Use 60 s TTL for most data, 30 s for notifications, 300 s for profile. Tag the cache (see tag table below).
- **Cache tag table:** `"dashboard"` (projects, pipeline, activity, attention, financial summary) · `"finance"` (invoices, revenue) · `"clients"` · `"tasks"` · `"expenses"` · `"notifications"` · `"profile"`. Add new tags when adding new data domains.
- **Mutation cache busting:** every mutation server action must call `revalidateTag(tag)` (import from `next/cache`) for every tag whose cached data it changes, alongside existing `revalidatePath` calls. Never add caching without also wiring invalidation.
- **Date fields in cached results:** `unstable_cache` serializes via JSON — `Date` objects become ISO strings on the way out. Type any date field in a cached return type as `Date | string` and coerce with `new Date(value)` at the consumer. Never call `.getTime()` or `.toISOString()` on a field typed as `Date` if it passes through a cache.
- **Nested Supabase selects:** prefer `table(col1, col2)` nested select syntax over 2-step fetch (fetch IDs → `.in("foreign_id", ids)`). One round trip beats two. Apply whenever fetching a parent + related rows (e.g., documents + line_items).

## Coding patterns — NEVER do these

- Never use `any` type
- Never fetch in `useEffect` (use server components)
- Never put business logic in `page.tsx` — keep pages as thin shells
- Never call Claude API from the browser or a Next.js API route
- Never use inline styles (Tailwind only)
- Never modify files in `components/ui/` — shadcn/ui owns those
- Never write DB schema changes in code — always write a migration file
- Never continue old Claude.ai chats — start fresh each session, paste this file first
- Never add a new exported query function without `unstable_cache` + a cache tag
- Never add a mutation without `revalidateTag` for every tag the mutation affects
- Never call `createClient()` + `auth.getUser()` independently — use `getServerContext()`
- Never pass `Date`, objects, or arrays directly as args to `unstable_cache` workers — serialize to string first

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
| expenses | id, user_id, project_id, category, amount, currency, vendor, notes, receipt_url, receipt_urls (jsonb), date |
| time_entries | id, user_id, project_id, task_id, started_at, ended_at, duration_seconds, billed |
| templates | id, user_id, name, type, content_json, is_default |
| ai_conversations | id, user_id, agent_id, messages_json, context_snapshot, tokens_used |
| notifications | id, user_id, type, payload, read_at, action_taken_at |
| subscriptions | id, user_id, lemon_squeezy_id, plan, status, current_period_end |

All tables: `created_at`, `updated_at`, and RLS enabled. Users only read/write their own rows.

---

## Build phases

| Phase | Goal |
|---|---|
| 1 — Foundation | Auth, CRM, dashboard shell, basic time tracker |
| 2 — Documents & Finance | Document Studio, invoices, quotes, proposals, client portal, Lemon Squeezy billing |
| 2.5 — Foundation Gaps | Real dashboard, expenses UI, tasks view, kanban, notifications, payment voucher, LPO, receipt |
| 2.6 — Regional Compliance | Tax engine (VAT/GST), multi-currency, TRN/GSTIN fields, HSN/SAC, UPI, TDS, ZATCA QR |
| 3 — AI Layer | Cmd+K palette, SSE streaming, Router + 6 agents, Follow-Up Engine |
| 3.5 — Project Management Depth | Task subtasks, timeline/Gantt, project templates, milestones |
| 4 — Communication & Automation | Client comms log, workflow automations, email + calendar integrations |
| 4.5 — Pro AI | Pricing Advisor, Business Strategist, pgvector semantic search |
| 5 — Growth & Scale | Agency tier, public API, accounting export, mobile (Expo), desktop (Tauri) |

Full spec: `docs/superpowers/specs/2026-05-15-craftlyai-master-roadmap.md`

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
- [x] PDF generation
- [x] Invoice flow — create, send (Resend), mark paid
- [x] Quote flow — create, send, approval tracking, convert to invoice
- [x] Proposal flow — multi-section, client approval
- [x] Client portal — public link, no login, payment embed
- [x] Financial dashboard — revenue, outstanding, overdue KPI cards, monthly area chart, invoice table, date-range filter bar with presets + custom picker (`feat/financial-dashboard` → `dev`)
- [x] Lemon Squeezy — mock billing system: plan cards (`/settings/billing`), `mockUpgradePlan`/`mockDowngradePlan` server actions, `subscriptions` table + `plan_tier` on profiles, plan gating middleware, webhook stub. Plan-awareness UX: avatar dropdown usage bars, ghost upgrade rows on clients list, smart dashboard banner (≥80% limit), lock-icon button with toast on click at limit. Real LS swap: replace 3 files when legal entity ready. (`feat/mock-billing` → `dev`). Phase 2 complete.

### Phase 2.5 — Foundation Gaps

- [x] Real dashboard — live KPIs (reuse `getFinancialSummary`), attention banner, activity feed (10 events), active pipeline panel; `lib/dashboard/*`, `components/features/dashboard/*`, spec `docs/superpowers/specs/2026-05-15-real-dashboard-design.md` (`feat/real-dashboard` → `dev`)
- [x] Expenses UI — `/expenses` CRUD, categories, multi-file receipt upload (up to 10), project **Expenses** tab; migrations `20260524120000_expenses.sql` + `20260525120000_expense_receipt_urls.sql`; `lib/expenses/*`, `components/features/expenses/*` (`feat/expenses-ui` → `dev`)
- [x] Tasks standalone view — `/tasks` cross-project inbox: `listAllTasksForUser`, URL filters (`project`/`status`/`priority`/`sort`), KPI summary (open/overdue/done), shadcn table + Checkbox, quick-add dialog, sidebar nav; `lib/tasks/task-queries.ts`, `lib/tasks/task-utils.ts` (+ Vitest), `lib/tasks/display.ts`, `components/features/tasks/*`; revalidates `/tasks` on mutations (`feat/tasks-standalone` → `dev`)
- [x] Project kanban board — board view toggle on project **Tasks** tab (`/projects/[id]`), 4 status columns, `@dnd-kit/core` drag-to-update status, edit sheet, per-project list/board in localStorage; `components/features/tasks/kanban-*`, `task-edit-sheet.tsx`, spec `docs/specs/2026-05-15-kanban-board-design.md` (`feat/kanban-board` → `dev`)
- [x] Notifications UI — bell + drawer, unread badge, mark-read server actions
- [x] Payment method detail — mark-paid modal with method/cheque/reference fields, payment history tab
- [ ] todo · Payment Voucher document type — auto-generated on mark-paid, PDF, accessible in portal
- [ ] todo · LPO document type — record client LPO, linked to project, appears in portal
- [ ] todo · Receipt document type — auto-generated after payment, Resend to client

### Phase 2.6 — Regional Compliance (MENA, India, Asia, US)

- [ ] todo · Tax engine — VAT/GST/CGST+SGST/IGST/None, per-invoice override, correct PDF breakdown
- [ ] todo · Multi-currency — default + per-client + per-invoice currency, manual FX rate, correct symbols
- [ ] todo · Compliance profile fields — TRN (UAE), GSTIN (India), VAT Reg No (UK) print on invoices
- [ ] todo · HSN/SAC codes — optional per line item, prints in PDF table (India)
- [ ] todo · UPI payment display — UPI ID + QR code on `/pay/[token]` (India)
- [ ] todo · TDS tracking — deduction toggle, amount, certificate upload, net received display (India)
- [ ] todo · ZATCA QR — base64 TLV QR on KSA invoices, pure local generation (Saudi Arabia)

### Phase 3 — AI Layer

- [ ] todo · Cmd+K palette shell — UI only first, navigation + quick create, no AI yet
- [ ] todo · SSE streaming infrastructure — `/api/ai/stream` proxy + `useAIStream` hook
- [ ] todo · Router Agent (Edge Function) — Haiku, intent classification
- [ ] todo · Document Writer Agent — Sonnet, streams into Document Studio
- [ ] todo · Finance Analyst Agent — Haiku, revenue Q&A + anomaly detection
- [ ] todo · Communication Drafter Agent — Haiku, follow-up drafts + reply suggestions
- [ ] todo · Project Intelligence Agent — Haiku, daily digest + risk scoring
- [ ] todo · Follow-Up Engine — overdue triggers, draft email, one-click send
- [ ] todo · Relationship Manager Agent — Haiku, client health scores + churn signals

### Phase 3.5 — Project Management Depth

- [ ] todo · Task subtasks — children under tasks, progress bar on parent
- [ ] todo · Timeline/Gantt view — horizontal bars per task, drag to reschedule
- [ ] todo · Project templates — save project as template including tasks
- [ ] todo · Milestone tracking — milestones on timeline, visible in client portal

### Phase 4 — Communication & Automation

- [ ] todo · Client communication log — per-project notes + email log, internal vs client-visible
- [ ] todo · Workflow automations — trigger/action rules (overdue → email, approved → task, etc.)
- [ ] todo · Email integration (Gmail / Outlook OAuth)
- [ ] todo · Calendar integration (Google Calendar)

### Phase 4.5 — Pro AI

- [ ] todo · Pricing Advisor Agent (Pro) — Sonnet, scope analysis + market rates
- [ ] todo · Business Strategist Agent (Pro) — Opus, monthly briefing, once/month per user
- [ ] todo · pgvector semantic search — embed notes/docs/briefs, search across everything

### Phase 5 — Growth & scale (Month 4+)

- [ ] todo · Agency tier — multi-user, roles, shared workspace
- [ ] todo · Public API — REST + API key auth, Zapier integration
- [ ] todo · Accounting export — CSV, Xero-compatible, QuickBooks import
- [ ] todo · Mobile app (Expo)
- [ ] todo · Desktop app (Tauri) — if warranted by demand

---

## Known issues / gotchas

- [x] **shadcn `<SelectValue>` renders raw sentinel when children are `undefined`** — Radix only shows `placeholder` when `value` is empty/undefined. If you use a non-empty sentinel (e.g. `NONE_VALUE = "__none"`) and children resolve to `undefined`, Radix prints the raw sentinel string (`__none`, UUID, etc.) instead of the placeholder. **Rule:** whenever `value` can be a non-empty sentinel, always supply explicit fallback children — `{label ?? "None"}` not `{label ?? undefined}`. Two safe patterns:
  - Optional FK (client/project): `value={field.value || undefined}` + `{field.value ? label : undefined}` — Radix handles placeholder natively when value is falsy.
  - Sentinel pattern: `value={NONE_VALUE}` + `{label ?? "None"}` — always explicit fallback string.

---

## Last session summary

- 2026-05-10: Project initialized; Next.js + Tailwind + shadcn; Supabase wired; health check endpoint added. Feature status: checkboxes + `todo ·` / `in-progress ·` prefixes.
- 2026-05-11: Onboarding 3-step shipped and merged to `main`; shadcn **base-luma** (mist) + UI tokens; Git workflow section expanded in this file.
- 2026-05-11: **Dashboard shell** merged to `main` — sidebar + header + dashboard home + placeholder section routes (`feat/dashboard-shell`). Phase 1 next focus: **Clients** CRUD.
- 2026-05-11: **Clients CRM** — list `/clients`, new + detail/edit/delete, Vitest for `parseClientCreateInput`, spec `docs/specs/clients-crm.md` (`feat/clients-crm`).
- 2026-05-17: **Time tracker** merged to `main` — `/time` live + paused timers, manual log (`FormTimePopover`, gate time until date), server actions + Zod `lib/validations/time-entry`, migrations `20260516120000_time_entries.sql` / pause+description follow-up; branch `feat/time-tracker` removed after merge; root layout `suppressHydrationWarning` on `<body>` for extension-induced hydration noise.
- 2026-05-18: **Brand Kit settings** merged to `dev` — `/settings/brand` page, settings nav index, logo cleanup via path extraction, two-column form layout with sticky preview, font dropdown, inline save confirmation. Phase 2 progress: 1/8 tasks done. (`feat/brand-kit` → `dev`)
- 2026-05-18: **Document Studio** merged to `dev` — Tiptap editor (StarterKit + Placeholder + Link + Typography), system-seeded templates (Simple Proposal / Basic Quote / Standard Invoice / Blank) plus user `saveAsTemplate`, mustache `{{variable}}` engine grouped Client/Project/Brand/Date, server-only `buildVariableContext` reading clients + projects + brand kit + profile. Migrations `20260518120000_documents.sql`, `20260518120100_document_templates.sql`, `20260518120200_document_templates_seed.sql`; 15 Zod tests in `lib/validations/document.test.ts`; routes `/documents`, `/documents/new`, `/documents/[id]`, `/documents/[id]/edit`; shared `.doc-prose` / `.doc-render` styles in `styles/globals.css`. Branch was first cut from stale `main`, then rebased onto `dev` to pick up Brand Kit + base-luma refresh + metadata templates; `feat/document-studio` removed after merge. PDF, send-via-email, signing, line items, portal links remain stubbed for later Phase 2 tasks. Phase 2 progress: 2/8 tasks done.
- 2026-05-18: **Invoice flow** complete on `dev` — dedicated `invoice-edit-form`, line items editor (add/edit/delete/reorder), invoice meta fields (number, due date, terms, notes), discount toggle (percent/flat), PDF renderer with line items table, Resend email (`lib/email/send-invoice.ts`, `emails/invoice.tsx`), public pay page (`/pay/[token]`) with `MockPaymentForm`, mark-paid button, `pay_token` on documents. Mutations in `lib/documents/invoice-mutations.ts`, queries in `lib/documents/invoice-queries.ts`. Phase 2 progress: 3/8 tasks done.
- 2026-05-18: **Quote flow** on `feat/quote-flow` — migration adds `approved`/`declined` to `document_status` enum + `quote_number`, `valid_until`, `approval_token`, `approved_at`, `declined_at`, `approval_message` columns. `QuoteEditForm`, `QuoteMetaFields`, `SendQuoteButton`, `QuoteApprovalStatus` components. `lib/documents/quote-mutations.ts` (generateQuoteNumber, updateQuoteMeta, markQuoteApproved/Declined, convertQuoteToInvoice), `lib/email/send-quote.ts`, `emails/quote.tsx`. Public approval page `/quote/[token]` + `QuoteRespondForm`. `POST /api/quotes/respond`. `InvoiceLineItemsEditor` gets `onDiscountSave` prop. Build passes. Phase 2 progress: 4/8 tasks done.
- 2026-05-18: **Quote PDF fix** merged to `dev` — quote PDFs were blank (only client name visible) because `DocumentPdf` only rendered line items/meta for `type === "invoice"`; quotes store an empty Tiptap doc and use structured line items. Added `quoteData` prop to `DocumentPdf`, quote metadata band (Quote #, Valid until), line items table, and notes footer for `type === "quote"`. Tiptap body now only renders for proposal/other. PDF download filename now uses `QUO-XXXX` / `INV-XXXX` when number exists instead of raw document title. `feat/quote-flow` merged to `dev`.
- 2026-05-18: **Proposal flow** complete on `feat/proposal-flow` — custom `PricingTableExtension` Tiptap node (atom block, ReactNodeViewRenderer) lets users insert calculation tables anywhere in the proposal body (Description, Qty, Rate, Total auto-calc, optional tax, add/remove rows). `pricing-table-node.ts` + `pricing-table-view.tsx`. Toolbar Table icon inserts it at cursor. Removed fixed `InvoiceLineItemsEditor` from proposals (proposals are free-form, not invoice-structured). Save redirects to view page. `SendProposalButton` moved from editor footer to view page actions (alongside Download PDF + Edit). `document-detail-view.tsx` renders `pricingTable` nodes statically. Phase 2 progress: 5/8 tasks done. `feat/proposal-flow` → `dev`.
- 2026-05-15: **Client portal** merged to `dev` — per-client `/portal/[token]` hub (brand kit, document list, CTAs to `/pay`, `/quote`, `/proposal`); `clients.portal_token` migration `20260522120000_client_portal_token.sql`; `PortalShell` on all public doc pages; middleware public paths for `/quote`, `/proposal`, `/portal`; client detail portal link copy/regenerate + Documents tab wired; mock payment unchanged (`MockPaymentForm`). `feat/client-portal` → `dev`. Phase 2 progress: 6/8 tasks done.
- 2026-05-15: **Financial dashboard** merged to `dev` — `/finance` page with URL searchParam date filter (from/to), 4 KPI cards (total revenue, outstanding, overdue, avg pay days) with staggered fade-up animation, monthly revenue area chart (Recharts, gradient fill), invoice table (status badges, overdue highlighting), preset filter pills (This Month / Last 3M / This Year) + custom date range picker. Pure calc functions in `lib/finance/revenue-calc.ts`, date helpers in `lib/finance/date-utils.ts`, server queries in `lib/finance/finance-queries.ts` (batch line-item fetch, tax included in totals, outstanding shows ALL unpaid regardless of date range). Vitest tests for both utility files. Loading skeleton in `app/(app)/finance/loading.tsx`. Fixed hydration error: `PopoverTrigger` nested `<Button>` → applied `buttonVariants` directly to trigger. `feat/financial-dashboard` → `dev`. Phase 2 progress: 7/8 tasks done.
- 2026-05-15: **Mock billing + plan-awareness** merged to `dev` — `supabase/migrations/20260523120000_billing.sql` adds `plan_tier` to profiles + `subscriptions` table with RLS. `config/plans.ts` defines all 4 tiers with limits + `isPlanAtLeast`. `/settings/billing` page: premium plan cards (amber/gold Pro elevation, staggered animation), `mockUpgradePlan`/`mockDowngradePlan` server actions write directly to DB, mock mode banner. Middleware plan gating (`PRO_ROUTES[]` array, empty until Phase 3 features land). Webhook stub at `/api/webhooks/lemon-squeezy`. Plan-awareness UX: avatar dropdown shows plan badge chip + colour-coded usage bars (emerald/amber/red at 60/80%) + upgrade link; clients page shows `AddClientButton` (lock icon + sonner toast with upgrade action when at limit) + `UpgradeGhostRow` below list; dashboard shows `PlanLimitBanner` (amber strip, dismissible per calendar month via localStorage) only when ≥80% of any limit used. Data fetched in parallel in `app/(app)/layout.tsx`, propagated via `PlanUsageContext`. 163 Vitest tests pass. `feat/mock-billing` → `dev`. Phase 2 complete — 8/8 tasks done.
- 2026-05-15: **Master roadmap** — full product roadmap spec written to `docs/superpowers/specs/2026-05-15-craftlyai-master-roadmap.md`. CLAUDE.md updated with revised phases (2.5 foundation gaps, 2.6 regional compliance, 3.5 project depth, 4.5 pro AI). Next: Phase 2.5 Task 0 — real dashboard.
- 2026-05-15: **Fix: document monthly limit enforcement** — `/documents` page was not blocking creation when Free tier 5 docs/month quota was hit. Added `AddDocumentButton` client component (lock icon + sonner toast with upgrade CTA at limit, normal Link when under). Page now parallel-fetches doc count this month via `gte("created_at", startOfCurrentMonth())`, computes `atLimit`, renders `AddDocumentButton` + `UpgradeGhostRow` with usage string. `fix/document-limit-enforcement` → `dev`.
- 2026-05-15: **Real dashboard** merged to `dev` — `/dashboard` RSC runs 5 parallel queries (`getFinancialSummary`, `getDashboardCounts`, `getAttentionItems`, `getRecentActivity`, `getActivePipeline`). Layout B: 4 KPI cards, amber attention banner (hidden when empty), 3/5 activity + 2/5 pipeline. Pure utils + Vitest in `lib/dashboard/activity-utils.ts` and `attention-utils.ts`. Shared `formatCurrency` in `lib/utils/format.ts`. Skeleton updated for 4 KPIs + attention row. Project deadline attention uses `planning` + `active` (not task `in_progress`). `feat/real-dashboard` → `dev`. Phase 2.5 progress: 1/8.
- 2026-05-15: **Expenses UI** merged to `dev` — `expenses` table + `expense-receipts` bucket; `/expenses` with filters, summary card, Sheet form (FieldGroup); multi-attachment via `receipt_urls` jsonb (max 10); project detail **Expenses** tab; `lib/expenses/receipt-utils.ts` + Vitest. `feat/expenses-ui` → `dev`. Phase 2.5 progress: 2/8. Next: **Tasks standalone view**.
- 2026-05-15: **Tasks standalone view** merged to `dev` — `/tasks` RSC + `listAllTasksForUser` (project/client embed), URL filters, Finance-style `KpiCard` summary, compact **Table** list (shadcn `Checkbox`, badge variants, overdue row highlight), quick-add dialog (`FieldGroup`), Work nav **Tasks** link; `TaskListRow` type; `lib/tasks/task-utils.ts` (9 Vitest); `lib/tasks/display.ts` shared with project Tasks tab; `components/ui/checkbox.tsx` added. 201 Vitest tests pass. `feat/tasks-standalone` → `dev`. Phase 2.5 progress: 3/8. Next: **Project kanban board**.
- 2026-05-15: **Project kanban board** merged to `dev` — **Tasks** tab on `/projects/[id]`: list/board toggle (per-project `localStorage`), 4-column kanban (`todo` / `in_progress` / `done` / `cancelled`), optimistic dnd-kit status drag, right Sheet edit/delete, column “Add task” pre-fills status via existing project add dialog; `@dnd-kit/core` + `@dnd-kit/utilities`. `feat/kanban-board` → `dev`. Phase 2.5 progress: 4/8. Next: **Notifications UI**.
- 2026-05-15: **Notifications UI** merged to `dev` — `notifications` table + RLS (select/insert/update/delete policies) + 30-day backfill; bell icon + right Sheet drawer; unread badge, time-grouped list (Today/Yesterday/Older), colored accent bar per type; mark read on click, mark all read, clear all, per-item delete (hover-reveal trash); browser Notification API with permission prompt in sheet + localStorage dedup (auto-fires on mount for unseen unread); write hooks on invoice paid, quote/proposal sent/approved/declined, public quote respond route; `lib/notifications/*` + Vitest; `hooks/use-browser-notifications.ts`. `feat/notifications-ui` → `dev`. Phase 2.5 progress: 5/8. Next: **Payment method detail**.
- 2026-05-16: **Payment method detail** merged to `dev` — `payments` table migration; `markInvoicePaid` now accepts method/reference/notes, computes total server-side, inserts payment record; `MarkPaidButton` replaced simple confirm dialog with method select + reference + notes form; `PaymentHistory` component shows date/method/reference/amount table below invoice; `getPaymentsForDocument` query; `PaymentRow` + `PaymentMethod` types; 10 Vitest tests. `feat/payment-method-detail` → `dev`. Phase 2.5 progress: 6/8. Next: **Payment Voucher document type**.

---

## Git workflow rules (respect these)

Agents and humans follow the same flow: **`main` is always deployable**; real work happens on **short-lived branches**, then merges back via PR.

### Non-negotiables

- **ALWAYS create a branch before touching any code.** No exceptions — not even one file. Branch first, then work.
- Never do feature work directly on `main` or `dev`.
- **One branch per task** — name it by intent: `feat/onboarding-scroll`, `fix/middleware-css`, `chore/bump-deps`.
- **Commit and push** that branch, **open a PR into `dev`**, merge when checks pass.
- **Delete the branch** after merge (local + remote). Keeping old `feat/*` branches does not help isolate bugs once merged — use a **new** `fix/*` branch for follow-ups.

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

