import { z } from "zod";

import { leadStatusSchema } from "@/features/leads/domain/lead.schema";

export const csvLeadRowSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().transform((value) => value.toLowerCase()),
  status: leadStatusSchema.default("new"),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  source: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type CsvLeadRowSchema = z.infer<typeof csvLeadRowSchema>;
