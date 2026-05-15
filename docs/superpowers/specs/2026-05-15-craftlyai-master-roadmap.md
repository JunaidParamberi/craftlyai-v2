# CraftlyAI — Master Product Roadmap

**Last updated:** 2026-05-15
**Status:** Active north star document — update as features ship

---

## What "not a gimmick" means

A freelance OS earns daily use when it answers three questions in under 5 seconds:

1. Am I on track financially this month?
2. What do I need to do today?
3. Is anything on fire?

Reference standard: **HoneyBook** (client lifecycle), **ClickUp** (task visibility), **Monday CRM** (pipeline), **FreshBooks** (tax-ready accounting), **Linear** (dense but beautiful UI).

---

## Target user

Solo freelancer, $2k–$15k/month, tech/design/content. Based in UAE, India, UK, US, broader Asia. English-only at launch. Not a power user — wants things to work, not configure.

---

## Current state (2026-05-15)

Phase 1 and Phase 2 complete on `dev`. Gaps identified:

- Dashboard shows hardcoded fake data — embarrassing, fix first
- No expenses UI (table exists, zero frontend)
- Tasks exist on projects but no standalone view or kanban
- Notifications table exists, no bell/drawer UI
- Payment detail is binary (paid/unpaid) — no method, cheque #, reference
- No LPO, Payment Voucher, or Receipt document types
- No tax engine — VAT/GST not configurable
- No multi-currency beyond schema column
- No regional compliance fields (TRN, GSTIN, VAT Reg No)

---

## Phase 2.5 — Foundation Gaps

*Must ship before AI agents. Agents analyzing empty tables or fake data is useless.*

### Task 0 — Real Dashboard (FIRST — users see this first)

**What it does:** Replaces all hardcoded values with real DB data. Adds "needs attention" action list.

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Good morning, {name} · {date}                      │
│  {contextual alert: overdue invoices, pending etc}  │
└─────────────────────────────────────────────────────┘

[ Revenue/mo ] [ Outstanding ] [ Overdue ⚠ ] [ Active projects ]

┌───────────────────────────┬─────────────────────────┐
│  Pipeline strip           │  Needs attention today  │
│  Proposal→Quote→Invoice   │  ⚠ overdue invoices     │
│  count + value per stage  │  ◷ pending approvals    │
│                           │  ✓ tasks due this week  │
│  Revenue trend (7-bar)    │  ─────────────────────  │
│                           │  Quick actions          │
│                           │  [+Invoice][+Client]    │
│                           │  [▶ Start timer]        │
└───────────────────────────┴─────────────────────────┘

  Recent activity (real, from notifications table)
