import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getProfile } from "@/lib/profile/actions";
import { getRequiredOnboardingPath } from "@/lib/onboarding/status";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";

  if (
    pathname.startsWith("/protected/profile-test") ||
    pathname.startsWith("/protected/brand-kit-test") ||
    pathname.startsWith("/protected/clients-test")
  ) {
    return children;
  }

  const result = await getProfile();

  if (!result.ok) {
    redirect("/auth/login");
  }

  if (result.profile === null) {
    redirect("/auth/login");
  }

  const nextOnboarding = getRequiredOnboardingPath(result.profile);
  if (nextOnboarding !== null) {
    redirect(nextOnboarding);
  }

  return children;
}
