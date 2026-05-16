-- Add payment_voucher to document_type enum
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'payment_voucher';

-- Add voucher-specific columns to documents
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS voucher_number text,
  ADD COLUMN IF NOT EXISTS source_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL;

-- Index for fast lookup: "get voucher for this invoice"
CREATE INDEX IF NOT EXISTS idx_documents_source_document_id
  ON public.documents (source_document_id)
  WHERE source_document_id IS NOT NULL;
