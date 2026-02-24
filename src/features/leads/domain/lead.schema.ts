import { z } from "zod";

export const leadStatusSchema = z.enum(["new", "contacted", "won", "lost"]);

const optionalTextField = z
  .string()
  .trim()
  .max(255)
  .nullish()
  .transform((value) => (value ? value : null));

export const createLeadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().transform((value) => value.toLowerCase()),
  status: leadStatusSchema,
  phone: optionalTextField,
  company: optionalTextField,
  source: optionalTextField,
  notes: z
    .string()
    .trim()
    .max(5000)
    .nullish()
    .transform((value) => (value ? value : null)),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  id: z.string().uuid(),
});

export const leadListFiltersSchema = z.object({
  q: z.string().trim().optional(),
  status: z.union([leadStatusSchema, z.literal("all")]).optional(),
  sort: z.enum(["created_at", "updated_at", "name", "email", "status"]).optional(),
  direction: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  includeDeleted: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

export const softDeleteLeadSchema = z.object({
  id: z.string().uuid(),
});

export const bulkStatusUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  status: leadStatusSchema,
});

export const importLeadsCsvSchema = z.object({
  csvText: z.string().min(1),
});

export type CreateLeadSchema = z.infer<typeof createLeadSchema>;
export type CreateLeadSchemaInput = z.input<typeof createLeadSchema>;
export type UpdateLeadSchema = z.infer<typeof updateLeadSchema>;
export type LeadListFiltersSchema = z.infer<typeof leadListFiltersSchema>;
