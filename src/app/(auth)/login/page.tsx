import { redirect } from "next/navigation";

import { AuthCard } from "@/features/auth/components/AuthCard";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function normalizeSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const normalizedSearchParams = normalizeSearchParams(resolvedSearchParams);
  const nextPath =
    typeof normalizedSearchParams.next === "string" && normalizedSearchParams.next.startsWith("/")
      ? normalizedSearchParams.next
      : "/";

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,hsl(var(--muted)),transparent_40%),radial-gradient(circle_at_85%_20%,hsl(var(--accent)),transparent_35%),radial-gradient(circle_at_50%_80%,hsl(var(--secondary)),transparent_40%)] opacity-30" />
      <AuthCard nextPath={nextPath} />
    </main>
  );
}
