-- Add pdf_url, sent_at, viewed_at, signed_at columns to documents.
-- These were in the CLAUDE.md schema but omitted from the initial migration.

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS pdf_url    text,
  ADD COLUMN IF NOT EXISTS sent_at    timestamptz,
  ADD COLUMN IF NOT EXISTS viewed_at  timestamptz,
  ADD COLUMN IF NOT EXISTS signed_at  timestamptz;
