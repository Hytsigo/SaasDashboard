import { queryOptions } from "@tanstack/react-query";

import type {
  LeadOverviewSummary,
  LeadsListFilters,
  PaginatedLeads,
} from "@/features/leads/domain/lead.types";

export const leadsKeys = {
  all: ["leads"] as const,
  list: (filters: LeadsListFilters) => ["leads", "list", filters] as const,
  overview: () => ["leads", "overview"] as const,
};

async function fetchLeads(filters: LeadsListFilters): Promise<PaginatedLeads> {
  const searchParams = new URLSearchParams();

  if (filters.q) {
    searchParams.set("q", filters.q);
  }

  if (filters.status) {
    searchParams.set("status", filters.status);
  }

  if (filters.sort) {
    searchParams.set("sort", filters.sort);
  }

  if (filters.direction) {
    searchParams.set("direction", filters.direction);
  }

  if (filters.page) {
    searchParams.set("page", String(filters.page));
  }

  if (filters.pageSize) {
    searchParams.set("pageSize", String(filters.pageSize));
  }

  if (filters.includeDeleted !== undefined) {
    searchParams.set("includeDeleted", String(filters.includeDeleted));
  }

  const response = await fetch(`/api/leads?${searchParams.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? `Failed to load leads (${response.status})`);
  }

  return (await response.json()) as PaginatedLeads;
}

export function leadsListQueryOptions(filters: LeadsListFilters) {
  return queryOptions({
    queryKey: leadsKeys.list(filters),
    queryFn: () => fetchLeads(filters),
    staleTime: 30_000,
  });
}

async function fetchLeadsOverview(): Promise<LeadOverviewSummary> {
  const response = await fetch("/api/leads/overview", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? `Failed to load overview (${response.status})`);
  }

  return (await response.json()) as LeadOverviewSummary;
}

export function leadsOverviewQueryOptions() {
  return queryOptions({
    queryKey: leadsKeys.overview(),
    queryFn: fetchLeadsOverview,
    staleTime: 30_000,
  });
}