```

**Data sources:**
- Revenue: `payments` joined `line_items` — reuse `finance-queries.ts`
- Outstanding/overdue: `documents` WHERE type=invoice, status=sent
- Active projects: `projects` WHERE status=active, count
- Pipeline: `documents` GROUP BY type+status, sum value
- Attention items: overdue invoices + pending quotes/proposals + tasks due ≤7 days
- Recent activity: `notifications` table

**Design rules:**
- Red = overdue/action needed
- Amber = pending/watch
- Green = healthy/paid
- Contextual greeting: "You have 2 overdue invoices" not "Welcome back"
- No vanity metrics, no pie charts

---

### Task 1 — Expenses UI

**What it does:** Full CRUD for expenses. Finance Analyst agent needs real expense data.

**Routes:** `/expenses` (list + add), expense linked inside `/projects/[id]`

**Fields:** date, category (Housing/Software/Travel/Meals/Marketing/Other), amount, currency, project (optional FK), vendor, notes, receipt upload (Supabase Storage)

**Components:**
- `ExpenseList` — server component, filterable by date/category/project
- `ExpenseForm` — react-hook-form + Zod, inline slide panel
- `ExpenseRow` — amount, category badge, project link, receipt icon
- `ExpenseSummaryCard` — totals by category (reusable in finance dashboard)

**DB migration:** `expenses` table already exists. Add `vendor TEXT` column if missing.

**Tests:** Zod schema for expense create/update inputs.

---

### Task 2 — Tasks Standalone View

**What it does:** All tasks across all projects visible in one place. Project Intelligence agent needs task state.

**Route:** `/tasks`

**Features:**
- List all tasks, grouped by project or flat
- Filter: project, status (todo/in_progress/review/done), priority, due date
- Sort: due date, priority, created
- Quick status toggle inline (server action)
- Quick add: project selector + title + due date
- Overdue tasks highlighted red

**Components:**
- `TasksPage` — server component, fetches all tasks for user
- `TaskFilters` — client component, URL searchParams
- `TaskRow` — status toggle, priority badge, project link, due date
- `QuickAddTask` — inline form

---

### Task 3 — Project Kanban Board

**What it does:** Visual board view on project detail. Toggle between list and board.

**Route:** `/projects/[id]` gains view toggle (list ↔ board)

**Columns:** To Do / In Progress / Review / Done

**Drag:** `dnd-kit` — drag task cards between columns, server action updates status

**Components:**
- `ProjectViewToggle` — list/board pill toggle
- `KanbanBoard` — 4-column layout
- `KanbanColumn` — droppable column with task count
- `KanbanCard` — task title, priority, due date, assignee avatar slot

---

### Task 4 — Notifications UI

**What it does:** Bell icon in header shows real notifications. Table already exists.

**Components:**
- `NotificationBell` — badge count, click opens drawer
- `NotificationDrawer` — slide-out, unread first, grouped by type
- `NotificationItem` — icon by type, message, timestamp, action button, mark-read

**Types to handle:** invoice_paid, invoice_overdue, quote_approved, quote_declined, proposal_approved, task_due, task_overdue

**Server actions:** `markNotificationRead`, `markAllRead`

---

### Task 5 — Payment Method Detail

**What it does:** Mark-paid becomes a real accounting action, not a checkbox.

**Migration:** Add to `payments` table:
```sql
ALTER TABLE payments ADD COLUMN method TEXT CHECK (method IN ('cash','cheque','bank_transfer','upi','card','ach'));
ALTER TABLE payments ADD COLUMN reference TEXT;
ALTER TABLE payments ADD COLUMN cheque_number TEXT;
ALTER TABLE payments ADD COLUMN cheque_date DATE;
ALTER TABLE payments ADD COLUMN bank_name TEXT;
```

**UI:** Mark-paid button opens modal with method selector. Fields show conditionally (cheque # only for cheque, reference for bank/UPI/ACH).

**Invoice view:** Payment history tab — date, amount, method, reference.

---

### Task 6 — Payment Voucher Document Type

**What it does:** Auto-generated accounting record when invoice marked paid.

**Document type:** `payment_voucher` added to enum

**Auto-creation:** When `markInvoicePaid` server action runs → create linked payment_voucher document

**PDF layout:** Voucher #, Invoice ref, Client, Amount, Method, Cheque/Ref details, Date, Authorized by (profile name)

**Accessible:** Document list, client portal

---

### Task 7 — LPO (Local Purchase Order) Document Type

**What it does:** Freelancer records receiving an LPO from client. Critical for UAE/MENA B2B.

**Document type:** `lpo` added to enum

**Fields:** LPO number (client's ref), issuing client, linked project, amount, date received, validity date, notes

**Flow:** LPO received → freelancer logs it → links to project → appears in client portal → when work done, create invoice linked to LPO

**PDF:** Mirrors the LPO structure — freelancer's acknowledgment copy

---

### Task 8 — Receipt Document Type

**What it does:** Sent to client confirming payment received.

**Auto-creation:** When payment voucher created → receipt offered for sending

**PDF:** Receipt #, For Invoice #, Client, Amount paid, Method, Date, Thank you footer

**Send:** Resend email with PDF attached (reuse send-invoice pattern)

---

## Phase 2.6 — Regional Compliance

*Non-negotiable before launch. Target users will leave for FreshBooks if VAT/GST wrong.*

### Task 9 — Flexible Tax Engine

**Settings:** `/settings/business` — tax type (VAT/GST/CGST+SGST/IGST/None), default rate, compound tax toggle

**Per-invoice override:** Tax type + rate editable per invoice

**Invoice PDF:** Shows tax breakdown correctly:
- VAT: subtotal + VAT (X%) = total
- GST India: subtotal + CGST (9%) + SGST (9%) = total (or IGST 18% for inter-state)
- None: no tax line

**Migration:**
```sql
ALTER TABLE profiles ADD COLUMN tax_type TEXT DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN default_tax_rate NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN secondary_tax_rate NUMERIC; -- SGST when CGST used
ALTER TABLE profiles ADD COLUMN tax_label TEXT; -- "VAT" | "GST" | "CGST"
ALTER TABLE profiles ADD COLUMN secondary_tax_label TEXT; -- "SGST"
ALTER TABLE documents ADD COLUMN tax_type TEXT;
ALTER TABLE documents ADD COLUMN secondary_tax_rate NUMERIC;
ALTER TABLE documents ADD COLUMN secondary_tax_amount NUMERIC;
```

---

### Task 10 — Multi-Currency

**Profile:** Default currency selector (USD/AED/INR/GBP/SAR/QAR/KWD/SGD/MYR/EUR)

**Per-client:** Billing currency (overrides profile default)

**Per-invoice:** Currency + manual FX rate field (no live rates — manual is safer, no API key needed)

**Display:** Correct symbol everywhere (`₹`, `AED`, `£`, `$`, etc.)

**PDF:** Invoice currency + if FX rate set, show "Amount in USD: X" footer line

**Migration:**
```sql
ALTER TABLE documents ADD COLUMN currency TEXT DEFAULT 'USD';
ALTER TABLE documents ADD COLUMN fx_rate NUMERIC DEFAULT 1;
ALTER TABLE clients ADD COLUMN default_currency TEXT;
ALTER TABLE profiles ADD COLUMN default_currency TEXT DEFAULT 'USD';
```

---

### Task 11 — Compliance Profile Fields

**Settings → Business:** Add fields:
- Tax ID (text input, label changes based on tax type: TRN for UAE, GSTIN for India, VAT Reg No for UK)
- Business type (Sole Trader / LLC / Partnership / Other)
- Buyer tax ID field on client record (client's TRN/GSTIN)

**Invoice PDF:** Tax ID prints below business name/address automatically when set

**Migration:**
```sql
ALTER TABLE profiles ADD COLUMN tax_id TEXT;
ALTER TABLE profiles ADD COLUMN tax_id_label TEXT;
ALTER TABLE profiles ADD COLUMN business_type TEXT;
ALTER TABLE clients ADD COLUMN tax_id TEXT;
ALTER TABLE clients ADD COLUMN tax_id_label TEXT;
```

---

### Task 12 — HSN/SAC Codes (India)

**Line items:** Optional HSN/SAC code field per line item (text input + searchable dropdown of common codes seeded)

**PDF:** Prints in line items table as extra column when any HSN/SAC is set

**Migration:**
```sql
ALTER TABLE line_items ADD COLUMN hsn_sac_code TEXT;
```

**Seed:** Top 20 common freelance HSN/SAC codes (design: 998314, software: 998314, consulting: 999299, etc.)

---

### Task 13 — UPI Payment Display (India)

**Profile → Payment settings:** UPI ID field

**`/pay/[token]`:** When UPI ID set on profile, show UPI QR code + ID below payment form

**QR:** Generate via `qrcode` npm package — encodes `upi://pay?pa={upi_id}&pn={name}&am={amount}&cu=INR`

