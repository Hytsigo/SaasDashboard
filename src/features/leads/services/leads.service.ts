import { z } from "zod";

import { canManageOrganization, requireOrganizationContext, requireRole } from "@/lib/auth/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CreateLeadInput,
  CsvImportLeadRow,
  CsvImportResult,
  LeadActivityItem,
  LeadOverviewSummary,
  Lead,
  LeadsListFilters,
  PaginatedLeads,
  UpdateLeadInput,
} from "@/features/leads/domain/lead.types";

const leadRowSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  status: z.enum(["new", "contacted", "won", "lost"]),
  phone: z.string().nullable(),
  company: z.string().nullable(),
  source: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string().uuid().nullable(),
  deleted_at: z.string().nullable(),
});

const leadRowsSchema = z.array(leadRowSchema);

const activityLogRowSchema = z.object({
  id: z.string().uuid(),
  action: z.string(),
  entity_type: z.string(),
  created_at: z.string(),
});

const activityLogRowsSchema = z.array(activityLogRowSchema);

function mapLeadRowToDomain(row: z.infer<typeof leadRowSchema>): Lead {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    email: row.email,
    status: row.status,
    phone: row.phone,
    company: row.company,
    source: row.source,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    deletedAt: row.deleted_at,
  };
}

function mapActivityRowToDomain(row: z.infer<typeof activityLogRowSchema>): LeadActivityItem {
  return {
    id: row.id,
    action: row.action,
    entityType: row.entity_type,
    createdAt: row.created_at,
  };
}

function toNullable(value: string | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length === 0 ? null : normalized;
}

function escapeLike(value: string): string {
  return value.replaceAll("%", "\\%").replaceAll("_", "\\_").replaceAll(",", " ");
}

async function logLeadActivity(
  organizationId: string,
  actorId: string,
  leadId: string,
  action: string,
): Promise<void> {
  const supabase = await getSupabaseServerClient();

  await supabase.from("activity_logs").insert({
    organization_id: organizationId,
    actor_id: actorId,
    entity_type: "lead",
    entity_id: leadId,
    action,
  });
}

export async function listLeads(filters: LeadsListFilters = {}): Promise<PaginatedLeads> {
  const context = await requireOrganizationContext();
  const supabase = await getSupabaseServerClient();

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const sort = filters.sort ?? "created_at";
  const direction = filters.direction ?? "desc";

  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .eq("organization_id", context.organizationId);

  if (!filters.includeDeleted) {
    query = query.is("deleted_at", null);
  }

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.q) {
    const term = escapeLike(filters.q.trim());
    if (term.length > 0) {
      query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%`);
    }
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order(sort, { ascending: direction === "asc" })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to list leads: ${error.message}`);
  }

  const rows = leadRowsSchema.parse(data ?? []);
  const total = count ?? 0;

  return {
    items: rows.map(mapLeadRowToDomain),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

async function countLeadsByFilter(params: {
  organizationId: string;
  status?: Lead["status"];
  createdAfter?: string;
}): Promise<number> {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("leads")
    .select("id", { head: true, count: "exact" })
    .eq("organization_id", params.organizationId)
    .is("deleted_at", null);

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.createdAfter) {
    query = query.gte("created_at", params.createdAfter);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Failed to count leads: ${error.message}`);
  }

  return count ?? 0;
}

export async function getLeadOverviewSummary(): Promise<LeadOverviewSummary> {
  const context = await requireOrganizationContext();
  const supabase = await getSupabaseServerClient();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalLeads,
    newThisWeek,
    contactedCount,
    wonCount,
    lostCount,
    recentLeadsResponse,
    activityResponse,
  ] = await Promise.all([
    countLeadsByFilter({ organizationId: context.organizationId }),
    countLeadsByFilter({ organizationId: context.organizationId, createdAfter: oneWeekAgo }),
    countLeadsByFilter({ organizationId: context.organizationId, status: "contacted" }),
    countLeadsByFilter({ organizationId: context.organizationId, status: "won" }),
    countLeadsByFilter({ organizationId: context.organizationId, status: "lost" }),
    supabase
      .from("leads")
      .select("*")
      .eq("organization_id", context.organizationId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("activity_logs")
      .select("id, action, entity_type, created_at")
      .eq("organization_id", context.organizationId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  if (recentLeadsResponse.error) {
    throw new Error(`Failed to load recent leads: ${recentLeadsResponse.error.message}`);
  }

  if (activityResponse.error) {
    throw new Error(`Failed to load activity feed: ${activityResponse.error.message}`);
  }

  const recentLeads = leadRowsSchema.parse(recentLeadsResponse.data ?? []).map(mapLeadRowToDomain);
  const recentActivity = activityLogRowsSchema
    .parse(activityResponse.data ?? [])
    .map(mapActivityRowToDomain);

  const decisionTotal = wonCount + lostCount;
  const winRate = decisionTotal === 0 ? 0 : Math.round((wonCount / decisionTotal) * 100);

  return {
    totalLeads,
    newThisWeek,
    contactedCount,
    wonCount,
    lostCount,
    winRate,
    statusBreakdown: [
      { status: "new", count: Math.max(totalLeads - contactedCount - wonCount - lostCount, 0) },
      { status: "contacted", count: contactedCount },
      { status: "won", count: wonCount },
      { status: "lost", count: lostCount },
    ],
    recentLeads,
    recentActivity,
  };
}

export async function listLeadsForExport(filters: LeadsListFilters = {}): Promise<Lead[]> {
  const firstPage = await listLeads({
    ...filters,
    page: 1,
    pageSize: 1000,
  });

  if (firstPage.totalPages <= 1) {
    return firstPage.items;
  }

  const pages = [firstPage.items];

  for (let currentPage = 2; currentPage <= firstPage.totalPages; currentPage += 1) {
    const nextPage = await listLeads({
      ...filters,
      page: currentPage,
      pageSize: 1000,
    });
    pages.push(nextPage.items);
  }

  return pages.flat();
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const context = await requireOrganizationContext();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("organization_id", context.organizationId)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch lead: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapLeadRowToDomain(leadRowSchema.parse(data));
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const context = await requireRole("member");
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("leads")
    .insert({
      organization_id: context.organizationId,
      created_by: context.userId,
      name: input.name,
      email: input.email.toLowerCase(),
      status: input.status,
      phone: toNullable(input.phone),
      company: toNullable(input.company),
      source: toNullable(input.source),
      notes: toNullable(input.notes),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create lead: ${error.message}`);
  }

  const lead = mapLeadRowToDomain(leadRowSchema.parse(data));
  await logLeadActivity(context.organizationId, context.userId, lead.id, "lead.created");

  return lead;
}

