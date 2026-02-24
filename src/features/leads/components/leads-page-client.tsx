"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { leadsListQueryOptions } from "@/features/leads/api/leads.queries";
import { LeadsTable } from "@/features/leads/components/leads-table";
import { LeadsToolbar } from "@/features/leads/components/leads-toolbar";
import type { LeadsListFilters } from "@/features/leads/domain/lead.types";

type LeadsPageClientProps = {
  initialFilters: LeadsListFilters;
};

export function LeadsPageClient({ initialFilters }: LeadsPageClientProps) {
  const [filters, setFilters] = useState<LeadsListFilters>({
    ...initialFilters,
    page: initialFilters.page ?? 1,
    pageSize: initialFilters.pageSize ?? 10,
    status: initialFilters.status ?? "all",
  });

  const query = useQuery(leadsListQueryOptions(filters));
  const data = query.data;

  const previousPage = useMemo(() => Math.max(1, (filters.page ?? 1) - 1), [filters.page]);
  const nextPage = useMemo(() => {
    if (!data) {
      return (filters.page ?? 1) + 1;
    }

    return Math.min(data.totalPages, (filters.page ?? 1) + 1);
  }, [data, filters.page]);

  function setPage(page: number) {
    setFilters((current) => ({ ...current, page }));
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Leads</h1>
        <p className="text-sm text-muted-foreground">Track and qualify incoming leads.</p>
      </header>

      <LeadsToolbar
        filters={filters}
        isLoading={query.isFetching}
        onApply={(nextFilters) => {
          setFilters((current) => ({ ...current, ...nextFilters, page: 1 }));
        }}
      />

      {query.isLoading ? (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          Loading leads...
        </div>
      ) : null}

      {query.isError ? (
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-destructive">{query.error.message}</p>
          <Button className="mt-4" variant="outline" size="sm" onClick={() => query.refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {data && data.items.length === 0 ? (
        <EmptyState
          title="No leads found"
          description="Try adjusting your filters or import your first CSV file."
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <LeadsTable leads={data.items} filters={filters} />
          <footer className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {data.page} of {data.totalPages} ({data.total} records)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page === 1}
                onClick={() => setPage(previousPage)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= data.totalPages}
                onClick={() => setPage(nextPage)}
              >
                Next
              </Button>
            </div>
          </footer>
        </>
      ) : null}

      <div className="text-xs text-muted-foreground">
        Need detail view? Open a record from the table or go to <Link href="/">overview</Link>.
      </div>
    </section>
  );
}
