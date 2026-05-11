import { z } from "zod";

/** Align with DB constraints (migration `*_clients.sql`). */
export const CLIENT_LIMITS = {
  name: 300,
  contact_name: 200,
  email: 320,
  phone: 50,
  company: 200,
  address: 2000,
  notes: 8000,
} as const;

export const clientCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Display name is required.")
    .max(CLIENT_LIMITS.name),
  email: z.string().trim().max(CLIENT_LIMITS.email),
  phone: z.string().trim().max(CLIENT_LIMITS.phone),
  company: z.string().trim().max(CLIENT_LIMITS.company),
  contact_name: z.string().trim().max(CLIENT_LIMITS.contact_name),
  address: z.string().trim().max(CLIENT_LIMITS.address),
  currency: z.string().trim(),
  notes: z.string().trim().max(CLIENT_LIMITS.notes),
});

export type ClientCreateFormInput = z.input<typeof clientCreateSchema>;

/** Normalized payload for insert (empty strings → null). */
export type ClientCreatePayload = {
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  currency: string | null;
  notes: string | null;
};

export function parseClientCreateInput(
  raw: unknown,
):
  | { success: true; data: ClientCreatePayload }
  | { success: false; error: z.ZodError } {
  const parsed = clientCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const d = parsed.data;
  const emailTrim = d.email.trim();
  const email = emailTrim === "" ? null : emailTrim;
  if (email !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      success: false,
      error: new z.ZodError([
        {
          code: "custom",
          message: "Invalid email.",
          path: ["email"],
        },
      ]),
    };
  }

  const currencyRaw = d.currency.trim().toUpperCase();
  const currency = currencyRaw === "" ? null : currencyRaw;
  if (currency !== null && !/^[A-Z]{3}$/.test(currency)) {
    return {
      success: false,
      error: new z.ZodError([
        {
          code: "custom",
          message: "Use a 3-letter ISO 4217 currency code (e.g. USD).",
          path: ["currency"],
        },
      ]),
    };
  }

  const emptyToNull = (s: string) => {
    const t = s.trim();
    return t === "" ? null : t;
  };

  return {
    success: true,
    data: {
      name: d.name.trim(),
      contact_name: emptyToNull(d.contact_name),
      email,
      phone: emptyToNull(d.phone),
      company: emptyToNull(d.company),
      address: emptyToNull(d.address),
      currency,
      notes: emptyToNull(d.notes),
    },
  };
}
