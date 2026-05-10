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
| `health_score` | `smallint` 0–100 or null — **not** exposed in create/update UI yet (reserved for Relationship Manager / AI). |
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
| `deleteClient` | Delete scoped by id + `user_id`; revalidates list and detail paths |

Onboarding step 3 calls `createClient` from [`components/onboarding/first-client-onboarding-form.tsx`](/components/onboarding/first-client-onboarding-form.tsx).

## Validation

[`lib/validations/client.ts`](/lib/validations/client.ts) — Zod `clientCreateSchema` plus `parseClientCreateInput` (empty strings → null, email and ISO currency checks).

## Routes (app)

| Path | Role |
|------|------|
| `/protected/clients` | List |
| `/protected/clients/new` | Create |
| `/protected/clients/[id]` | Detail, edit, delete |

## Dev-only QA

`/protected/clients-test` — bypasses onboarding in [`app/protected/layout.tsx`](/app/protected/layout.tsx); use for quick CRUD checks against Supabase.
