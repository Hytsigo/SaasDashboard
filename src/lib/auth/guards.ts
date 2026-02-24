import type { Role } from "@/lib/auth/roles";
import { ROLE_PRIORITY } from "@/lib/auth/roles";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type OrganizationContext = {
  userId: string;
  organizationId: string;
  role: Role;
};

export function canManageOrganization(role: Role): boolean {
  return role === "owner" || role === "admin";
}

export function hasMinimumRole(role: Role, minimumRole: Role): boolean {
  return ROLE_PRIORITY[role] >= ROLE_PRIORITY[minimumRole];
}

function slugifyWorkspaceName(value: string): string {
  const normalized = value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)/g, "");

  return normalized.length > 0 ? normalized : "workspace";
}

async function ensureMembershipForUser(userId: string, userEmail: string | null | undefined) {
  const admin = getSupabaseAdminClient();

  const { data: existingMembership, error: membershipError } = await admin
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw new Error(`Failed to verify memberships: ${membershipError.message}`);
  }

  if (existingMembership) {
    return {
      organizationId: existingMembership.organization_id,
      role: existingMembership.role as Role,
    };
  }

  const workspaceBase = slugifyWorkspaceName(
    (userEmail ?? "workspace").split("@")[0] ?? "workspace",
  );
  const workspaceSlug = `${workspaceBase}-${userId.slice(0, 8)}`;
  const workspaceName = `${workspaceBase.replaceAll("-", " ")} Workspace`;

  const { data: organization, error: organizationError } = await admin
    .from("organizations")
    .insert({
      name: workspaceName
        .split(" ")
        .filter((token) => token.length > 0)
        .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
        .join(" "),
      slug: workspaceSlug,
    })
    .select("id")
    .single();

  if (organizationError) {
    throw new Error(`Failed to create organization: ${organizationError.message}`);
  }

  const { error: insertMembershipError } = await admin.from("memberships").insert({
    organization_id: organization.id,
    user_id: userId,
    role: "owner",
  });

  if (insertMembershipError) {
    throw new Error(`Failed to create membership: ${insertMembershipError.message}`);
  }

  return {
    organizationId: organization.id,
    role: "owner" as Role,
  };
}

export async function requireOrganizationContext(): Promise<OrganizationContext> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    const fallbackMembership = await ensureMembershipForUser(user.id, user.email);

    return {
      userId: user.id,
      organizationId: fallbackMembership.organizationId,
      role: fallbackMembership.role,
    };
  }

  return {
    userId: user.id,
    organizationId: data.organization_id,
    role: data.role as Role,
  };
}

export async function requireRole(minimumRole: Role): Promise<OrganizationContext> {
  const context = await requireOrganizationContext();

  if (!hasMinimumRole(context.role, minimumRole)) {
    throw new Error("Forbidden");
  }

  return context;
}
