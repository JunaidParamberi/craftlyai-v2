# CraftlyAI — Design System & Screen Specifications

> **Purpose:** Upload this document to Google Stitch (or any AI design tool) to generate pixel-perfect UI/UX for CraftlyAI. Every token, component, and screen is fully specified. The goal: simple enough for a first-time freelancer, beautiful enough to make them proud to show clients.

---

## 1. Design Philosophy

### Core Principles

| Principle | What it means |
|-----------|--------------|
| **Calm confidence** | Nothing shouts. Every element earns its place. White space is used aggressively. |
| **Invisible intelligence** | AI features feel like natural extensions of the UI, not bolted-on chatbots. |
| **Freelancer-first clarity** | One action per screen. No dashboards that overwhelm. Data only when relevant. |
| **Premium but approachable** | Feels like a tool made by someone who respects the user's time. Not corporate, not toy. |

### Visual Reference Mood
- Clean like **Linear** (tight grid, high-contrast text, micro-interactions)
- Warm like **Notion** (readable, human, not sterile)
- Confident like **Stripe** (financial trust, precise typography)
- Dark accents like **Vercel** (navy/midnight sidebar, white content area)

---

## 2. Color System

### Brand Palette

```
Primary Navy    #1E3A5F   — Sidebar, headers, trust elements
Electric Blue   #2B7FFF   — Primary CTAs, active states, links
```

### Semantic Tokens

```
Background / Base
  bg-app          #F4F6F9   — App canvas (main content area)
  bg-surface      #FFFFFF   — Cards, panels, modals
  bg-sidebar      #0F1F33   — Left navigation
  bg-sidebar-item #162840   — Sidebar hover state
  bg-muted        #EFF4FF   — Subtle highlight, table rows alt

Text
  text-primary    #0F1F33   — Headings, important labels
  text-secondary  #475569   — Body, descriptions
  text-muted      #94A3B8   — Placeholders, timestamps, hints
  text-inverse    #FFFFFF   — On dark backgrounds

Border
  border-default  #E2E8F0   — Card edges, input borders
  border-focus    #2B7FFF   — Focused inputs
  border-strong   #CBD5E1   — Dividers, table lines

Status Colors
  success-bg      #F0FDF4   success-text  #166534   success-border  #86EFAC
  warning-bg      #FFFBEB   warning-text  #92400E   warning-border  #FCD34D
  error-bg        #FEF2F2   error-text    #991B1B   error-border    #FCA5A5
  info-bg         #EFF6FF   info-text     #1D4ED8   info-border     #93C5FD

Document Status Badges
  draft           bg #F1F5F9  text #475569
  sent            bg #EFF6FF  text #1D4ED8
  viewed          bg #F5F3FF  text #6D28D9
  approved        bg #F0FDF4  text #166534
  paid            bg #F0FDF4  text #166534
  overdue         bg #FEF2F2  text #991B1B
  declined        bg #FFF7ED  text #9A3412
```

---

## 3. Typography

