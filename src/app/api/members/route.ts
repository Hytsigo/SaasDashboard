import { NextResponse } from "next/server";

import { listOrganizationMembers } from "@/features/org/services/members.service";

export async function GET() {
  try {
    const data = await listOrganizationMembers();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load members";
    const status = message.includes("Unauthorized") || message.includes("Forbidden") ? 403 : 400;

    return NextResponse.json({ message }, { status });
  }
}
