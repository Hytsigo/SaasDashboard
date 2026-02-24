export type LeadStatus = "new" | "contacted" | "won" | "lost";

export type LeadSortField = "created_at" | "updated_at" | "name" | "email" | "status";
export type SortDirection = "asc" | "desc";

export type Lead = {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  status: LeadStatus;
  phone: string | null;
  company: string | null;
  source: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  deletedAt: string | null;
};

export type CreateLeadInput = {
  name: string;
  email: string;
  status: LeadStatus;
  phone?: string | null;
  company?: string | null;
  source?: string | null;
  notes?: string | null;
};

export type UpdateLeadInput = Partial<CreateLeadInput> & {
  id: string;
};

export type LeadsListFilters = {
  q?: string;
  status?: LeadStatus | "all";
  sort?: LeadSortField;
  direction?: SortDirection;
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
};

export type PaginatedLeads = {
  items: Lead[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CsvImportLeadRow = {
  name: string;
  email: string;
  status?: LeadStatus;
  phone?: string;
  company?: string;
  source?: string;
  notes?: string;
};

export type CsvImportResult = {
  createdCount: number;
  updatedCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
};

export type LeadOverviewStat = {
  status: LeadStatus;
  count: number;
};

export type LeadActivityItem = {
  id: string;
  action: string;
  entityType: string;
  createdAt: string;
};

export type LeadOverviewSummary = {
  totalLeads: number;
  newThisWeek: number;
  contactedCount: number;
  wonCount: number;
  lostCount: number;
  winRate: number;
  statusBreakdown: LeadOverviewStat[];
  recentLeads: Lead[];
  recentActivity: LeadActivityItem[];
};
