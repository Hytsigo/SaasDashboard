"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { leadsOverviewQueryOptions } from "@/features/leads/api/leads.queries";
import { GenerateDemoLeadsDialog } from "@/features/leads/components/generate-demo-leads-dialog";
import { LeadStatusBadge } from "@/features/leads/components/lead-status-badge";
import { formatDate } from "@/lib/utils/dates";

function formatActionLabel(action: string): string {
  return action
    .replaceAll(".", " ")
    .split(" ")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function calculateChangeValue(value: number, baseline: number): string {
  if (baseline <= 0) {
    return value > 0 ? `+${value}` : "0";
  }

  const percentage = Math.round((value / baseline) * 100);
  return `+${percentage}%`;
}

export function OverviewPageClient() {
  const query = useQuery(leadsOverviewQueryOptions());

  if (query.isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Loading overview...
      </div>
    );
  }

  if (query.isError) {
    return (
      <section className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Could not load overview</h2>
        <p className="mt-2 text-sm text-muted-foreground">{query.error.message}</p>
        <Button className="mt-4" variant="outline" size="sm" onClick={() => query.refetch()}>
          Retry
        </Button>
      </section>
    );
  }

  const summary = query.data;

  if (!summary) {
    return (
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Loading overview...
      </div>
    );
  }

  if (summary.totalLeads === 0) {
    return (
      <div className="space-y-4">
        <GenerateDemoLeadsDialog openAutomatically />
        <EmptyState
          title="Your workspace is ready"
          description="Start by importing your first CSV or generate demo leads in one click."
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button asChild>
            <Link href="/leads">Go to leads</Link>
          </Button>
          <GenerateDemoLeadsDialog openAutomatically={false} showTrigger />
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-5 sm:space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Performance snapshot for your current organization.
        </p>
      </header>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total leads</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">{summary.totalLeads}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Active leads in your pipeline.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>New this week</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">{summary.newThisWeek}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {calculateChangeValue(summary.newThisWeek, summary.totalLeads)} vs total base.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Contacted</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">{summary.contactedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Leads moved beyond new stage.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Win rate</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">{summary.winRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${summary.winRate}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline health</CardTitle>
            <CardDescription>Current lead distribution by status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.statusBreakdown.map((item) => {
              const ratio =
                summary.totalLeads > 0 ? Math.round((item.count / summary.totalLeads) * 100) : 0;

              return (
                <div key={item.status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LeadStatusBadge status={item.status} />
                      <span className="text-sm text-muted-foreground">{item.count} leads</span>
                    </div>
                    <span className="text-sm font-medium">{ratio}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/80 transition-all"
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest system events in your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              summary.recentActivity.map((item) => (
                <div key={item.id} className="rounded-md border p-3">
                  <p className="text-sm font-medium">{formatActionLabel(item.action)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.entityType} · {formatDate(item.createdAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recently updated leads</CardTitle>
          <CardDescription>Quick shortcuts to the latest records.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.recentLeads.map((lead) => (
            <div
              key={lead.id}
              className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">
                  {lead.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {lead.email} · updated {formatDate(lead.updatedAt)}
                </p>
              </div>
              <LeadStatusBadge status={lead.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
