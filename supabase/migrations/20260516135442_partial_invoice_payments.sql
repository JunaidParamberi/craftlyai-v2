-- Partial invoice payments and write-offs.

ALTER TYPE public.document_status ADD VALUE IF NOT EXISTS 'partially_paid';
ALTER TYPE public.document_status ADD VALUE IF NOT EXISTS 'written_off';

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_documents_payment_id
  ON public.documents (payment_id)
  WHERE payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_document_id
  ON public.payments (document_id);

CREATE TABLE IF NOT EXISTS public.invoice_adjustments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text NOT NULL,
  amount      numeric(12,2) NOT NULL,
  reason      text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoice_adjustments_type_check CHECK (type IN ('write_off')),
  CONSTRAINT invoice_adjustments_amount_positive CHECK (amount > 0),
  CONSTRAINT invoice_adjustments_reason_length CHECK (
    char_length(trim(reason)) >= 1 AND char_length(reason) <= 500
  )
);

CREATE INDEX IF NOT EXISTS idx_invoice_adjustments_document_id
  ON public.invoice_adjustments (document_id);

ALTER TABLE public.invoice_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own invoice adjustments"
  ON public.invoice_adjustments
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP TRIGGER IF EXISTS invoice_adjustments_set_updated_at
  ON public.invoice_adjustments;

CREATE TRIGGER invoice_adjustments_set_updated_at
  BEFORE UPDATE ON public.invoice_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profiles_updated_at();
