# CraftlyAI — Wireframe reference for Google Stitch

Use this document as the single source of truth when generating UI in [Google Stitch](https://stitch.withgoogle.com/) (or similar). Each section gives a **screen ID**, **route**, **purpose**, **ASCII wireframe**, and a **copy-paste Stitch prompt** you can paste into Stitch’s prompt box and refine.

**Product:** CraftlyAI — AI-powered OS for freelancers (CRM, documents, time, finance, client portal).  
**Audience:** Solo freelancers ($2k–$15k/mo), tech/design/content, English-first.  
**Visual direction:** Clean SaaS, generous whitespace, sidebar app shell after login; marketing pages feel confident and minimal—not generic “AI slop” purple gradients.

---

## How to use this file in Stitch

1. Pick a **Screen ID** (e.g. `AUTH-LOGIN`).
2. Copy the **Stitch prompt** block for that screen; add your brand colors if you have them.
3. Generate; iterate with “add empty state”, “mobile narrow width”, or “dark mode variant” as needed.
4. For flows (onboarding, checkout), generate **one frame per step** using the same Screen ID suffix (`ONBOARD-01`, `ONBOARD-02`, …).

**Global layout tokens (suggest in prompts):** top nav or sidebar width ~240px; main content max-width ~1280px; card radius `rounded-xl`; primary actions one per region.

---

## Legend (ASCII)

```
[ ] = placeholder text/input
( ) = secondary / ghost
| | = sidebar
--- = divider
```

---

# A. Implemented routes (build these first)

## HOME — Marketing landing

| Field | Value |
|--------|--------|
| **Route** | `/` |
| **Screen ID** | `HOME` |

**ASCII wireframe**

```
┌─────────────────────────────────────────────────────────────┐
│  Logo   CraftlyAI          Features  Pricing    [ Log in ] [Sign up] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Headline: run your freelance business in one place       │
│   Subcopy + primary [ Get started ]  secondary ( Learn )    │
│                                                             │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐                       │
│   │ icon    │ │ icon    │ │ icon    │   (3 feature tiles)    │
│   │ CRM     │ │ Docs    │ │ Time    │                       │
│   └─────────┘ └─────────┘ └─────────┘                       │
│                                                             │
│   footer: links · © year                                   │
└─────────────────────────────────────────────────────────────┘
```

**Stitch prompt**

> Desktop web landing page for a SaaS called CraftlyAI for freelancers. Header with logo left, nav links center-right, Log in and Sign up buttons. Hero: bold headline, supporting line, two CTAs. Below: three equal feature cards (CRM, documents, time tracking). Minimal footer. Light mode, professional, lots of whitespace—not purple AI gradient cliché.

---

## AUTH-LOGIN — Sign in

| Field | Value |
|--------|--------|
| **Route** | `/auth/login` |
| **Screen ID** | `AUTH-LOGIN` |

**ASCII wireframe**

```
┌─────────────────────────────────────────────────────────────┐
│                      centered card (~400px)                  │
│   CraftlyAI                                                  │
│   Sign in to your account                                   │
│   [ Email                           ]                        │
│   [ Password              👁        ]                        │
│   [ Sign in ]                                                │
│   ─────────── or ───────────                                  │
│   [ Continue with Google ]                                   │
│   Forgot password? · Don't have an account? Sign up        │
└─────────────────────────────────────────────────────────────┘
```

**Stitch prompt**

> Auth screen: centered card on neutral background. Title “Sign in”, email field, password field with show/hide, primary “Sign in”, divider “or”, Google OAuth button, links for forgot password and sign up. Clean form layout, accessible labels, mobile-friendly stacked fields.

---

## AUTH-SIGNUP — Create account

| Field | Value |
|--------|--------|
| **Route** | `/auth/sign-up` |
| **Screen ID** | `AUTH-SIGNUP` |

**ASCII wireframe**

```
┌─────────────────────────────────────────────────────────────┐
│   Sign up                                                    │
│   [ Email ]                                                  │
│   [ Password ]                                               │
│   [ Repeat password ]                                        │
│   [ Create account ]                                         │
│   [ Continue with Google ]                                   │
│   Already have an account? Log in                            │
└─────────────────────────────────────────────────────────────┘
```

**Stitch prompt**

> Sign-up form in a centered card: email, password, confirm password, primary “Create account”, Google button below, link to log in. Same visual system as login—paired screens.

---

## AUTH-FORGOT — Forgot password

| Field | Value |
|--------|--------|
| **Route** | `/auth/forgot-password` |
| **Screen ID** | `AUTH-FORGOT` |

**ASCII wireframe**

```
┌─────────────────────────────────────────────────────────────┐
│   Reset password                                             │
│   Enter your email for a reset link.                       │
│   [ Email ]                                                  │
│   [ Send reset link ]                                        │
│   ← Back to login                                            │
└─────────────────────────────────────────────────────────────┘
```

**Stitch prompt**

> Simple forgot-password card: short explanation, single email field, primary submit, back link to login.

---

## AUTH-UPDATE-PASSWORD — Set new password (magic link / recovery)

| Field | Value |
|--------|--------|
| **Route** | `/auth/update-password` |
| **Screen ID** | `AUTH-UPDATE-PASSWORD` |

**ASCII wireframe**

```
┌─────────────────────────────────────────────────────────────┐
│   Set new password                                           │
│   [ New password ]                                           │
│   [ Confirm new password ]                                   │
│   [ Update password ]                                        │
└─────────────────────────────────────────────────────────────┘
```

**Stitch prompt**

> Password update form after email link: new password, confirm, single primary button. Same card style as other auth screens.

---

## AUTH-SIGNUP-SUCCESS — Check email

| Field | Value |
|--------|--------|
| **Route** | `/auth/sign-up-success` |
| **Screen ID** | `AUTH-SIGNUP-SUCCESS` |

**ASCII wireframe**

```
┌─────────────────────────────────────────────────────────────┐
│   ✉  Check your email                                        │
│   We sent a confirmation link to [email].                  │
│   [ Resend ] (optional)   Back to home                       │
└─────────────────────────────────────────────────────────────┘
```

**Stitch prompt**

> Success state after sign-up: illustration or mail icon, heading “Check your email”, explanatory text, optional secondary resend, link home. Calm, reassuring.

---

## AUTH-ERROR — Auth error

| Field | Value |
|--------|--------|
| **Route** | `/auth/error` |
| **Screen ID** | `AUTH-ERROR` |

**ASCII wireframe**

```
┌─────────────────────────────────────────────────────────────┐
│   Something went wrong                                       │
│   Short error description (from provider).                 │
│   [ Try again ]  [ Back to login ]                         │
└─────────────────────────────────────────────────────────────┘
```

**Stitch prompt**

> Error page for OAuth/email auth failure: clear heading, message area, try again and back to login. Non-alarming but honest.

---

## PROTECTED — Logged-in placeholder

| Field | Value |
|--------|--------|
| **Route** | `/protected` |
| **Screen ID** | `PROTECTED` |

**ASCII wireframe**

```
┌─────────────────────────────────────────────────────────────┐
│  You are logged in · [ Sign out ]                           │
│  (temporary placeholder until dashboard shell exists)       │
└─────────────────────────────────────────────────────────────┘
```

**Stitch prompt**

> Minimal logged-in placeholder: simple confirmation message and sign out. Full-width content area, no sidebar yet.

---

# B. Planned — Onboarding (post-signup, 3 steps)

## ONBOARD-01 — Profile

| Field | Value |
|--------|--------|
| **Route** | `/onboarding` (step 1) |
| **Screen ID** | `ONBOARD-01` |

**ASCII wireframe**

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1 of 3 ·████████░░░░░░                                │
│  Tell us about you                                           │
│  [ Full name ]                                               │
│  [ Role / title ]                                            │
│  [ Timezone ] (select)                                       │
│        [ Back ]            [ Continue ]                      │
└─────────────────────────────────────────────────────────────┘
```

**Stitch prompt**

> Onboarding step 1 of 3: progress bar at top, “Tell us about you”, fields for full name, role, timezone dropdown, Back disabled or subtle, Continue primary. Single column, mobile-first.

---

## ONBOARD-02 — Brand kit

| Field | Value |
|--------|--------|
| **Route** | `/onboarding` (step 2) |
| **Screen ID** | `ONBOARD-02` |

**ASCII wireframe**

```
┌─────────────────────────────────────────────────────────────┐
│  Step 2 of 3                                                │
│  Your brand                                                  │
│  [ Upload logo ]  dropzone                                   │
│  Primary color [■]  Secondary [■]                           │
│  [ Font preference ] optional                                │
│        [ Back ]            [ Continue ]                      │
└─────────────────────────────────────────────────────────────┘
```

**Stitch prompt**

> Onboarding step 2: logo upload dropzone, two color pickers for primary/secondary brand colors, optional font. Visual preview strip showing logo + colors.

---

## ONBOARD-03 — First client

| Field | Value |
|--------|--------|
| **Route** | `/onboarding` (step 3) |
| **Screen ID** | `ONBOARD-03` |

**ASCII wireframe**

```
┌─────────────────────────────────────────────────────────────┐
│  Step 3 of 3                                                │
│  Add your first client                                       │
│  [ Client name ]                                             │
│  [ Email ]                                                   │
│  [ Company (optional) ]                                      │
│        [ Back ]            [ Finish & go to dashboard ]      │
└─────────────────────────────────────────────────────────────┘
```

**Stitch prompt**

> Onboarding final step: simple CRM-lite form—client name, email, optional company. Strong finish CTA “Finish & go to dashboard”. Celebrate completion subtly (no confetti overload).

---

# C. Planned — App shell + core modules (dashboard)

Use **APP-SHELL** as the frame wrapper for all authenticated app screens below.

## APP-SHELL — Sidebar layout

| Field | Value |
|--------|--------|
| **Route** | `(dashboard)/*` |
| **Screen ID** | `APP-SHELL` |

**ASCII wireframe**

```
┌──────┬────────────────────────────────────────────────────────┐
│ Logo │  Header: search / Cmd+K placeholder · user menu · theme │
│      ├────────────────────────────────────────────────────────┤
│ Nav  │                                                        │
│ Dash │                    MAIN CONTENT                        │
│ Cli  │                                                        │
│ Proj │                                                        │
│ Docs │                                                        │
│ Fin  │                                                        │
│ Time │                                                        │
│ Set  │                                                        │
│      │                                                        │
└──────┴────────────────────────────────────────────────────────┘
```

**Stitch prompt**

> Desktop SaaS shell: left sidebar 240px with logo, navigation items (Dashboard, Clients, Projects, Documents, Finance, Time, Settings), icons + labels. Top bar with global search field (Cmd+K hint), notifications bell, user avatar dropdown, theme toggle. Main area is white/dark content panel with padding.

---

## DASH-HOME — Dashboard home

| Field | Value |
|--------|--------|
| **Route** | `/dashboard` |
| **Screen ID** | `DASH-HOME` |

**ASCII wireframe**

```
┌─────────────────────────────────────────────────────────────┐
│  Good morning, [Name]                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                 │
│  │ Revenue│ │ Outstd │ │ Hours │ │ Active│  (stat cards)   │
│  └────────┘ └────────┘ └────────┘ └────────┘                 │
│  ┌──────────────────────────┐ ┌──────────────────────────┐ │
│  │ Upcoming deadlines        │ │ Recent activity           │ │
│  │ (list)                    │ │ (list)                    │ │
│  └──────────────────────────┘ └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Stitch prompt**

> Dashboard home inside app shell: greeting, row of four KPI stat cards (revenue, outstanding, hours this week, active projects), two columns below—upcoming deadlines table/list and recent activity feed. Dense but readable.

---

## CLIENTS-LIST — Clients table

| Field | Value |
|--------|--------|
| **Route** | `/clients` |
| **Screen ID** | `CLIENTS-LIST` |

**ASCII wireframe**

```
┌─────────────────────────────────────────────────────────────┐
│  Clients                         [ + Add client ]  [Filter] │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Name      Company    Email        Health   ⋮        │    │
│  │ row...                                              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Stitch prompt**

> Clients list: page title, primary “Add client”, filter/search. Data table with columns name, company, email, health score badge, row actions menu. Empty state: illustration + “Add your first client”.

---

## CLIENT-DETAIL — Single client

| Field | Value |
|--------|--------|
| **Route** | `/clients/[id]` |
| **Screen ID** | `CLIENT-DETAIL` |

**ASCII wireframe**

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back    Client name                    [ Edit ] [ … ]    │
│  Health: ●●●○○  ·  contact · currency                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ Projects    │ │ Documents   │ │ Notes       │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│  (tabs or stacked sections)                                  │
└─────────────────────────────────────────────────────────────┘
```

**Stitch prompt**

> Client detail: header with name, health indicator, edit menu. Tabs for Projects, Documents, Notes/activity. Card sections below. Professional CRM detail page.

---

## PROJECTS-LIST / PROJECT-DETAIL

| Field | Value |
|--------|--------|
| **Routes** | `/projects`, `/projects/[id]` |
| **Screen IDs** | `PROJECTS-LIST`, `PROJECT-DETAIL` |

**ASCII (list)**

```
│  Projects    [ + New project ]   Filter by client · status   │
│  Table: title · client · status · deadline · budget           │
```

**ASCII (detail)**

```
│  Project title · status pill · client link                    │
│  Overview | Tasks | Time | Documents                        │
│  Task list with checkboxes, due dates, priority             │
```

**Stitch prompt (list)**

> Projects index with filters, table of projects with status badges and deadlines, empty state for new users.

**Stitch prompt (detail)**

> Project workspace: header with status, tabs for overview/tasks/time/documents, task list with priorities.

---

## DOCUMENTS-LIST / DOCUMENT-EDITOR

| Field | Value |
|--------|--------|
| **Routes** | `/documents`, `/documents/[id]` |
| **Screen IDs** | `DOCS-LIST`, `DOC-EDITOR` |

**ASCII (list)**

```
│  Documents   [ + New ]   Type: invoice · quote · proposal    │
│  List/cards: title, client, status, last edited               │
```

**ASCII (editor)**

```
│  ← Documents   Document title          [ Preview PDF ] [Send]│
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Rich text / template toolbar (bold, lists, variables)   │ │
│  │                                                         │ │
│  │  Body content area...                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│  Side panel: variables · client info · line items (finance)  │
```

**Stitch prompt**

> Document list with type filters; document editor full-width with toolbar, canvas, right sidebar for variables and metadata—Feels like Notion meets invoice builder.

---

## FINANCE-DASH — Finance overview

| Field | Value |
|--------|--------|
| **Route** | `/finance` |
| **Screen ID** | `FINANCE-DASH` |

**ASCII wireframe**

```
│  Finance                                                     │
│  [ Revenue chart - bar/line ]      Summary cards             │
│  Outstanding invoices table                                  │
│  Recent expenses                                             │
```

**Stitch prompt**

> Finance dashboard: chart area (revenue over time), KPIs, tables for outstanding invoices and recent expenses. Calm fintech aesthetic—charts from Recharts style.

---

## TIME-TRACKER — Time

| Field | Value |
|--------|--------|
| **Route** | `/time` |
| **Screen ID** | `TIME-TRACKER` |

**ASCII wireframe**

```
│  Time                                                        │
│  ┌──────────────────────────────────────┐                   │
│  │  ● Running: Project · Task   [ Stop ] │  timer hero      │
│  └──────────────────────────────────────┘                   │
│  Today’s entries (table) · [ + Manual entry ]                │
```

**Stitch prompt**

> Time tracking page: prominent running timer with project/task selector, start/stop, below a table of today’s entries with duration; manual entry modal suggested as secondary flow.

---

## SETTINGS — Settings hub

| Field | Value |
|--------|--------|
| **Route** | `/settings` |
| **Screen ID** | `SETTINGS` |

**ASCII wireframe**

```
│  Settings                                                    │
│  ┌──────────┐  ┌─────────────────────────────────────────┐  │
│  │ Profile  │  │  Section content (form fields)          │  │
│  │ Brand    │  │                                         │  │
│  │ Billing  │  │                                         │  │
│  │ Notif.   │  │                                         │  │
│  └──────────┘  └─────────────────────────────────────────┘  │
```

**Stitch prompt**

> Settings layout: left sub-navigation, right content panel for profile, brand kit, notifications—similar to Linear or Notion settings.

---

## BILLING — Plan & subscription

| Field | Value |
|--------|--------|
| **Route** | `/billing` |
| **Screen ID** | `BILLING` |

**ASCII wireframe**

```
│  Billing                                                     │
│  Current plan: Pro · renews [date]   [ Manage subscription ] │
│  Usage: AI actions · clients · documents (progress bars)      │
│  Invoices (table from Lemon Squeezy)                         │
```

**Stitch prompt**

> Subscription management: current plan card, renewal date, usage meters vs plan limits, link to customer portal, invoice history table.

---

# D. Planned — Marketing

## MKT-PRICING

| **Route** | `/pricing` | **Screen ID** | `MKT-PRICING` |

```
│  Pricing                                                     │
│  Toggle: Monthly / Annual                                    │
│  3–4 tier cards: Free · Starter · Pro · Agency               │
│  Feature comparison table below optional                     │
```

**Stitch prompt**

> SaaS pricing page: billing toggle, tier cards with feature bullets and CTA buttons, optional comparison table. Clear hierarchy—Pro tier slightly emphasized.

---

## MKT-ABOUT / MKT-BLOG

| **Routes** | `/about`, `/blog` | **Screen IDs** | `MKT-ABOUT`, `MKT-BLOG` |

**Stitch prompt (about)**

> About page: mission, team placeholder, contact—marketing typography, story-led layout.

**Stitch prompt (blog)**

> Blog index: post cards with title, excerpt, date; optional featured post hero.

---

# E. Planned — AI & command palette (Phase 3)

## CMD-K — Command palette (modal)

| Field | Value |
|--------|--------|
| **Screen ID** | `CMD-K` |

**ASCII wireframe**

```
┌─────────────────────────────────────────────────────────────┐
│  ⌘  Ask CraftlyAI or run a command...                        │
│  ─────────────────────────────────────────────────────────  │
│  Recent                                                      │
│  Suggested actions                                           │
│  ↑↓ navigate · ↵ run · esc close                            │
└─────────────────────────────────────────────────────────────┘
```

**Stitch prompt**

> Cmd+K modal centered on dimmed backdrop: search input, grouped results (recent, suggested, navigation), keyboard hints footer—Raycast/Linear style.

---

## AI-STREAM — Streaming AI response panel

| Field | Value |
|--------|--------|
| **Screen ID** | `AI-STREAM` |

**ASCII wireframe**

```
│  Side panel or bottom sheet:                                 │
│  User message bubble                                         │
│  Assistant message (streaming text)                          │
│  [ Stop ]   [ Insert ] [ Copy ]                              │
```

**Stitch prompt**

> AI assistant panel with streaming text animation area, action buttons for insert/copy, stop generation—subtle, doesn’t overpower main UI.

---

# F. Planned — Client portal (public link)

## PORTAL-DOC — Client views document / pays

| Field | Value |
|--------|--------|
| **Screen ID** | `PORTAL-DOC` |

**ASCII wireframe**

```
│  [ Freelancer logo ]                                         │
│  Quote #123 · Prepared for Client Co.                        │
│  PDF preview or read-only doc                                │
│  [ Approve ]     [ Pay deposit ]  (Stripe embed area)        │
```

**Stitch prompt**

> Branded but minimal client-facing page: freelancer logo, document summary, approval and payment CTAs, trustworthy payment zone—no full app chrome.

---

# G. System surfaces (every product needs these)

## EMPTY-GENERIC — Generic empty state

**Stitch prompt**

> Empty state illustration area, short headline, one sentence, primary CTA—usable for any list page.

---

## 404 / ERROR-APP

**Stitch prompt**

> Friendly 404 inside app shell: “Page not found”, link back to dashboard.

---

## LOADING-SKELETON

**Stitch prompt**

> Dashboard skeleton: shimmering placeholders for stat cards and two-column content—matches DASH-HOME layout.

---

## Screen checklist (print or tick in Stitch)

| ID | Screen |
|----|--------|
| HOME | Landing |
| AUTH-LOGIN | Login |
| AUTH-SIGNUP | Sign up |
| AUTH-FORGOT | Forgot password |
| AUTH-UPDATE-PASSWORD | Set password |
| AUTH-SIGNUP-SUCCESS | Check email |
| AUTH-ERROR | Auth error |
| PROTECTED | Logged-in placeholder |
| ONBOARD-01 — 03 | Onboarding steps |
| APP-SHELL | Sidebar layout |
| DASH-HOME | Dashboard |
| CLIENTS-LIST | Clients |
| CLIENT-DETAIL | Client |
| PROJECTS-LIST | Projects |
| PROJECT-DETAIL | Project |
| DOCS-LIST | Documents |
| DOC-EDITOR | Document editor |
| FINANCE-DASH | Finance |
| TIME-TRACKER | Time |
| SETTINGS | Settings |
| BILLING | Billing |
| MKT-PRICING | Pricing |
| MKT-ABOUT | About |
| MKT-BLOG | Blog |
| CMD-K | Command palette |
| AI-STREAM | AI panel |
| PORTAL-DOC | Client portal |
| EMPTY-GENERIC | Empty state |
| 404 | Not found |
| LOADING-SKELETON | Skeleton |

---

*Last updated: 2026-05-10 — aligned with `CLAUDE.md` product map and current `app/**/page.tsx` routes.*
