import type { ClientCreateFormInput } from "@/lib/validations/client";
import type { ClientRow } from "@/types";

/** Map a persisted row to react-hook-form defaults for the client form. */
export function clientRowToFormValues(row: ClientRow): ClientCreateFormInput {
  return {
    name: row.name,
    contact_name: row.contact_name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    company: row.company ?? "",
    address: row.address ?? "",
    currency: row.currency ?? "",
    notes: row.notes ?? "",
  };
}
