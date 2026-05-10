import type { ProfileRow } from "@/types";

export type OnboardingRoute =
  | "/onboarding/profile"
  | "/onboarding/brand"
  | "/onboarding/client";

/**
 * First incomplete onboarding URL, or null when the user may access the main app.
 */
export function getRequiredOnboardingPath(profile: ProfileRow): OnboardingRoute | null {
  if (profile.onboarding_completed_at) {
    return null;
  }

  const name = profile.full_name?.trim();
  if (!name) {
    return "/onboarding/profile";
  }

  if (!profile.brand_kit_id && !profile.onboarding_brand_skipped) {
    return "/onboarding/brand";
  }

  return "/onboarding/client";
}

export function onboardingStepFromPath(pathname: string): 1 | 2 | 3 {
  if (pathname.startsWith("/onboarding/profile")) return 1;
  if (pathname.startsWith("/onboarding/brand")) return 2;
  return 3;
}

export function stepLabel(step: 1 | 2 | 3): string {
  switch (step) {
    case 1:
      return "Profile basics";
    case 2:
      return "Brand identity";
    default:
      return "First client";
  }
}