### Font Stack
**Primary:** `Inter` (Google Fonts)
**Monospace:** `JetBrains Mono` (for invoice numbers, tokens, code)
**Fallback:** `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `display-xl` | 48px | 800 | 1.1 | Hero headlines only |
| `display-lg` | 36px | 700 | 1.15 | Page titles |
| `display-md` | 28px | 700 | 1.2 | Section headers |
| `heading-lg` | 22px | 600 | 1.3 | Card titles, modal headers |
| `heading-md` | 18px | 600 | 1.35 | Sub-section titles |
| `heading-sm` | 15px | 600 | 1.4 | Label headers, table columns |
| `body-lg` | 16px | 400 | 1.6 | Primary body text |
| `body-md` | 14px | 400 | 1.6 | Secondary body, descriptions |
| `body-sm` | 13px | 400 | 1.5 | Hints, captions, metadata |
| `label` | 12px | 500 | 1.4 | ALL CAPS form labels (letter-spacing: 0.08em) |
| `mono` | 13px | 400 | 1.5 | Invoice numbers, IDs, tokens |

### Text Rules
- Headings: always `text-primary` (#0F1F33)
- Body: `text-secondary` (#475569)
- Never center body text — left-align everything except empty states
- Paragraph max-width: **680px** (readability cap)
- Letter-spacing on labels: `0.06em` uppercase

---

## 4. Spacing System

Base unit: **4px**. All spacing is multiples of 4.

```
space-1    4px
space-2    8px
space-3    12px
space-4    16px
space-5    20px
space-6    24px
space-8    32px
space-10   40px
space-12   48px
space-16   64px
space-20   80px
space-24   96px
```

### Layout Grid
- **Sidebar width:** 240px (collapsed: 60px)
- **Page content max-width:** 1200px (centered)
- **Content padding horizontal:** 32px (desktop), 16px (mobile)
- **Card padding:** 24px
- **Section vertical gap:** 32px
- **Form field gap:** 16px

---

## 5. Border Radius

```
radius-sm    4px    — Badges, tags, small chips
radius-md    8px    — Buttons, inputs, small cards
radius-lg    12px   — Cards, panels, dropdowns
radius-xl    16px   — Modals, large sheets
radius-2xl   24px   — Feature cards, hero elements
radius-full  9999px — Pills, avatars, toggles
```

---

## 6. Shadows & Elevation

```
shadow-xs    0 1px 2px rgba(0,0,0,0.05)                      — Subtle lift (buttons)
shadow-sm    0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)  — Cards at rest
shadow-md    0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)  — Floating cards
shadow-lg    0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04) — Modals, drawers
shadow-focus 0 0 0 3px rgba(43,127,255,0.25)                  — Input/button focus ring
```

---

## 7. Iconography

**Library:** Lucide React (all icons)
**Size scale:**
- `icon-xs` — 14px (inline text icons)
- `icon-sm` — 16px (buttons, dense UI)
- `icon-md` — 20px (sidebar, cards — default)
- `icon-lg` — 24px (empty states, feature icons)
- `icon-xl` — 32px (hero icons)

**Style rules:**
- Stroke width: 1.5px always
- Never fill icons — outline only
- Color matches surrounding text unless accent-colored
- Icon + label gap: 8px

---

## 8. Primitive Components

### 8.1 Button

**Variants:**

```
Primary     bg #2B7FFF  text white   hover: bg #1A6EF0   border: none
Secondary   bg #EFF4FF  text #2B7FFF hover: bg #DBEAFE   border: 1px #BFDBFE
Ghost       bg transparent text #475569 hover: bg #F1F5F9 border: none
Danger      bg #FEF2F2  text #991B1B hover: bg #FEE2E2   border: 1px #FCA5A5
Dark        bg #0F1F33  text white   hover: bg #1E3A5F   border: none
```

**Sizes:**

```
sm    height 32px  padding 0 12px  fontSize 13px  radius 6px
md    height 36px  padding 0 16px  fontSize 14px  radius 8px   (default)
lg    height 44px  padding 0 20px  fontSize 15px  radius 8px
xl    height 52px  padding 0 24px  fontSize 16px  radius 10px
```

**States:** default → hover (shadow-xs lift) → active (scale 0.98) → focus (shadow-focus ring) → disabled (opacity 0.4, cursor not-allowed)

**Icon button:** square, same height as size variant, icon centered

---

### 8.2 Input

```
Height:       36px (sm) / 40px (md, default) / 44px (lg)
Border:       1px solid #E2E8F0
Border-focus: 1px solid #2B7FFF + shadow-focus
Radius:       8px
Padding:      0 12px
Background:   #FFFFFF
Placeholder:  #94A3B8
Font:         14px Inter 400

States:
  default   border #E2E8F0
  hover     border #CBD5E1
  focus     border #2B7FFF, ring rgba(43,127,255,0.2)
  error     border #FCA5A5, bg #FEF9F9
  disabled  bg #F8FAFC, opacity 0.6
