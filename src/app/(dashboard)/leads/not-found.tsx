import { EmptyState } from "@/components/common/EmptyState";

export default function LeadNotFound() {
  return (
    <EmptyState
      title="Lead not found"
      description="This lead does not exist or you do not have access to view it."
    />
  );
}
