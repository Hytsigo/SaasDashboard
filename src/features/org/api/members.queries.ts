import { queryOptions } from "@tanstack/react-query";

import type { OrganizationMembersView } from "@/features/org/domain/member.types";

export const membersKeys = {
  all: ["members"] as const,
};

async function fetchOrganizationMembers(): Promise<OrganizationMembersView> {
  const response = await fetch("/api/members", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? `Failed to load members (${response.status})`);
  }

  return (await response.json()) as OrganizationMembersView;
}

export function membersQueryOptions() {
  return queryOptions({
    queryKey: membersKeys.all,
    queryFn: fetchOrganizationMembers,
    staleTime: 30_000,
  });
}
