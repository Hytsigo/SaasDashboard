function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  nextPublicSupabaseUrl: () => getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  nextPublicSupabaseAnonKey: () => getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () => getEnv("SUPABASE_SERVICE_ROLE_KEY"),
};
