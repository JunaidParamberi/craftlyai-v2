import { z } from "zod";

export const lineItemInputSchema = z.object({
  id: z.string().uuid().optional(),
  description: z.string().max(500).default(""),
  quantity: z.coerce.number().positive().max(9999).default(1),
  unit_price: z.coerce.number().min(0).default(0),
  tax_rate: z.coerce.number().min(0).max(100).default(0),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export type LineItemInput = z.infer<typeof lineItemInputSchema>;

export function parseLineItemInput(raw: unknown): LineItemInput {
  return lineItemInputSchema.parse(raw);
}
