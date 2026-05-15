CREATE TABLE public.payments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount       numeric(12,2) NOT NULL DEFAULT 0,
  currency     text NOT NULL DEFAULT 'USD',
  method       text NOT NULL DEFAULT 'bank_transfer',
  reference    text,
  notes        text,
  paid_at      timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own payments" ON public.payments
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
