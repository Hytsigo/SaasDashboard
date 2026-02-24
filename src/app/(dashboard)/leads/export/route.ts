import { NextResponse } from "next/server";

import { exportLeadsToCsv } from "@/features/leads/csv/csv.export";
import { leadListFiltersSchema } from "@/features/leads/domain/lead.schema";
import { listLeadsForExport } from "@/features/leads/services/leads.service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const filters = leadListFiltersSchema.parse(searchParams);
    const leads = await listLeadsForExport(filters);
    const csv = exportLeadsToCsv(leads);
    const fileName = `leads-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ message }, { status: 400 });
  }
}
