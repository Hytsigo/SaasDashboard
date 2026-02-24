"use server";

import { actionClient } from "@/lib/safe-action";
import { updateMemberRoleSchema } from "@/features/org/domain/member.schema";
import { updateOrganizationMemberRole } from "@/features/org/services/members.service";

export const updateMemberRoleAction = actionClient
  .schema(updateMemberRoleSchema)
  .action(async ({ parsedInput }) => {
    await updateOrganizationMemberRole(parsedInput.userId, parsedInput.role);
    return { success: true };
  });
