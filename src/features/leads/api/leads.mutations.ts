"use server";

import { z } from "zod";

import { actionClient } from "@/lib/safe-action";
import {
  bulkStatusUpdateSchema,
  createLeadSchema,
  importLeadsCsvSchema,
  softDeleteLeadSchema,
  updateLeadSchema,
} from "@/features/leads/domain/lead.schema";
import {
  bulkUpdateLeadStatus,
  createLead,
  importLeads,
  generateDemoLeads,
  softDeleteLead,
  updateLead,
} from "@/features/leads/services/leads.service";
import { parseLeadsCsv } from "@/features/leads/csv/csv.parser";

export const createLeadAction = actionClient
  .schema(createLeadSchema)
  .action(async ({ parsedInput }) => {
    return createLead(parsedInput);
  });

export const updateLeadAction = actionClient
  .schema(updateLeadSchema)
  .action(async ({ parsedInput }) => {
    return updateLead(parsedInput);
  });

export const softDeleteLeadAction = actionClient
  .schema(softDeleteLeadSchema)
  .action(async ({ parsedInput }) => {
    await softDeleteLead(parsedInput.id);
    return { success: true };
  });

export const bulkUpdateLeadStatusAction = actionClient
  .schema(bulkStatusUpdateSchema)
  .action(async ({ parsedInput }) => {
    await bulkUpdateLeadStatus(parsedInput.ids, parsedInput.status);
    return { success: true };
  });

export const importLeadsCsvAction = actionClient
  .schema(importLeadsCsvSchema)
  .action(async ({ parsedInput }) => {
    const parsed = parseLeadsCsv(parsedInput.csvText);

    if (parsed.errors.length > 0) {
      return {
        createdCount: 0,
        updatedCount: 0,
        errorCount: parsed.errors.length,
        errors: parsed.errors,
      };
    }

    return importLeads(parsed.rows);
  });

export const generateDemoLeadsAction = actionClient.schema(z.object({})).action(async () => {
  return generateDemoLeads();
});
