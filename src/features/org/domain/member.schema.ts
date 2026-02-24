import { z } from "zod";

export const updateMemberRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["owner", "admin", "member"]),
});

export type UpdateMemberRoleSchema = z.infer<typeof updateMemberRoleSchema>;
