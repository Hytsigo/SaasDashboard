"use client";

import { useMemo, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { leadsKeys } from "@/features/leads/api/leads.queries";
import { importLeadsCsvAction } from "@/features/leads/api/leads.mutations";

export function LeadImportDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { executeAsync } = useAction(importLeadsCsvAction);

  const importMutation = useMutation({
    mutationFn: async (csvText: string) => {
      const result = await executeAsync({ csvText });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      const data = result?.data;
      if (!data) {
        throw new Error("Import failed unexpectedly.");
      }

      return data;
    },
    onSuccess: async (data) => {
      if (data.errorCount > 0) {
        toast.error(`Import completed with ${data.errorCount} row errors.`);
        return;
      }

      toast.success(
        `Import successful: ${data.createdCount} created, ${data.updatedCount} updated.`,
      );
      setOpen(false);
      setFile(null);
      await queryClient.invalidateQueries({ queryKey: leadsKeys.all });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const helperText = useMemo(() => {
    return "Expected columns: name,email,status,phone,company,source,notes";
  }, []);

  async function onImport() {
    if (!file) {
      toast.error("Select a CSV file first.");
      return;
    }

    const csvText = await file.text();
    await importMutation.mutateAsync(csvText);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileUp className="size-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import leads</DialogTitle>
          <DialogDescription>{helperText}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
            }}
            className="block w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onImport} disabled={importMutation.isPending}>
            {importMutation.isPending ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
