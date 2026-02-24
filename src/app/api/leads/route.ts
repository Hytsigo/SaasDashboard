import { NextResponse } from "next/server";

import { leadListFiltersSchema } from "@/features/leads/domain/lead.schema";
import { listLeads } from "@/features/leads/services/leads.service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const filters = leadListFiltersSchema.parse(searchParams);
    const data = await listLeads(filters);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load leads";
    const status = message.includes("Unauthorized") || message.includes("Forbidden") ? 403 : 400;

    return NextResponse.json({ message }, { status });
  }
}
