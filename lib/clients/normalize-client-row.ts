import type { ClientRow } from "@/types";

type ClientRowRaw = {
  id: string;
  user_id: string;
  name: string;
  contact_name?: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  currency: string | null;
  notes: string | null;
  health_score: number | null;
  portal_token?: string | null;
  created_at: string;
  updated_at: string;
};

export function normalizeClientRow(row: ClientRowRaw): ClientRow {
  return {
    ...row,
    contact_name: row.contact_name ?? null,
    currency: row.currency?.trim().toUpperCase() ?? null,
    portal_token: row.portal_token ?? null,
  };
}
