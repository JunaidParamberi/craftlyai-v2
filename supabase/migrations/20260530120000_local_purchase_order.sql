-- 1. Extend document_type enum
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'local_purchase_order';

-- 2. LPO-specific columns (on LPO documents)
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS lpo_number          text,
  ADD COLUMN IF NOT EXISTS lpo_validity_date   date,
  ADD COLUMN IF NOT EXISTS lpo_amount          numeric(12, 2),
  ADD COLUMN IF NOT EXISTS lpo_pdf_url         text;

-- 3. Invoice-side column: the LPO number this invoice draws against
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS lpo_reference_number text;

-- 4. Index for portal query (type filter)
CREATE INDEX IF NOT EXISTS idx_documents_type_client
  ON public.documents (type, client_id, user_id);

-- 5. Supabase storage bucket for client-sent PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lpo-documents',
  'lpo-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/png', 'image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage RLS: users can only access their own LPO files
CREATE POLICY "Users manage own lpo files"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'lpo-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'lpo-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