**Migration:**
```sql
ALTER TABLE profiles ADD COLUMN upi_id TEXT;
ALTER TABLE profiles ADD COLUMN bank_account_name TEXT;
ALTER TABLE profiles ADD COLUMN bank_account_number TEXT;
ALTER TABLE profiles ADD COLUMN bank_ifsc TEXT;
ALTER TABLE profiles ADD COLUMN bank_iban TEXT;
```

---

### Task 14 — TDS Tracking (India)

**What:** Client deducts 10% TDS before paying. Freelancer receives 90%. Must track for ITR filing.

**Payment modal:** TDS toggle → TDS rate (default 10%) → TDS amount (auto-calc) → TDS certificate upload

**Invoice view:** Shows: Invoiced / TDS Deducted / Net Received

**Finance dashboard:** TDS column in payment table, annual TDS summary card

**Migration:**
```sql
ALTER TABLE payments ADD COLUMN tds_rate NUMERIC;
ALTER TABLE payments ADD COLUMN tds_amount NUMERIC;
ALTER TABLE payments ADD COLUMN tds_certificate_url TEXT;
```

---

### Task 15 — ZATCA QR Code (Saudi Arabia)

**What:** KSA requires base64-encoded TLV QR on all invoices. No API needed.

**Logic:** Pure function `generateZATCAQR({ sellerName, vatNumber, timestamp, totalAmount, vatAmount })` → base64 TLV string

