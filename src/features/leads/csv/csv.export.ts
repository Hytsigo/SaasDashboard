import Papa from "papaparse";

import type { Lead } from "@/features/leads/domain/lead.types";

export function exportLeadsToCsv(leads: Lead[]): string {
  return Papa.unparse(
    leads.map((lead) => ({
      name: lead.name,
      email: lead.email,
      status: lead.status,
      phone: lead.phone ?? "",
      company: lead.company ?? "",
      source: lead.source ?? "",
      notes: lead.notes ?? "",
      created_at: lead.createdAt,
      updated_at: lead.updatedAt,
    })),
  );
}
