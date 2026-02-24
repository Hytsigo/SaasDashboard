export const ROLES = ["owner", "admin", "member"] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_PRIORITY: Record<Role, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};