**PDF:** When profile tax type = VAT + tax_id set + client country = SA → embed QR bottom-left of invoice

**TLV encoding:** Tags 1-5 (seller name, VAT number, datetime, total, VAT amount)

---

## Phase 3 — AI Layer

*Now has real data to work with.*

### Task 16 — Cmd+K Palette Shell

**UI only first** — no AI. Keyboard shortcut, modal, search input, recent actions list.

Reference: Linear's Cmd+K

**Sections:**
- Search (clients, projects, documents)
- Quick create (new invoice, new client, start timer)
- Recent (last 5 opened items)
- AI actions (Phase 3.5 — stub for now)

---

### Task 17 — SSE Streaming Infrastructure

**`/api/ai/stream`** — thin proxy to Supabase Edge Function

**`useAIStream` hook** — manages EventSource, streaming state, abort on unmount

**Loading states:** Streaming cursor animation, partial response render, error boundary

---

### Task 18 — Router Agent

Edge Function. Receives Cmd+K input, classifies intent, returns `{ agent, payload }`. Claude Haiku.

---

### Task 19 — Document Writer Agent

Generates proposal/quote/invoice from brief. Streams into Document Studio editor. Claude Sonnet.

---

### Task 20 — Finance Analyst Agent

Revenue Q&A, cashflow summary, anomaly detection. Now has real expense + payment method data. Claude Haiku.

---

### Task 21 — Communication Drafter Agent

Follow-up email drafts, reply suggestions, tone matching. Claude Haiku.

---

### Task 22 — Project Intelligence Agent

Daily digest, risk scoring, deadline warnings. Now has real task data. Claude Haiku.

---

### Task 23 — Follow-Up Engine

Scheduled triggers: invoice overdue → draft email → one-click send. Proposal pending 3 days → nudge.

---

### Task 24 — Relationship Manager Agent

Client health score, churn signals, check-in suggestions. Claude Haiku.

---

## Phase 3.5 — Project Management Depth

### Task 25 — Task Subtasks
Children under tasks. Checkbox list on task detail. Progress bar on parent.

### Task 26 — Timeline/Gantt View
`/projects/[id]` → Timeline tab. Horizontal bars per task, drag to reschedule.

### Task 27 — Project Templates
Save project as template (tasks included). New project from template.

### Task 28 — Milestone Tracking
Milestones on project timeline. Visible in client portal.

---

## Phase 4 — Communication & Automation

### Task 29 — Client Communication Log
Per-project notes + email log. Internal vs client-visible. Timeline view per client.

### Task 30 — Workflow Automations
When: invoice overdue / proposal approved / project status changes
Then: send email / create task / notify / change status

### Task 31 — Email Integration
Gmail/Outlook OAuth. Emails to client auto-logged on project.

### Task 32 — Calendar Integration
Google Calendar sync. Tasks with due dates appear in calendar.

---

## Phase 4.5 — Pro AI

### Task 33 — Pricing Advisor (Pro)
Scope analysis, market rate recommendations. Claude Sonnet.

### Task 34 — Business Strategist (Pro)
Monthly strategic briefing. Claude Opus. Once per user per month.

### Task 35 — pgvector Semantic Search
Embed client notes, project briefs, documents. Semantic search across everything.

---

## Phase 5 — Growth & Scale

### Task 36 — Agency Tier
Multi-user workspace, roles, shared clients/projects.

### Task 37 — Public API
REST API with API key auth. Zapier integration.

### Task 38 — Accounting Export
CSV export, Xero-compatible format, QuickBooks import.

### Task 39 — Mobile (Expo)
React Native app. Timer, quick invoice, notifications.

### Task 40 — Desktop (Tauri)
If warranted by demand. Rust shell + Next.js webview.

---

## Build order logic

```
Real data first → Compliance → AI (needs real data) → Depth → Automation → Scale
```

No AI before expenses + tasks exist.
No launch before VAT/GST works for India/UAE.
No automations before manual workflows are solid.

---

## Per-feature build rule

One branch → one PR → all tests pass → smoke-tested in browser → merge.
No exceptions.
