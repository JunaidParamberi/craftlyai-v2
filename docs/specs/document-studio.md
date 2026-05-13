# Document Studio (Phase 2)

Tiptap rich-text editor with templates and `{{variable}}` substitution. Foundation for Proposal, Quote, Invoice, and Client portal flows that arrive in later Phase 2 tasks.

## Schema

Migrations:
- `supabase/migrations/20260518120000_documents.sql`
- `supabase/migrations/20260518120100_document_templates.sql`
- `supabase/migrations/20260518120200_document_templates_seed.sql`

### `public.documents`

| Column | Notes |
|--------|--------|
| `id` | UUID PK |
| `user_id` | FK → `auth.users`, cascade delete |
| `client_id` | FK → `public.clients`, set null on delete (optional) |
| `project_id` | FK → `public.projects`, set null on delete (optional) |
| `type` | `document_type` enum: `proposal \| quote \| invoice \| other` (default `other`) |
| `status` | `document_status` enum: `draft \| sent \| viewed \| signed \| paid \| archived` (default `draft`) |
| `title` | Required, 1–300 chars |
| `content_json` | `jsonb`, Tiptap doc |
| `created_at`, `updated_at` | Automatic |

A `before insert or update` trigger (`enforce_document_relations_owner`) blocks documents whose `client_id`/`project_id` belong to a different `user_id` — mirrors the projects table guard.

### `public.document_templates`

| Column | Notes |
|--------|--------|
| `id` | UUID PK |
| `user_id` | FK → `auth.users` (NULL for system templates) |
| `type` | Same enum as documents |
| `name` | Required, 1–200 chars |
| `description` | Optional, ≤500 chars |
| `content_json` | `jsonb`, Tiptap doc |
| `is_system` | Boolean — true for seeded templates |
| `created_at`, `updated_at` | Automatic |

Constraint `document_templates_system_user_mutex`: `is_system = true ⇔ user_id is null`.

Seed (`*_document_templates_seed.sql`) inserts 4 system templates: **Simple Proposal**, **Basic Quote**, **Standard Invoice**, **Blank document**.

## Row Level Security

`documents` — standard owner-only CRUD (`auth.uid() = user_id`).

`document_templates`:
- `select`: own rows **or** `is_system = true`.
- `insert/update/delete`: own rows **and** `is_system = false`. System templates are immutable from the app.

## Apply migration

Run the three migrations in numerical order against your Supabase project. After applying, verify:

```sql
select count(*) from public.document_templates where is_system; -- expect 4
```

## Server actions

[`lib/documents/actions.ts`](/lib/documents/actions.ts) re-exports queries (`lib/documents/document-queries.ts`) and mutations (`lib/documents/document-mutations.ts`, `"use server"`).

| Function | Purpose |
|----------|---------|
| `listDocuments` | All documents for current user, newest `updated_at` first, joined with client name + project title |
| `getDocumentById` | Single document or `null` |
| `listDocumentTemplates` | System + user templates, system first |
| `getTemplateById` | Single template (system or own) or `null` |
| `createDocument` | Insert validated row |
| `updateDocument` | Update by id + `user_id` |
| `deleteDocument` | Delete by id + `user_id`; revalidates `/documents` |
| `saveAsTemplate` | Insert user template (`is_system = false`) |
| `deleteTemplate` | Delete by id + `user_id` + `is_system = false` |

## Validation

[`lib/validations/document.ts`](/lib/validations/document.ts):

- `DOCUMENT_LIMITS` — DB-aligned char caps.
- `documentTypeSchema`, `documentStatusSchema` — Zod enums (also exported as `DOCUMENT_TYPES`, `DOCUMENT_STATUSES` const arrays for UI).
- `tiptapDocSchema` — accepts any object with `type === "doc"` and (optional) array `content`. Full structure is the editor's responsibility.
- `parseDocumentInput`, `parseTemplateInput` — empty strings → null, trim, type-narrow into payload shape.

Unit tests in [`lib/validations/document.test.ts`](/lib/validations/document.test.ts) (15 cases).

## Routes (app)

| Path | Role |
|------|------|
| `/documents` | List ([`DocumentsTable`](/components/features/documents/documents-table.tsx)) with search + type filter + paginated table |
| `/documents/new` | Template picker ([`TemplatePicker`](/components/features/documents/template-picker.tsx)). Selecting a template creates the doc and redirects to its edit URL. |
| `/documents/[id]` | Read view with substituted variables ([`DocumentDetailView`](/components/features/documents/document-detail-view.tsx)) |
| `/documents/[id]/edit` | Editor + properties sidebar ([`DocumentForm`](/components/features/documents/document-form.tsx)) |

## Variable engine

[`lib/documents/variables.ts`](/lib/documents/variables.ts) (pure, browser-safe):

- `VARIABLE_CATALOG` — descriptors `{ key, label, group, resolver(ctx) }`.
- Groups: **Client**, **Project**, **Brand**, **Date**.
- `substituteVariables(text, ctx)` — replaces `{{key}}` via regex `/\{\{\s*([a-z_]+)\s*\}\}/g`. Unknown keys and unresolved values stay untouched (rendered as monospace chip in the detail view).
- `substituteInTiptapDoc(doc, ctx)` — walks the Tiptap JSON tree, only touches `text` nodes.

[`lib/documents/variables-server.ts`](/lib/documents/variables-server.ts) (`server-only`):

- `buildVariableContext({ clientId, projectId })` — reads brand kit (via `getBrandKit`), profile (`company_name` / `full_name` → business name), the linked client (`getClientById`), and the linked project. Returns a `VariableContext`.

### Catalog (v1)

| Key | Group | Source |
|-----|-------|--------|
| `client_name` | Client | `clients.name` |
| `client_contact_name` | Client | `clients.contact_name` (falls back to name) |
| `client_email` | Client | `clients.email` |
| `client_company` | Client | `clients.company` (falls back to name) |
| `project_title` | Project | `projects.title` |
| `brand_business_name` | Brand | `profiles.company_name` (falls back to `full_name`) |
| `brand_signature` | Brand | `brand_kits.email_signature` |
| `today` | Date | Current date (long format, server timezone) |

## Stubbed until later milestones

- **PDF export** — needs `pdf-lib` + a dedicated `document-pdfs` storage bucket.
- **Send via email** — Resend integration; status transitions (`draft → sent → viewed`).
- **Signing flow** — drives `signed` status.
- **Invoice line items** — separate table, ships with the Invoice flow task.
- **Client portal public links** — separate task.
- **Plan gating** — Lemon Squeezy enforcement, lives with the billing task.

## Manual QA checklist

1. `npm test` → 55 passing (15 document tests).
2. `npm run build` → green.
3. Apply 3 migrations; confirm 4 seeded system templates exist.
4. `npm run dev`, sign in:
   - `/documents` → empty state with "Create your first document" CTA.
   - `/documents/new` → 4 system template cards (Proposal / Quote / Invoice / Blank). Pick one → redirected to editor.
   - Editor: title input, Tiptap toolbar (heading/bold/italic/strike/lists/quote/divider/link), "Insert variable" dropdown with 4 groups, sidebar (Type / Status / Client / Project / Save as template). Project select is disabled until a client is picked and the selected project matches that client.
   - Save → redirected to detail view; `{{client_name}}`, `{{today}}`, etc. resolve. Unresolved variables render as monospace chips.
   - "Save as template" dialog → new template appears under "Your templates" on `/documents/new`.
   - Delete document from list dropdown → confirmation dialog → list shows empty state.
   - Cross-user check (SQL): a second user cannot see another user's documents or user templates, but can see system templates.
