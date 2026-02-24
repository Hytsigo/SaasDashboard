import { z } from "zod";

import { canManageOrganization, requireOrganizationContext, requireRole } from "@/lib/auth/guards";
import type { Role } from "@/lib/auth/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { OrganizationMembersView } from "@/features/org/domain/member.types";

const membershipRowSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["owner", "admin", "member"]),
  created_at: z.string(),
});

const membershipRowsSchema = z.array(membershipRowSchema);

export async function listOrganizationMembers(): Promise<OrganizationMembersView> {
  const context = await requireOrganizationContext();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("memberships")
    .select("user_id, role, created_at")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to list organization members: ${error.message}`);
  }

  const rows = membershipRowsSchema.parse(data ?? []);

  return {
    currentUserRole: context.role,
    canManageRoles: context.role === "owner",
    items: rows.map((row) => ({
      userId: row.user_id,
      role: row.role,
      createdAt: row.created_at,
      isCurrentUser: row.user_id === context.userId,
    })),
  };
}

export async function updateOrganizationMemberRole(userId: string, role: Role): Promise<void> {
  const context = await requireRole("owner");
  const supabase = await getSupabaseServerClient();

  const { data: targetMembership, error: targetMembershipError } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", context.organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (targetMembershipError) {
    throw new Error(`Failed to verify target membership: ${targetMembershipError.message}`);
  }

  if (!targetMembership) {
    throw new Error("Membership not found");
  }

  if (targetMembership.role === "owner" && role !== "owner") {
    const { count: ownerCount, error: ownerCountError } = await supabase
      .from("memberships")
      .select("id", { head: true, count: "exact" })
      .eq("organization_id", context.organizationId)
      .eq("role", "owner");

    if (ownerCountError) {
      throw new Error(`Failed to verify owner count: ${ownerCountError.message}`);
    }

    if ((ownerCount ?? 0) <= 1) {
      throw new Error("At least one owner must remain in the organization");
    }
  }

  if (!canManageOrganization(context.role)) {
    throw new Error("Forbidden");
  }

  const { error } = await supabase
    .from("memberships")
    .update({ role })
    .eq("organization_id", context.organizationId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to update member role: ${error.message}`);
  }
}
