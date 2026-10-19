import { z } from "zod";

const money = z.string().regex(/^\d{1,10}(\.\d{1,2})?$/, "Informe um valor válido");

export const planFormSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[a-z0-9_-]+$/),
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(1000),
  monthlyPrice: money,
  yearlyPrice: money,
  durationMonths: z.number().int().min(1).max(120).nullable(),
  isActive: z.boolean(),
  isRecommended: z.boolean(),
});

export type PlanFormData = z.infer<typeof planFormSchema>;
