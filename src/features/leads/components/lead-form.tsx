"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { createLeadSchema, type CreateLeadSchemaInput } from "@/features/leads/domain/lead.schema";

export function LeadForm() {
  const form = useForm<CreateLeadSchemaInput>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      name: "",
      email: "",
      status: "new",
      phone: "",
      company: "",
      source: "",
      notes: "",
    },
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(() => undefined)}>
      <p className="text-sm text-muted-foreground">Lead form scaffold ready for wiring.</p>
    </form>
  );
}