```

**Input group:** icon-left (16px, color #94A3B8, left-pad 36px) or suffix button (e.g. copy, clear)

---

### 8.3 Textarea

Same as input. Min-height 96px. Resize: vertical only.

---

### 8.4 Select / Dropdown

Same height as input. Right chevron icon (16px). Dropdown panel: bg white, radius-lg, shadow-lg, border 1px #E2E8F0. Options: 36px height, hover bg #F8FAFC, active/selected bg #EFF6FF text #2B7FFF with checkmark icon right.

---

### 8.5 Form Label

```
font-size:    12px
font-weight:  500
color:        #475569
margin-bottom: 6px
letter-spacing: 0.04em
```

Required asterisk: `color #EF4444`, margin-left 3px.
Helper text below input: 12px, color #94A3B8.
Error text below input: 12px, color #DC2626.

---

### 8.6 Card

```
Background:   #FFFFFF
Border:       1px solid #E2E8F0
Border-radius: 12px
Padding:      24px
Shadow:       shadow-sm
Hover:        shadow-md + border-color #CBD5E1 (transition 150ms)
```

**Card Header:** title (heading-md) + optional subtitle (body-sm, text-muted). Flex row with optional right-side action button.
**Card Divider:** 1px #E2E8F0, margin 0 -24px (full bleed inside card).
**Card Footer:** bg #F8FAFC, border-top 1px #E2E8F0, padding 16px 24px, border-radius 0 0 12px 12px.

---

### 8.7 Badge / Status Chip

```
Height:        22px
Padding:       0 8px
Radius:        radius-full
Font:          12px weight 500
Dot:           6px circle, same color as text, margin-right 6px
```

Uses status color tokens from Color System section.

---

### 8.8 Avatar

```
Sizes: 24px / 32px / 40px / 48px / 64px
Shape: circle (radius-full)
Fallback: initials (1-2 chars), bg derived from name hash using palette
Border: 2px white (when stacked/grouped)
```

---

### 8.9 Table

```
Header row:   bg #F8FAFC, border-bottom 2px #E2E8F0
              font: 12px 500 uppercase letter-spacing 0.06em color #475569
Data row:     border-bottom 1px #F1F5F9, height 52px
              hover: bg #F8FAFC (transition 100ms)
Cell padding: 0 16px
Checkbox col: 40px fixed width
Actions col:  right-aligned, opacity 0 → visible on row hover
Sticky header: position sticky, top 0, z-index 10
```

---

### 8.10 Modal / Dialog

```
Overlay:      rgba(0,0,0,0.45) backdrop-blur 4px
Panel:        bg white, radius-xl, shadow-lg
Width:        sm 400px / md 560px / lg 720px / xl 960px / fullscreen
Header:       24px padding, border-bottom 1px #E2E8F0, title heading-lg + close X button
Body:         24px padding
Footer:       24px padding, border-top 1px #E2E8F0, right-aligned buttons (cancel ghost + primary)
Animation:    fade in + scale from 0.96 → 1.0 in 150ms ease-out
```

---

### 8.11 Sidebar Navigation Item

```
Height:       40px
Padding:      0 12px
Radius:       8px
Icon:         20px, color #94A3B8 default → #FFFFFF active
Label:        14px 500, color #94A3B8 default → #FFFFFF active
Active state: bg #2B7FFF, icon+label white
Hover state:  bg #162840, icon+label #FFFFFF
Badge count:  right-aligned pill, bg #2B7FFF, text white, 11px
```

---

### 8.12 Empty State

```
Container:   centered, max-width 400px, padding 80px 0
Icon:        48px, color #CBD5E1, Lucide icon related to section
Title:       20px 600, text-primary, margin-top 16px
Description: 14px, text-muted, max-width 280px, text-center, margin-top 8px
CTA button:  primary md, margin-top 24px
```

---

### 8.13 Toast / Notification

```
Position:    bottom-right, gap 8px between toasts
Width:       360px
Radius:      radius-lg
Shadow:      shadow-lg
Padding:     16px
Duration:    success/info 3s, warning 5s, error persist until dismissed
Types:       success (green left border 3px) / error / warning / info
Animation:   slide up + fade in from bottom-right
```

---

### 8.14 Tooltip

```
Bg:          #1E3A5F (navy)
Text:        white 12px
Padding:     6px 10px
Radius:      6px
Max-width:   220px
Delay:       300ms show, 100ms hide
Arrow:       4px triangle pointing to trigger
```

---

### 8.15 Tabs

