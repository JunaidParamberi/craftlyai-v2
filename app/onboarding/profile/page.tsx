import { redirect } from "next/navigation";

import { ProfileOnboardingForm } from "@/components/onboarding/profile-onboarding-form";
import { getProfile } from "@/lib/profile/actions";

export const metadata = {
  title: "Profile · Onboarding · CraftlyAI",
};

export default async function OnboardingProfilePage() {
  const result = await getProfile();

  if (!result.ok) {
    redirect("/auth/login");
  }

  if (result.profile === null) {
    redirect("/auth/login");
  }

  return <ProfileOnboardingForm initialProfile={result.profile} />;
}
