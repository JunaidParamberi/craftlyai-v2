import Link from "next/link";
import { redirect } from "next/navigation";

import { BrandKitForm } from "@/components/onboarding/brand-kit-form";
import { getBrandKit } from "@/lib/brand-kit/actions";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Brand kit test",
};

export default async function BrandKitBackendTestPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const result = await getBrandKit();

  const brandKit = result.ok && result.brandKit ? result.brandKit : null;
  const panelKey = brandKit?.updated_at ?? "no-brand-kit";

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Dev harness for{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">getBrandKit</code> /{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">saveBrandKit</code>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Brand kit backend test</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="text-foreground">{user.email}</span>
        </p>
      </header>

      {!result.ok ? (
        <div
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          getBrandKit failed: {result.message}
        </div>
      ) : null}

      {result.ok && result.brandKit === null ? (
        <div
          className={cn(
            "rounded-md border px-3 py-2 text-sm",
            result.reason === "no_row"
              ? "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100"
              : "border-border bg-muted/50 text-muted-foreground",
          )}
        >
          {result.reason === "no_row"
            ? "No brand kit row yet — save the form once (creates row + links profiles.brand_kit_id)."
            : "No session (unexpected here)."}
        </div>
      ) : null}

      {result.ok && result.brandKit ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">Current row (getBrandKit)</h2>
          <pre className="max-h-64 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs">
            {JSON.stringify(result.brandKit, null, 2)}
          </pre>
        </section>
      ) : null}

      <BrandKitForm
        key={panelKey}
        initialBrandKit={brandKit}
        redirectAfterSave={false}
        backHref="/profile-test"
        backLabel="Back to profile test"
        submitLabel="Save via saveBrandKit()"
      />

      <p className="text-xs text-muted-foreground">
        Remove this route before production or protect behind env flag.{" "}
        <Link href="/onboarding/client" className="font-medium underline underline-offset-4">
          Next: First client (onboarding placeholder)
        </Link>
        {" · "}
        <Link href="/dashboard" className="underline underline-offset-4">
          Protected home
        </Link>
        {" · "}
        <Link href="/onboarding/brand" className="underline underline-offset-4">
          Onboarding · Brand kit
        </Link>
      </p>
    </div>
  );
}