```
Container:   border-bottom 1px #E2E8F0
Tab item:    height 40px, padding 0 16px, font 14px 500
Active:      color #2B7FFF, border-bottom 2px #2B7FFF
Inactive:    color #64748B, no border
Hover:       color #0F1F33
```

---

### 8.16 Toggle / Switch

```
Track:       32px × 18px, radius-full
On:          bg #2B7FFF
Off:         bg #CBD5E1
Thumb:       14px circle, white, shadow-xs
Animation:   150ms ease-in-out translate
```

---

### 8.17 Stat / KPI Card

```
Card base styles + inside:
  Label:     12px 500 uppercase text-muted letter-spacing 0.06em
  Value:     28px 700 text-primary font Inter
  Delta:     13px, up = #166534 ▲, down = #991B1B ▼
  Icon:      top-right corner, 40px circle bg (brand-tinted), 20px icon
```

---

## 9. Layout System

### App Shell

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (240px fixed left, bg #0F1F33)             │
│  ┌──────────────────────────────────────────────┐   │
│  │ Logo (32px) + wordmark                       │   │
│  │ ─────────────────────────────────────────    │   │
│  │ [Search / Cmd+K bar]                         │   │
│  │ ─────────────────────────────────────────    │   │
│  │ NAV ITEMS:                                   │   │
│  │   Dashboard                                  │   │
│  │   Clients                                    │   │
│  │   Projects                                   │   │
│  │   Documents                                  │   │
│  │   Finance                                    │   │
│  │   Time                                       │   │
│  │ ─────────────────────────────────────────    │   │
│  │   Settings                                   │   │
│  │   Support                                    │   │
│  │ ─────────────────────────────────────────    │   │
│  │ [User avatar + name + plan badge]            │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  MAIN CONTENT (flex-1, bg #F4F6F9)                  │
│  ┌─────────────────────────────────────────────┐    │
│  │ TOP BAR (56px, bg white, border-bottom)     │    │
│  │ [Page title]        [actions / CTAs]        │    │
│  ├─────────────────────────────────────────────┤    │
│  │ CONTENT AREA (padding 32px)                 │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Page Top Bar Spec
```
Height:        56px
Background:    #FFFFFF
Border-bottom: 1px #E2E8F0
Padding:       0 32px
Content:       page title (heading-lg) LEFT + actions (buttons) RIGHT
Sticky:        position sticky top 0, z-index 20
```

---

## 10. Screen Specifications

---

### Screen 01 — Login / Auth

**Layout:** Centered card on split background (left: navy #1E3A5F with abstract pattern, right: white form)

**Left panel (50%):**
- CraftlyAI logo centered (white)
- Tagline: *"Your freelance business, on autopilot."*
- 3 brief feature bullets with checkmark icons
- Subtle floating UI card mockup

**Right panel (50%):**
- Card centered vertically (max-width 400px)
- Heading: "Sign in to CraftlyAI" (24px 700)
- Google OAuth button (white, border, Google logo, "Continue with Google")
- Divider "or continue with email"
- Email input
- Password input + show/hide toggle
- "Forgot password?" link (right-aligned, small)
- Primary button full-width: "Sign in"
- Footer: "Don't have an account? **Start free →**"

**States to design:** default, loading (button spinner), error (red banner "Invalid credentials")

---

### Screen 02 — Onboarding (3-step flow)

**Layout:** Centered, no sidebar. Progress stepper at top.

**Stepper:** 3 dots connected by line. Active = filled blue circle with number. Complete = checkmark. Inactive = gray outline.

**Step 1 — Your Profile**
- Upload avatar (dashed circle dropzone, "Upload photo" center)
- Full name input
- What do you do? (select: Designer / Developer / Writer / Consultant / Other)
- Location (country select)
- CTA: "Continue →"

**Step 2 — Brand Kit**
- Logo upload (dropzone, 200×200px preview)
- Primary color (color picker + hex input)
- Secondary color
- Font preference (select: Inter / Plus Jakarta Sans / DM Sans)
- Email signature textarea
- CTA: "Continue →" + "Skip for now" ghost button

**Step 3 — First Client**
- Heading: "Add your first client to get started"
- Client name input
- Email input
- Company (optional)
- CTA: "Add client & enter CraftlyAI →"
- Skip link below

---

### Screen 03 — Dashboard

**Top bar:** "Good morning, Junaid 👋" (22px) + date + "New document" primary button

**KPI Cards Row (4 cards, equal width):**

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Total Revenue   │ │ Outstanding     │ │ Overdue         │ │ Active Projects │
│ $12,400         │ │ $3,200          │ │ $800            │ │ 6               │
│ ▲ 18% vs last  │ │ 4 invoices      │ │ 2 invoices      │ │ 2 due this week │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Main content (2-column, 60/40 split):**

Left column (60%):
- "Recent Activity" card — timeline list of last 10 actions (document sent, client added, invoice paid, timer started). Each item: icon circle + action text + timestamp.

Right column (40%):
- "Quick Actions" card — 4 large tappable tiles in 2×2 grid:
  - New Invoice (FileText icon, blue)
  - New Client (UserPlus icon, green)
  - Start Timer (Play icon, orange)
  - New Proposal (FileCheck icon, purple)
- "Upcoming Deadlines" card — list of 3 nearest project deadlines with client name, days remaining, red if ≤3 days
- "AI Tip of the day" card — light blue bg, sparkle icon, one sentence insight from Finance Agent

---

### Screen 04 — Clients List

**Top bar:** "Clients" title + "Add client" primary button + search input (320px wide)

**Filter bar (below top bar, sticky):**
- Tabs: All / Active / Inactive / At Risk
- Right: sort dropdown "Last updated" + grid/list view toggle

**Table view (default):**

| | Name + Company | Email | Health | Projects | Revenue | Last contact | Actions |
|--|--|--|--|--|--|--|--|
| ☐ | Avatar + Name | email | 🟢 badge | 3 | $4,200 | 3 days ago | ···  |

Health score badge: Excellent (green) / Good (blue) / At risk (orange) / Churning (red)

**Row hover:** show Edit + Archive action icons on right

**Empty state:** No clients illustration + "Add your first client" CTA

---

### Screen 05 — Client Detail

**Layout:** Full page, no sub-nav. Back arrow + "Clients" breadcrumb top-left.

**Client Header Card (full width):**
- Left: Large avatar (64px) + name (display-md) + company + email + phone
- Right: Health score badge + "Copy portal link" button + "Edit" button + "···" overflow
- Bottom row: 4 inline stats — Total billed / Outstanding / Projects / Last activity

**Tabs below header:** Overview · Documents · Projects · Time Entries · Notes

**Overview tab (2-column):**
- Left: Recent documents table (last 5) — type, status, amount, date
- Right: Activity timeline (last 10 events) + Notes card (textarea, auto-save)

---

### Screen 06 — Projects List

Same pattern as Clients List. Table columns: Project name + client / Status / Budget / Spent / % used (mini progress bar) / Deadline / Actions

Status badges: Planning / Active / On hold / Completed / Cancelled

**Progress bar inline:** 100px wide, bg #F1F5F9, fill #2B7FFF. Red fill if spent > 90% of budget.

---

### Screen 07 — Project Detail

**Header card:** Project name (large) + Client name chip + Status badge + Budget: $X,XXX spent of $X,XXX + deadline

**Tabs:** Overview · Tasks · Documents · Time · Files

**Tasks tab:**
- Kanban columns: To Do / In Progress / Review / Done
- Card per task: title + assignee avatar + due date + priority dot
- "Add task" inline at bottom of each column
- Drag to reorder (visual drag ghost)

---

### Screen 08 — Documents List

**Top bar:** "Documents" + "New document" primary button

**Filter bar:** Tabs: All / Invoices / Quotes / Proposals / Contracts
Right: date range picker + status filter dropdown

**Table columns:** Title / Client / Type badge / Status badge / Amount / Created / Sent / Actions

**Type badge colors:**
- Invoice: blue
- Quote: purple
- Proposal: orange
- Contract: gray

---

### Screen 09 — Document Editor (Tiptap)

**Layout:** Full-width editor, floating toolbar, no sidebar (focused mode)

**Header bar (sticky):**
- Left: ← back to Documents + document title (editable inline, click to rename)
- Center: Document type badge
- Right: "Save draft" ghost + "Preview" ghost + "Send" primary button

**Toolbar (below header, sticky, bg white border-bottom):**
- Text: B / I / U / S / H1 / H2 / H3 / Quote
- Lists: bullet / numbered
- Insert: Link / Image / Table / Pricing Table (CraftlyAI custom block) / Variable {{x}}
- Align: left / center / right

**Editor area:**
- Max-width: 800px, centered
- Paper-like feel: bg white, subtle shadow, padding 60px 80px
- Font: Inter 16px, line-height 1.7
- Placeholder: light gray "Start writing your document…"

**Variable picker (when {{  typed):**
- Floating popover below cursor
- Groups: Client / Project / Brand / Date
- Click to insert

**Right panel (240px, collapsible):**
- Document meta: client select, project select, document number (mono), date, due date, currency, terms textarea
- Only shown for Invoice/Quote types

---

### Screen 10 — Invoice View (Sent/Read-only)

**Layout:** Centered document view, max-width 800px, paper feel

**Actions bar (above document):**
- "Download PDF" ghost button
- "Send reminder" ghost button
- "Mark as paid" primary button (if unpaid)
- Status badge (Sent / Viewed / Paid / Overdue)

**Document itself:**
- Brand header: logo top-right, company name, address
- "INVOICE" title (large, navy)
- Invoice number (mono) + Issue date + Due date
- Bill To: client name, company, address
- Line items table: Description / Qty / Rate / Amount
- Subtotal / Discount / Tax / **Total** (large bold)
- Payment instructions / bank details
- Footer: thank-you note, terms

---

### Screen 11 — Finance Dashboard

**Top bar:** "Finance" + date range filter bar (This Month / Last 3M / This Year / Custom)

**KPI Row (4 cards):** same as Dashboard but financial:
- Total Revenue / Outstanding / Overdue / Avg days to pay

**Main chart:** Monthly Revenue area chart (Recharts style)
- Gradient fill: #2B7FFF at top → transparent at bottom
- X-axis: months, Y-axis: dollar amounts
- Hover tooltip: white card with month + revenue amount

**Bottom table:** Recent invoices — client, invoice #, amount, status, due date
- Overdue rows: left border 3px red + bg subtle pink tint

---

### Screen 12 — Time Tracker

**Top section (active timer card, full width):**
- Large current time display: `00:00:00` (32px mono, navy)
- Underneath: project selector + description input
- Play / Pause / Stop buttons (icon buttons, large)
- If running: pulsing red dot + "Recording" label + elapsed time updating live

**Below: Time Entries table**
- Columns: Date / Description / Project / Client / Duration / Billable toggle / Actions
- Group by day (date as sticky section header)
- Billable toggle: green when on, gray when off
- Row sum per day: right-aligned total hours

**Manual entry CTA:** "+ Log time" button opens bottom sheet / modal with date picker + time pickers (from/to) + description + project.

---

### Screen 13 — Settings

**Layout:** Settings-specific sub-nav on left (200px), content right.

**Sub-nav items:**
- Profile
- Brand Kit
- Notifications
- Billing & Plan
- Integrations
- API Keys (Pro only)
- Danger Zone

**Profile page:**
- Avatar upload (large, 96px, edit icon overlay)
- Full name input
- Email (read-only + "Change email" link)
- Phone
- Timezone select
- "Save changes" bottom

**Brand Kit page:**
- Logo upload (dropzone, shows preview)
- Primary + Secondary color pickers (color swatch + hex input)
- Font select
- Email signature (rich text mini-editor)
- Live preview panel (right): shows how brand looks on sample invoice header

**Billing page:**
- Current plan card: plan name badge + price + renewal date + "Upgrade" / "Manage" button
- Feature comparison table (current plan highlighted)
- Payment method card (last 4 digits + expiry + "Update" link)
- Billing history table

---

### Screen 14 — Client Portal (Public, No Login)

**Layout:** Standalone page, no app sidebar. Uses client's brand kit.

**Portal Header:**
- Client's freelancer logo + name top-left
- Client name top-right: "Portal for [Client Name]"
- No nav links

**Sections:**
- **Active Documents** — card grid: each card shows type icon, title, status badge, date, CTA button ("View & Pay" / "Review & Approve" / "View")
- **Quick contacts** — freelancer email + phone in small footer card

**Document-specific portals:**
- `/pay/[token]`: Invoice view (read-only) + payment section at bottom (card form, mock Stripe embed)
- `/quote/[token]`: Quote view + "Approve" (green) / "Decline" (ghost) buttons + optional message textarea
- `/proposal/[token]`: Proposal view + approval flow

---

### Screen 15 — Cmd+K AI Palette

**Trigger:** Cmd+K from anywhere in app

**Overlay:** Full-screen dim (rgba 0,0,0,0.4) + centered modal

**Palette modal (560px wide, radius-xl, shadow-lg):**
- Top: search/command input (large, 18px, no border, placeholder "Ask AI or search…") with AI sparkle icon left
- Suggestions below as list:
  - Section headers: "Recent" / "Actions" / "AI"
  - Item: icon (20px) + label (14px) + keyboard shortcut right (mono 12px gray)
- AI results: different row style with purple sparkle icon, AI-generated answer inline
- Loading state: animated gradient shimmer while AI responds
- Footer: "↵ Execute  ·  ↑↓ Navigate  ·  Esc Close" hint bar

---

## 11. Mobile Responsive Breakpoints

```
sm    640px   — single column, stack all layouts
md    768px   — sidebar becomes bottom nav (5 icons)
lg    1024px  — sidebar visible, content adapts
xl    1280px  — full layout as designed
```

**Mobile specific:**
- Bottom tab nav (5 icons): Dashboard / Clients / Docs / Time / More
- Top bar: hamburger opens side drawer
- Tables become card stacks
- Modals become bottom sheets (slide up)
- KPI cards: 2×2 grid then 1 column on smallest screens
- Touch targets: minimum 44×44px for all interactive elements

---

## 12. Motion & Animation

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transition | Fade in | 200ms | ease-out |
| Modal open | Scale 0.96→1 + fade | 150ms | ease-out |
| Modal close | Scale 1→0.96 + fade | 100ms | ease-in |
| Toast | Slide up + fade | 200ms | spring |
| Sidebar items | Fade + slide 4px | 150ms | ease-out |
| Button hover | Shadow grow | 100ms | ease |
| Card hover | Lift (translateY -1px) + shadow | 150ms | ease |
| Dropdown | Fade + slide 4px down | 120ms | ease-out |
| Number counters | Count up on load | 800ms | ease-out |
| Skeleton → content | Fade out skeleton | 200ms | ease |

**Principles:**
- Nothing moves > 8px (micro-interactions only)
- No decorative animations that delay user action
- All transitions ≤ 300ms
- Reduce motion: respect `prefers-reduced-motion` media query — turn all transitions off

---

## 13. Accessibility

- Contrast ratio: 4.5:1 minimum for all text (WCAG AA)
- Focus ring: 3px solid #2B7FFF offset 2px — never hidden
- Form error: announced via `aria-live="polite"` + red text + error icon
- Icon-only buttons: always have `aria-label`
- Skip to main content link (first element, visible on focus)
- Keyboard nav: Tab / Shift+Tab / Enter / Space / Arrow keys for all interactive elements
- Screen reader: semantic HTML, correct heading hierarchy (H1 → H2 → H3 only)

---

## 14. Design Handoff Notes (for Stitch)

1. **Generate each screen as a separate frame** at 1440×900px desktop + 390×844px mobile
2. **Use auto-layout everywhere** — no fixed pixel positions for content
3. **Component variants:** generate all states (default / hover / focus / error / disabled / loading) for every component
4. **Color styles:** map exactly to tokens in Section 2 — name them identically
5. **Text styles:** name exactly as in Section 3 (e.g. `heading-lg`, `body-md`)
6. **Icons:** use Lucide icons at specified stroke 1.5
7. **Spacing:** 8px grid (use 4px half-steps only when necessary)
8. **Export assets:** icons as SVG, images as PNG @2x
9. **Prototype flows:** Login → Onboarding → Dashboard → Document creation → Send → Client Portal → Paid

---

*Last updated: 2026-05-15 | CraftlyAI v1 Design System*
