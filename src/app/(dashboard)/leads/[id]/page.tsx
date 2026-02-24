import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadStatusBadge } from "@/features/leads/components/lead-status-badge";
import { getLeadById } from "@/features/leads/services/leads.service";

type LeadDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{lead.name}</h1>
        <LeadStatusBadge status={lead.status} />
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lead details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <p>
            <span className="font-medium">Email:</span> {lead.email}
          </p>
          <p>
            <span className="font-medium">Company:</span> {lead.company ?? "-"}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {lead.phone ?? "-"}
          </p>
          <p>
            <span className="font-medium">Source:</span> {lead.source ?? "-"}
          </p>
          <p>
            <span className="font-medium">Notes:</span> {lead.notes ?? "-"}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
