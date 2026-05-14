-- Line items for invoice documents
CREATE TABLE public.line_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  description  text NOT NULL DEFAULT '',
  quantity     numeric(10,2) NOT NULL DEFAULT 1,
  unit_price   numeric(10,2) NOT NULL DEFAULT 0,
  tax_rate     numeric(5,2) NOT NULL DEFAULT 0,
  sort_order   int NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own line items" ON public.line_items
  USING (
    document_id IN (
      SELECT id FROM public.documents WHERE user_id = auth.uid()
    )
  );

-- Invoice-specific metadata columns on documents
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS invoice_number   text,
  ADD COLUMN IF NOT EXISTS due_date         date,
  ADD COLUMN IF NOT EXISTS payment_terms    text,
  ADD COLUMN IF NOT EXISTS notes_footer     text,
  ADD COLUMN IF NOT EXISTS paid_at          timestamptz,
  ADD COLUMN IF NOT EXISTS pay_token        text UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex');

-- Backfill pay_token for any existing rows that got NULL (shouldn't happen with DEFAULT but safety)
UPDATE public.documents
SET pay_token = encode(gen_random_bytes(24), 'hex')
WHERE pay_token IS NULL;
