import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { BrandLockupLink } from "@/components/shared/brand-lockup";
import { AuthThemeToggle } from "@/components/shared/auth-theme-toggle";
import { AuthMarketingPanel } from "@/components/auth/auth-marketing-panel";
import { OnboardingProgressStrip } from "@/components/onboarding/onboarding-progress-strip";
import { getProfile } from "@/lib/profile/actions";
import {
  getRequiredOnboardingPath,
  onboardingStepFromPath,
} from "@/lib/onboarding/status";
import { sectionTitleTemplate } from "@/lib/metadata";

export const metadata: Metadata = {
  title: {
    default: "Onboarding",
    template: sectionTitleTemplate("Onboarding"),
  },
};

export default async function OnboardingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";

  const profileResult = await getProfile();

  if (!profileResult.ok) redirect("/auth/login");
  if (profileResult.profile === null) redirect("/auth/login");

  const required = getRequiredOnboardingPath(profileResult.profile);
  if (required === null) redirect("/dashboard");

  const pathMatches =
    pathname === required || pathname.startsWith(`${required}/`);
  if (!pathMatches) redirect(required);

  const step = onboardingStepFromPath(pathname);
  const year = new Date().getFullYear();

  return (
    <div className="grid min-h-svh w-full grid-cols-1 lg:grid-cols-2">
      <div className="relative flex min-h-svh flex-col bg-[var(--bg-canvas)] px-6 py-8 sm:px-10 lg:px-14 xl:px-20">
        <header className="flex items-center justify-between gap-4">
          <BrandLockupLink href="/" linkClassName="shrink-0" />
          <AuthThemeToggle />
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="flex w-full max-w-md flex-col gap-8">
            <OnboardingProgressStrip step={step} />
            {children}
          </div>
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
