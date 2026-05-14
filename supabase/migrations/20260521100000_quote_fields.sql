-- Extend document_status enum with approval states
ALTER TYPE public.document_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE public.document_status ADD VALUE IF NOT EXISTS 'declined';

-- Add quote-specific columns to documents table
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS quote_number     text,
  ADD COLUMN IF NOT EXISTS valid_until      date,
  ADD COLUMN IF NOT EXISTS approval_token   text UNIQUE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS approved_at      timestamptz,
  ADD COLUMN IF NOT EXISTS declined_at      timestamptz,
  ADD COLUMN IF NOT EXISTS approval_message text;
