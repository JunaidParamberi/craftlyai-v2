import Link from "next/link";

import { BrandLockupLink } from "@/components/shared/brand-lockup";
import { AuthThemeToggle } from "@/components/shared/auth-theme-toggle";
import { AuthMarketingPanel } from "@/components/auth/auth-marketing-panel";
import { GoogleOneTap } from "@/components/auth/google-one-tap";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  return (
    <div className="grid min-h-svh w-full grid-cols-1 lg:grid-cols-2">
      <GoogleOneTap />
      <div className="relative flex min-h-svh flex-col bg-[var(--bg-canvas)] px-6 py-8 sm:px-10 lg:px-14 xl:px-20">
        <header className="flex items-center justify-between gap-4">
          <BrandLockupLink href="/" linkClassName="shrink-0" />
          <AuthThemeToggle />
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </main>

        <footer className="flex flex-col items-start justify-between gap-3 text-xs text-[var(--fg-3)] sm:flex-row sm:items-center">
          <span>© {year} CraftlyAI</span>
          <nav className="flex items-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-[var(--fg)]">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-[var(--fg)]">
              Terms
            </Link>
            <Link href="/support" className="transition-colors hover:text-[var(--fg)]">
              Help
            </Link>
          </nav>
        </footer>
      </div>

      <AuthMarketingPanel />
    </div>
  );
}
