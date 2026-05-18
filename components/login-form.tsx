"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Mail } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-[1.875rem] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--fg)]">
          Welcome back
        </h1>
        <p className="text-sm text-[var(--fg-2)]">
          Sign in to continue. Or{" "}
          <Link
            href="/auth/sign-up"
            className="auth-link" style={{ color: "#A5B4FF", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 4 }}
          >
            create an account
          </Link>
          .
        </p>
      </header>

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full justify-center gap-2 rounded-xl border-[var(--border-strong)] bg-[var(--bg-surface)] text-sm font-medium shadow-[var(--shadow-xs)] hover:bg-[var(--bg-subtle)]"
        disabled={isGoogleLoading}
        onClick={handleGoogleLogin}
      >
        <FcGoogle className="size-[18px]" />
        {isGoogleLoading ? "Redirecting…" : "Continue with Google"}
      </Button>

      <div className="relative flex items-center">
        <span className="h-px flex-1 bg-[var(--border)]" />
        <span className="px-3 text-xs uppercase tracking-[0.16em] text-[var(--fg-3)]">
          or with email
        </span>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-xs font-medium text-[var(--fg-2)]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@studio.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl bg-[var(--bg-surface)]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-medium text-[var(--fg-2)]">
              Password
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs auth-link"
              style={{ color: "#A5B4FF", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 4 }}
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              className="h-11 rounded-xl bg-[var(--bg-surface)] pr-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-[var(--fg-3)] transition-colors hover:text-[var(--fg)]"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="group h-11 w-full justify-center gap-1.5 rounded-xl text-sm font-medium"
          disabled={isLoading}
        >
          {isLoading ? "Signing in…" : "Sign in"}
          {!isLoading && (
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </Button>

        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[var(--fg-2)] transition-colors hover:text-[var(--fg)]"
        >
          <Mail className="size-4" />
          Email me a magic link
        </Link>
      </form>

      <p className="text-center text-sm text-[var(--fg-2)]">
        New here?{" "}
        <Link
          href="/auth/sign-up"
          className="auth-link" style={{ color: "#A5B4FF", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 4 }}
        >
          Create a free account
        </Link>
      </p>
    </div>
  );
}