export async function updateLead(input: UpdateLeadInput): Promise<Lead> {
  const context = await requireRole("member");
  const supabase = await getSupabaseServerClient();

  const updatePayload: Record<string, string | null> = {};

  if (input.name !== undefined) {
    updatePayload.name = input.name;
  }

  if (input.email !== undefined) {
    updatePayload.email = input.email.toLowerCase();
  }

  if (input.status !== undefined) {
    updatePayload.status = input.status;
  }

  if (input.phone !== undefined) {
    updatePayload.phone = toNullable(input.phone);
  }

  if (input.company !== undefined) {
    updatePayload.company = toNullable(input.company);
  }

  if (input.source !== undefined) {
    updatePayload.source = toNullable(input.source);
  }

  if (input.notes !== undefined) {
    updatePayload.notes = toNullable(input.notes);
  }

  const { data, error } = await supabase
    .from("leads")
    .update(updatePayload)
    .eq("organization_id", context.organizationId)
    .eq("id", input.id)
    .is("deleted_at", null)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update lead: ${error.message}`);
  }

  const lead = mapLeadRowToDomain(leadRowSchema.parse(data));
  await logLeadActivity(context.organizationId, context.userId, lead.id, "lead.updated");

  return lead;
}

export async function softDeleteLead(id: string): Promise<void> {
  const context = await requireRole("admin");
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("leads")
    .update({ deleted_at: new Date().toISOString() })
    .eq("organization_id", context.organizationId)
    .eq("id", id)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`Failed to delete lead: ${error.message}`);
  }

  await logLeadActivity(context.organizationId, context.userId, id, "lead.soft_deleted");
}

export async function bulkUpdateLeadStatus(ids: string[], status: Lead["status"]): Promise<void> {
  const context = await requireRole("member");
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("organization_id", context.organizationId)
    .in("id", ids)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`Failed to bulk update leads: ${error.message}`);
  }
}

export async function importLeads(rows: CsvImportLeadRow[]): Promise<CsvImportResult> {
  const context = await requireRole("admin");
  if (!canManageOrganization(context.role)) {
    throw new Error("Forbidden");
  }

  const supabase = await getSupabaseServerClient();
  const normalized = rows.map((row) => ({
    name: row.name.trim(),
    email: row.email.toLowerCase().trim(),
    status: row.status ?? "new",
    phone: toNullable(row.phone),
    company: toNullable(row.company),
    source: toNullable(row.source),
    notes: toNullable(row.notes),
  }));

  const uniqueEmails = [...new Set(normalized.map((item) => item.email))];
  const { data: existingRows, error: existingError } = await supabase
    .from("leads")
    .select("email")
    .eq("organization_id", context.organizationId)
    .in("email", uniqueEmails);

  if (existingError) {
    throw new Error(`Failed to check existing leads: ${existingError.message}`);
  }

  const existingEmailSet = new Set((existingRows ?? []).map((item) => item.email as string));
  const payload = normalized.map((item) => ({
    organization_id: context.organizationId,
    created_by: context.userId,
    name: item.name,
    email: item.email,
    status: item.status,
    phone: item.phone,
    company: item.company,
    source: item.source,
    notes: item.notes,
    deleted_at: null,
  }));

  const { error } = await supabase
    .from("leads")
    .upsert(payload, { onConflict: "organization_id,email" });

  if (error) {
    throw new Error(`Failed to import leads: ${error.message}`);
  }

  return {
    createdCount: normalized.filter((item) => !existingEmailSet.has(item.email)).length,
    updatedCount: normalized.filter((item) => existingEmailSet.has(item.email)).length,
    errorCount: 0,
    errors: [],
  };
}

const DEMO_LEAD_TEMPLATES: Array<{
  name: string;
  status: Lead["status"];
  company: string;
  source: string;
  notes: string;
}> = [
  {
    name: "Apex Labs",
    status: "new",
    company: "Apex",
    source: "Website",
    notes: "Requested pricing",
  },
  {
    name: "Northwind Health",
    status: "contacted",
    company: "Northwind",
    source: "LinkedIn",
    notes: "Asked for security docs",
  },
  {
    name: "Summit Retail",
    status: "won",
    company: "Summit",
    source: "Referral",
    notes: "Annual contract signed",
  },
  {
    name: "Blue Orbit",
    status: "lost",
    company: "Blue Orbit",
    source: "Outbound",
    notes: "Budget frozen",
  },
  {
    name: "Nimbus Energy",
    status: "new",
    company: "Nimbus",
    source: "Website",
    notes: "Needs migration support",
  },
  {
    name: "Vector Logistics",
    status: "contacted",
    company: "Vector",
    source: "Event",
    notes: "Demo scheduled next week",
  },
  {
    name: "PixelForge",
    status: "won",
    company: "PixelForge",
    source: "Partner",
    notes: "Expansion opportunity",
  },
  {
    name: "Terra Foods",
    status: "new",
    company: "Terra",
    source: "Ads",
    notes: "Inbound from campaign",
  },
  {
    name: "Stratus Mobility",
    status: "contacted",
    company: "Stratus",
    source: "Cold email",
    notes: "Waiting for IT review",
  },
  {
    name: "Quantum Ops",
    status: "lost",
    company: "Quantum",
    source: "Outbound",
    notes: "Chose competitor",
  },
];

export async function generateDemoLeads(): Promise<{ createdCount: number }> {
  const context = await requireRole("member");
  const supabase = await getSupabaseServerClient();

  const { count, error: countError } = await supabase
    .from("leads")
    .select("id", { head: true, count: "exact" })
    .eq("organization_id", context.organizationId)
    .is("deleted_at", null);

  if (countError) {
    throw new Error(`Failed to validate demo state: ${countError.message}`);
  }

  if ((count ?? 0) > 0) {
    return { createdCount: 0 };
  }

  const uniqueSuffix = Date.now();
  const payload = DEMO_LEAD_TEMPLATES.map((lead, index) => ({
    organization_id: context.organizationId,
    created_by: context.userId,
    name: lead.name,
    email: `${lead.name.toLowerCase().replaceAll(" ", "-")}-${uniqueSuffix}-${index}@demo.local`,
    status: lead.status,
    phone: `+1-202-555-${String(1000 + index)}`,
    company: lead.company,
    source: lead.source,
    notes: lead.notes,
  }));

  const { data, error } = await supabase.from("leads").insert(payload).select("id");

  if (error) {
    throw new Error(`Failed to generate demo leads: ${error.message}`);
  }

  const createdIds = (data ?? []).map((row) => row.id as string);

  await Promise.all(
    createdIds.map((leadId) =>
      logLeadActivity(context.organizationId, context.userId, leadId, "lead.demo_generated"),
    ),
  );

  return { createdCount: createdIds.length };
}
