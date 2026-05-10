# Clients CRM (Phase 1)

Freelancer-scoped CRM rows in `public.clients` for invoicing, portals, and future relationship insights.

## Schema

Migration: `supabase/migrations/20260513120000_clients.sql`.

| Column | Notes |
|--------|--------|
| `id` | UUID PK |
| `user_id` | FK → `auth.users`, cascade delete |
| `name` | Required |
| `email`, `phone`, `company`, `address`, `notes` | Optional text |
| `currency` | Optional ISO 4217, 3 letters (stored uppercase in app) |
| `health_score` | `smallint` 0–100 or null — surfaced as a **health badge** on client detail (not yet on the edit form; Relationship Manager / automation may populate later). |
| `created_at`, `updated_at` | Automatic |

**v1 address model:** a single `address` text column (multiline in UI). CLAUDE.md lists split address fields on the conceptual `clients` model; we ship one field until a migration splits it.

## Row Level Security

Authenticated users may `select` / `insert` / `update` / `delete` only rows where `user_id = auth.uid()`.

## Apply migration

Ensure the migration is applied to your Supabase project before relying on the app (local: `supabase db push` or your migration workflow; verify table exists in the dashboard SQL editor).

## Server actions

[`lib/clients/actions.ts`](/lib/clients/actions.ts) (`"use server"`):

| Function | Purpose |
|----------|---------|
| `listClients` | All clients for the current user, newest first |
| `getClientById` | Single row or `null` (wrong id / other user / unauthenticated) |
| `createClient` | Validates with `parseClientCreateInput`, inserts |
| `updateClient` | Same validation, scoped by id + `user_id` |
| `deleteClient` | Delete scoped by id + `user_id`; revalidates list, detail, and `/clients/[id]/edit` paths |

Onboarding step 3 calls `createClient` from [`components/onboarding/first-client-onboarding-form.tsx`](/components/onboarding/first-client-onboarding-form.tsx).

## Validation

[`lib/validations/client.ts`](/lib/validations/client.ts) — Zod `clientCreateSchema` plus `parseClientCreateInput` (empty strings → null, email and ISO currency checks).

## Routes (app)

| Path | Role |
|------|------|
| `/clients` | List |
| `/clients/new` | Create (`ClientForm` create) |
| `/clients/[id]` | **Detail / overview** — wireframe-style layout (tabs: Overview & projects, Documents, Notes & activity), edit/delete affordances; uses [`components/features/clients/detail/`](/components/features/clients/detail/) |
| `/clients/[id]/edit` | **Edit** — same [`ClientForm`](/components/features/clients/client-form.tsx) as create; after save, navigates back to detail |

Display helpers for detail UI live in [`lib/clients/display.ts`](/lib/clients/display.ts) (monogram, dates, health labels).

### Stubbed until later milestones

- **Active projects** cards: empty state until `projects` + client linkage ship (Phase 1 Projects).
- **Documents** tab / badge count: `0` until Document Studio (Phase 2).
- **Financial summary** numbers: placeholders until invoices/payments exist (Phase 2).
- **Activity** feed on Notes tab: copy-only placeholder until integrations.

## Dev-only QA

`/clients-test` — bypasses onboarding in `app/(app)/layout.tsx`; use for quick CRUD checks against Supabase.
