import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

export function getSupabaseAdminClient() {
  return createClient(env.nextPublicSupabaseUrl(), env.supabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
