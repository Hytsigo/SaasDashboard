"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  bulkUpdateLeadStatusAction,
  softDeleteLeadAction,
} from "@/features/leads/api/leads.mutations";
import { leadsKeys } from "@/features/leads/api/leads.queries";
import { LeadStatusBadge } from "@/features/leads/components/lead-status-badge";
import type { Lead, LeadsListFilters, LeadStatus } from "@/features/leads/domain/lead.types";

type LeadsTableProps = {
  leads: Lead[];
  filters: LeadsListFilters;
};

export function LeadsTable({ leads, filters }: LeadsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { executeAsync: executeBulkUpdate } = useAction(bulkUpdateLeadStatusAction);
  const { executeAsync: executeSoftDelete } = useAction(softDeleteLeadAction);

  const bulkStatusMutation = useMutation({
    mutationFn: async (status: LeadStatus) => {
      const result = await executeBulkUpdate({ ids: selectedIds, status });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }
    },
    onSuccess: async () => {
      setSelectedIds([]);
      toast.success("Bulk status updated.");
      await queryClient.invalidateQueries({ queryKey: leadsKeys.all });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await executeSoftDelete({ id });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }
    },
    onSuccess: async () => {
      toast.success("Lead deleted.");
      await queryClient.invalidateQueries({ queryKey: leadsKeys.list(filters) });
      await queryClient.invalidateQueries({ queryKey: leadsKeys.all });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const allSelected = useMemo(() => {
    return leads.length > 0 && selectedIds.length === leads.length;
  }, [leads.length, selectedIds.length]);

  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleAllRows() {
    setSelectedIds((current) =>
      current.length === leads.length ? [] : leads.map((lead) => lead.id),
    );
  }

  async function onBulkStatusUpdate(status: LeadStatus) {
    if (selectedIds.length === 0) {
      toast.error("Select at least one row.");
      return;
    }

    await bulkStatusMutation.mutateAsync(status);
  }

  async function onDelete(id: string) {
    await deleteMutation.mutateAsync(id);
  }

  return (
    <div className="space-y-3 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">{selectedIds.length} selected</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={bulkStatusMutation.isPending || selectedIds.length === 0}
            >
              Bulk status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => onBulkStatusUpdate("new")}>
              Mark as New
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onBulkStatusUpdate("contacted")}>
              Mark as Contacted
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onBulkStatusUpdate("won")}>
              Mark as Won
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onBulkStatusUpdate("lost")}>
              Mark as Lost
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAllRows}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => {
              const checked = selectedIds.includes(lead.id);

              return (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => {
                        toggleSelection(lead.id);
                      }}
                      aria-label={`Select ${lead.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/leads/${lead.id}`} className="hover:underline">
                      {lead.name}
                    </Link>
                  </TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>
                    <LeadStatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/leads/${lead.id}`}>View detail</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            void onDelete(lead.id);
                          }}
                          className="text-destructive"
                        >
                          Soft delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
