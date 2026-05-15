-- Support multiple receipt attachments per expense.

alter table public.expenses
  add column if not exists receipt_urls jsonb not null default '[]'::jsonb;

comment on column public.expenses.receipt_urls is
  'Public storage URLs for expense receipt attachments (JSON array of strings).';

-- Backfill from legacy single receipt_url column.
update public.expenses
set receipt_urls = jsonb_build_array(receipt_url)
where receipt_url is not null
  and receipt_url <> ''
  and (receipt_urls = '[]'::jsonb or receipt_urls is null);

alter table public.expenses
  add constraint expenses_receipt_urls_is_array check (jsonb_typeof(receipt_urls) = 'array');
