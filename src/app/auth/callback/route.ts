import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const redirectUrl = new URL("/login", url.origin);
      redirectUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(redirectUrl);
    }
  }

  const redirectUrl = new URL(next, url.origin);
  return NextResponse.redirect(redirectUrl);
}
