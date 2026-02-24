import type { CsvLeadRowSchema } from "@/features/leads/csv/csv.schema";
import type { CsvImportLeadRow } from "@/features/leads/domain/lead.types";

export function mapCsvLeadToDomain(row: CsvLeadRowSchema): CsvImportLeadRow {
  return {
    name: row.name,
    email: row.email,
    status: row.status,
    phone: row.phone,
    company: row.company,
    source: row.source,
    notes: row.notes,
  };
}
