import { NextResponse } from "next/server";

import { getLeadOverviewSummary } from "@/features/leads/services/leads.service";

export async function GET() {
  try {
    const data = await getLeadOverviewSummary();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load overview";
    const status = message.includes("Unauthorized") || message.includes("Forbidden") ? 403 : 400;

    return NextResponse.json({ message }, { status });
  }
}
