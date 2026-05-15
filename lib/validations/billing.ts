import { z } from "zod";

export const upgradePlanSchema = z.object({
  plan: z.enum(["starter", "pro", "agency"]),
});

export type UpgradePlanInput = z.infer<typeof upgradePlanSchema>;
