"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/services/auth.client";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onSignOut() {
    startTransition(async () => {
      try {
        await signOut();
        router.push("/login");
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not sign out.";
        toast.error(message);
      }
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={onSignOut} disabled={isPending}>
      <LogOut className="size-4" />
      <span className="hidden sm:inline">{isPending ? "Signing out..." : "Sign out"}</span>
    </Button>
  );
}
