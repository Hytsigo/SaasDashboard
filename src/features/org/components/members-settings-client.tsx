"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateMemberRoleAction } from "@/features/org/api/members.mutations";
import { membersKeys, membersQueryOptions } from "@/features/org/api/members.queries";
import type { Role } from "@/lib/auth/roles";
import { formatDate } from "@/lib/utils/dates";

export function MembersSettingsClient() {
  const queryClient = useQueryClient();
  const membersQuery = useQuery(membersQueryOptions());
  const { executeAsync } = useAction(updateMemberRoleAction);
  const [draftRoles, setDraftRoles] = useState<Record<string, Role>>({});

  const updateRoleMutation = useMutation({
    mutationFn: async (payload: { userId: string; role: Role }) => {
      const result = await executeAsync(payload);

      if (result?.serverError) {
        throw new Error(result.serverError);
      }
    },
    onSuccess: async () => {
      toast.success("Role updated.");
      await queryClient.invalidateQueries({ queryKey: membersKeys.all });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (membersQuery.isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Loading members...
      </div>
    );
  }

  if (membersQuery.isError) {
    return (
      <section className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Could not load members</h2>
        <p className="mt-2 text-sm text-muted-foreground">{membersQuery.error.message}</p>
        <Button className="mt-4" variant="outline" onClick={() => membersQuery.refetch()}>
          Retry
        </Button>
      </section>
    );
  }

  const data = membersQuery.data;
  if (!data) {
    return null;
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Members</h1>
        <p className="text-sm text-muted-foreground">
          Only owners can change roles. At least one owner must remain.
        </p>
      </header>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Current role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((member) => {
              const selectedRole = draftRoles[member.userId] ?? member.role;

              return (
                <TableRow key={member.userId}>
                  <TableCell>
                    <p className="font-medium">
                      {member.isCurrentUser ? "You" : member.userId.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">{member.userId}</p>
                  </TableCell>
                  <TableCell>
                    <span className="rounded bg-muted px-2 py-1 text-xs uppercase tracking-wide">
                      {member.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(member.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <select
                        value={selectedRole}
                        onChange={(event) =>
                          setDraftRoles((current) => ({
                            ...current,
                            [member.userId]: event.target.value as Role,
                          }))
                        }
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                        disabled={!data.canManageRoles || updateRoleMutation.isPending}
                      >
                        <option value="owner">owner</option>
                        <option value="admin">admin</option>
                        <option value="member">member</option>
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          !data.canManageRoles ||
                          selectedRole === member.role ||
                          updateRoleMutation.isPending
                        }
                        onClick={() =>
                          updateRoleMutation.mutate({ userId: member.userId, role: selectedRole })
                        }
                      >
                        Save
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
