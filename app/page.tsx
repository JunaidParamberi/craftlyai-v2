import { AuthEntryLinks } from "@/components/auth/auth-entry-links";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function HomePage() {
  return (
    <main className="p-8">
      <div className="flex items-center justify-between gap-4">
        <Logo />
        <ThemeToggle />
      </div>
      <p className="mt-4 text-muted-foreground">
        Supabase auth is wired. Use the links below to login, sign up,
        reset password, or open the protected page when signed in.
      </p>
      <p className="mt-2 text-muted-foreground">
        Add routes under{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
          app/
        </code>
        .
      </p>
      <AuthEntryLinks />
    </main>
  );
}
