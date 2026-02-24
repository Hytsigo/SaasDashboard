"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeadImportDialog } from "@/features/leads/components/lead-import-dialog";
import type { LeadsListFilters } from "@/features/leads/domain/lead.types";

type LeadsToolbarProps = {
  filters: LeadsListFilters;
  isLoading: boolean;
  onApply: (filters: LeadsListFilters) => void;
};

export function LeadsToolbar({ filters, isLoading, onApply }: LeadsToolbarProps) {
  const [q, setQ] = useState(filters.q ?? "");
  const [status, setStatus] = useState<"all" | "new" | "contacted" | "won" | "lost">(
    filters.status ?? "all",
  );

  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  if (filters.direction) {
    params.set("direction", filters.direction);
  }

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApply({ ...filters, q, status });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <form className="grid gap-3 md:grid-cols-[1fr_180px_auto]" onSubmit={applyFilters}>
        <Input
          name="q"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search name, email, company"
        />
        <select
          name="status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as "all" | "new" | "contacted" | "won" | "lost")
          }
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Apply filters"}
        </Button>
      </form>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <LeadImportDialog />
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
          <Link href={`/leads/export?${params.toString()}`}>
            <Download className="size-4" />
            Export CSV
          </Link>
        </Button>
      </div>
    </div>
  );
}
