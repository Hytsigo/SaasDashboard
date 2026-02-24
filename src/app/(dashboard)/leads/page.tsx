import { leadListFiltersSchema } from "@/features/leads/domain/lead.schema";
import { LeadsPageClient } from "@/features/leads/components/leads-page-client";

type LeadsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function normalizeSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const resolvedSearchParams = await searchParams;
  const normalizedSearchParams = normalizeSearchParams(resolvedSearchParams);
  const filters = leadListFiltersSchema.parse(normalizedSearchParams);

  return <LeadsPageClient initialFilters={filters} />;
}
