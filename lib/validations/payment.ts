import { z } from "zod";

export const paymentMethodSchema = z.enum([
  "bank_transfer",
  "cash",
  "cheque",
  "card",
  "other",
]);

export const markPaidInputSchema = z.object({
  method: paymentMethodSchema,
  reference: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

export type MarkPaidInput = z.infer<typeof markPaidInputSchema>;
