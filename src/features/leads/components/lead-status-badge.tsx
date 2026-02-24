import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/features/leads/domain/lead.types";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  won: "Won",
  lost: "Lost",
};

const STATUS_VARIANTS: Record<LeadStatus, "secondary" | "default" | "destructive" | "outline"> = {
  new: "secondary",
  contacted: "outline",
  won: "default",
  lost: "destructive",
};

type LeadStatusBadgeProps = {
  status: LeadStatus;
};

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}
