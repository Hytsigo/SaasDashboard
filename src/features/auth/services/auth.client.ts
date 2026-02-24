"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Credentials = {
  email: string;
  password: string;
};

export async function signInWithPassword({ email, password }: Credentials): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signUpWithPassword({ email, password }: Credentials): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}
