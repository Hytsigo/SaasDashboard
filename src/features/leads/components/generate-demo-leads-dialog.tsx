"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateDemoLeadsAction } from "@/features/leads/api/leads.mutations";
import { leadsKeys } from "@/features/leads/api/leads.queries";

const DISMISS_STORAGE_KEY = "demo-leads-dialog-dismissed";

type GenerateDemoLeadsDialogProps = {
  openAutomatically: boolean;
  showTrigger?: boolean;
};

export function GenerateDemoLeadsDialog({
  openAutomatically,
  showTrigger = false,
}: GenerateDemoLeadsDialogProps) {
  const [open, setOpen] = useState(() => {
    if (!openAutomatically || typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(DISMISS_STORAGE_KEY) !== "true";
  });
  const queryClient = useQueryClient();
  const { executeAsync, isExecuting } = useAction(generateDemoLeadsAction);

  function closeAndDismiss() {
    window.localStorage.setItem(DISMISS_STORAGE_KEY, "true");
    setOpen(false);
  }

  async function onGenerate() {
    const result = await executeAsync({});

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }

    const createdCount = result?.data?.createdCount ?? 0;
    if (createdCount === 0) {
      toast.info("Demo leads already exist for this workspace.");
    } else {
      toast.success(`${createdCount} demo leads generated.`);
    }

    window.localStorage.setItem(DISMISS_STORAGE_KEY, "true");
    setOpen(false);
    await queryClient.invalidateQueries({ queryKey: leadsKeys.all });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger ? (
        <Button variant="outline" onClick={() => setOpen(true)} className="w-full sm:w-auto">
          Generate 10 demo leads
        </Button>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4" />
            New workspace detected
          </DialogTitle>
          <DialogDescription>
            Want to generate 10 demo leads so you can explore the full dashboard instantly?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={closeAndDismiss}>
            Not now
          </Button>
          <Button onClick={onGenerate} disabled={isExecuting}>
            {isExecuting ? "Generating..." : "Generate demo leads"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
