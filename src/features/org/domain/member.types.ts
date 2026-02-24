import type { Role } from "@/lib/auth/roles";

export type OrganizationMember = {
  userId: string;
  role: Role;
  createdAt: string;
  isCurrentUser: boolean;
};

export type OrganizationMembersView = {
  currentUserRole: Role;
  canManageRoles: boolean;
  items: OrganizationMember[];
};
