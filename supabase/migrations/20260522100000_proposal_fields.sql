-- Add proposal number column to documents
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS proposal_number text;
