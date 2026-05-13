import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";

import { BrandKitForm } from "@/components/onboarding/brand-kit-form";
import { getBrandKit } from "@/lib/brand-kit/actions";
import { createClient } from "@/lib/supabase/server";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata = {
  title: "Brand kit · Settings · CraftlyAI",
};

export default async function SettingsBrandPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const result = await getBrandKit();

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Brand kit
        </h1>
        <Alert variant="destructive">
          <AlertTitle>Could not load brand kit</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/settings"
          className="flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeftIcon className="size-3.5" aria-hidden />
          Settings
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Brand kit
          </h1>
          <p className="max-w-lg text-sm text-muted-foreground">
            Your logo, colors, and font are applied to invoices, proposals, and
            client portals.
          </p>
        </div>
      </div>

      <BrandKitForm
        initialBrandKit={result.brandKit}
        variant="default"
        redirectAfterSave={false}
        submitLabel="Save changes"
      />
    </div>
  );
}
