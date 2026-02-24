import Papa from "papaparse";

import { mapCsvLeadToDomain } from "@/features/leads/csv/csv.mapper";
import { csvLeadRowSchema } from "@/features/leads/csv/csv.schema";
import type { CsvImportLeadRow } from "@/features/leads/domain/lead.types";

type ParseCsvResult = {
  rows: CsvImportLeadRow[];
  errors: Array<{
    row: number;
    message: string;
  }>;
};

type CsvRawRow = {
  name?: string;
  email?: string;
  status?: string;
  phone?: string;
  company?: string;
  source?: string;
  notes?: string;
};

export function parseLeadsCsv(csvText: string): ParseCsvResult {
  const parsed = Papa.parse<CsvRawRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  const errors: ParseCsvResult["errors"] = parsed.errors.map((error) => ({
    row: (error.row ?? 0) + 2,
    message: error.message,
  }));

  const rows: CsvImportLeadRow[] = [];

  parsed.data.forEach((row, index) => {
    const validation = csvLeadRowSchema.safeParse({
      name: row.name,
      email: row.email,
      status: row.status,
      phone: row.phone,
      company: row.company,
      source: row.source,
      notes: row.notes,
    });

    if (!validation.success) {
      errors.push({
        row: index + 2,
        message: validation.error.issues.map((issue) => issue.message).join(", "),
      });
      return;
    }

    rows.push(mapCsvLeadToDomain(validation.data));
  });

  return { rows, errors };
}
