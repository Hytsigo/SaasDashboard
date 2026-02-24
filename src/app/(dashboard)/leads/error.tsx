"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type LeadsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LeadsError({ error, reset }: LeadsErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold">Could not load leads</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Please retry. If this persists, verify your Supabase configuration and permissions.
      </p>
      <Button className="mt-4" onClick={reset}>
        Retry
      </Button>
    </section>
  );
}
