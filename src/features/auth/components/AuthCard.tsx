"use client";

import { z } from "zod";
import { Chrome, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
} from "@/features/auth/services/auth.client";

const credentialsSchema = z.object({
  email: z.email("Use a valid email address.").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type Credentials = z.infer<typeof credentialsSchema>;

type AuthMode = "login" | "signup";

function parseCredentials(formData: FormData): Credentials {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid credentials.");
  }

  return parsed.data;
}

type AuthCardProps = {
  nextPath?: string;
};

export function AuthCard({ nextPath = "/" }: AuthCardProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isPending, startTransition] = useTransition();

  const isLoginMode = mode === "login";
  const slideClassName = useMemo(() => {
    return isLoginMode ? "translate-x-0" : "-translate-x-1/2";
  }, [isLoginMode]);

  function onSubmit(formData: FormData, currentMode: AuthMode) {
    startTransition(async () => {
      try {
        const credentials = parseCredentials(formData);

        if (currentMode === "login") {
          await signInWithPassword(credentials);
          toast.success("Welcome back.");
          router.push(nextPath);
          router.refresh();
          return;
        }

        await signUpWithPassword(credentials);
        toast.success("Account created. You can now sign in.");
        setMode("login");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unexpected auth error.";
        toast.error(message);
      }
    });
  }

  function onGoogleSignIn() {
    startTransition(async () => {
      try {
        await signInWithGoogle();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Google sign-in failed.";
        toast.error(message);
      }
    });
  }

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b bg-muted/40 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          SaaS Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-card-foreground">Secure access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Continue with your account or create a new workspace profile.
        </p>
      </div>

      <div className="p-6">
        <div className="mb-4 grid grid-cols-2 rounded-lg border bg-muted/30 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-md px-3 py-2 text-sm transition ${
              isLoginMode ? "bg-background font-medium shadow-sm" : "text-muted-foreground"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-md px-3 py-2 text-sm transition ${
              isLoginMode ? "text-muted-foreground" : "bg-background font-medium shadow-sm"
            }`}
          >
            Create account
          </button>
        </div>

        <div className="overflow-hidden">
          <div
            className={`flex w-[200%] transform transition-transform duration-500 ease-in-out ${slideClassName}`}
          >
            <div className="w-1/2 pr-2">
              <AuthForm
                key="login"
                mode="login"
                onSubmit={onSubmit}
                onGoogleSignIn={onGoogleSignIn}
                isPending={isPending}
              />
            </div>
            <div className="w-1/2 pl-2">
              <AuthForm
                key="signup"
                mode="signup"
                onSubmit={onSubmit}
                onGoogleSignIn={onGoogleSignIn}
                isPending={isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type AuthFormProps = {
  mode: AuthMode;
  onSubmit: (formData: FormData, mode: AuthMode) => void;
  onGoogleSignIn: () => void;
  isPending: boolean;
};

function AuthForm({ mode, onSubmit, onGoogleSignIn, isPending }: AuthFormProps) {
  const isLoginMode = mode === "login";

  return (
    <form
      action={(formData) => {
        onSubmit(formData, mode);
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor={`${mode}-email`}>Email</Label>
        <Input
          id={`${mode}-email`}
          name="email"
          type="email"
          placeholder="you@company.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${mode}-password`}>Password</Label>
        <Input
          id={`${mode}-password`}
          name="password"
          type="password"
          placeholder="Min 8 chars"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {isLoginMode ? "Sign in" : "Create account"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onGoogleSignIn}
        disabled={isPending}
      >
        <Chrome className="size-4" />
        Continue with Google
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {isLoginMode
          ? "No account yet? Switch to create account."
          : "A workspace is automatically created when you sign up."}
      </p>
    </form>
  );
}
