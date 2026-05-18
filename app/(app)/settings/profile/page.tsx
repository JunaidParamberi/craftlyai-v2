import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileSettingsForm } from "@/components/features/settings/profile-form";
import { PageHeader } from "@/components/shared/page-header";
import { getProfile } from "@/lib/profile/actions";

export const metadata: Metadata = { title: "Profile" };

export default async function SettingsProfilePage() {
  const result = await getProfile();
  if (!result.ok || result.profile === null) redirect("/auth/login");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Settings"
        title="Profile"
        description="Your name, company, default currency, and address."
      />
      <ProfileSettingsForm profile={result.profile} />
    </div>
  );
}
