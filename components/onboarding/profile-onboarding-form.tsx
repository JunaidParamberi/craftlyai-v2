"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon } from "lucide-react";

import {
  onboardingProfileFormSchema,
  type OnboardingProfileFormValues,
} from "@/lib/validations/onboarding-profile-form";
import { updateProfile, type UpdateProfileResult } from "@/lib/profile/actions";
import type { ProfileRow } from "@/types";
import {
  FORM_CARD_CONTENT_BEFORE_FOOTER,
  FORM_CARD_FOOTER_ONBOARDING_SPLIT,
} from "@/lib/ui/form-card";
import { cn } from "@/lib/utils";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { CountryCombobox } from "@/components/onboarding/country-combobox";

function toInput(val: string | null): string {
  return val ?? "";
}

function emptyToNull(s: string): string | null {
  const t = s.trim();
  return t === "" ? null : t;
}

type Props = {
  initialProfile: ProfileRow | null;
};

export function ProfileOnboardingForm({ initialProfile }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverResult, setServerResult] = useState<UpdateProfileResult | null>(
    null,
  );

  const defaults = useMemo(
    () => ({
      full_name: toInput(initialProfile?.full_name ?? null),
      company_name: toInput(initialProfile?.company_name ?? null),
      vat_registered: initialProfile?.vat_registered ?? false,
      vat_number: toInput(initialProfile?.vat_number ?? null),
      address_line1: toInput(initialProfile?.address_line1 ?? null),
      address_line2: toInput(initialProfile?.address_line2 ?? null),
      address_city: toInput(initialProfile?.address_city ?? null),
      address_region: toInput(initialProfile?.address_region ?? null),
      address_postal_code: toInput(initialProfile?.address_postal_code ?? null),
      address_country: toInput(initialProfile?.address_country ?? null),
      default_currency: initialProfile?.default_currency ?? "USD",
    }),
    [initialProfile],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingProfileFormValues>({
    resolver: zodResolver(onboardingProfileFormSchema),
    defaultValues: defaults,
  });

  const vatRegistered = watch("vat_registered");
  const addressCountry = watch("address_country");
  const defaultCurrency = watch("default_currency");

  function onSubmit(values: OnboardingProfileFormValues) {
    setServerResult(null);
    startTransition(async () => {
      const patch = {
        full_name: emptyToNull(values.full_name),
        company_name: emptyToNull(values.company_name),
        vat_registered: values.vat_registered,
        vat_number: values.vat_registered
          ? emptyToNull(values.vat_number)
          : null,
        address_line1: emptyToNull(values.address_line1),
        address_line2: emptyToNull(values.address_line2),
        address_city: emptyToNull(values.address_city),
        address_region: emptyToNull(values.address_region),
        address_postal_code: emptyToNull(values.address_postal_code),
        address_country: emptyToNull(values.address_country)?.toUpperCase() ?? null,
        default_currency: values.default_currency,
      };

      const result = await updateProfile(patch);
      setServerResult(result);
      if (result.ok) {
        router.refresh();
        router.push("/onboarding/brand");
      }
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-8">
      <div className="flex shrink-0 flex-col gap-2 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Tell us about you
        </h1>
        <p className="text-sm text-muted-foreground">
          Let&apos;s set up your workspace to match how you work.
        </p>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden shadow-sm">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <CardContent
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 pt-2",
              FORM_CARD_CONTENT_BEFORE_FOOTER,
            )}
          >
            <CardTitle className="sr-only">Profile basics</CardTitle>
            <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.full_name)}
                  {...register("full_name")}
                />
                {errors.full_name ? (
                  <p className="text-xs text-destructive">
                    {errors.full_name.message}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="company_name">Company name</Label>
                <Input
                  id="company_name"
                  placeholder="Studio name or sole trader"
                  autoComplete="organization"
                  aria-invalid={Boolean(errors.company_name)}
                  {...register("company_name")}
                />
                {errors.company_name ? (
                  <p className="text-xs text-destructive">
                    {errors.company_name.message}
                  </p>
                ) : null}
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-2 text-sm font-medium leading-none">
                <input
                  type="checkbox"
                  checked={vatRegistered}
                  onChange={(ev) => {
                    const checked = ev.target.checked;
                    setValue("vat_registered", checked, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    if (!checked) setValue("vat_number", "");
                  }}
                  className="size-4 rounded border border-input"
                />
                VAT registered
              </label>
              <div className="flex flex-col gap-2">
                <Label htmlFor="vat_number">VAT number</Label>
                <Input
                  id="vat_number"
                  type="text"
                  autoComplete="off"
                  disabled={!vatRegistered}
                  aria-invalid={Boolean(errors.vat_number)}
                  {...register("vat_number")}
                  className={cn(!vatRegistered && "text-muted-foreground")}
                />
                {errors.vat_number ? (
                  <p className="text-xs text-destructive">
                    {errors.vat_number.message}
                  </p>
                ) : null}
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="address_line1">Address line 1</Label>
                <Input
                  id="address_line1"
                  autoComplete="address-line1"
                  aria-invalid={Boolean(errors.address_line1)}
                  {...register("address_line1")}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="address_line2">Address line 2</Label>
                <Input
                  id="address_line2"
                  autoComplete="address-line2"
                  {...register("address_line2")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="address_city">City</Label>
                <Input
                  id="address_city"
                  autoComplete="address-level2"
                  {...register("address_city")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="address_region">Region / state</Label>
                <Input
                  id="address_region"
                  autoComplete="address-level1"
                  {...register("address_region")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="address_postal_code">Postal code</Label>
                <Input
                  id="address_postal_code"
                  autoComplete="postal-code"
                  {...register("address_postal_code")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="address_country">Country</Label>
                <CountryCombobox
                  id="address_country"
                  value={addressCountry}
                  onChange={(code) =>
                    setValue("address_country", code, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  aria-invalid={Boolean(errors.address_country)}
                />
                {errors.address_country ? (
                  <p className="text-xs text-destructive">
                    {errors.address_country.message}
                  </p>
                ) : null}
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label htmlFor="default_currency">Default currency</Label>
              <Select
                value={defaultCurrency ?? "USD"}
                onValueChange={(val) => {
                  if (val !== null) {
                    setValue("default_currency", val, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                }}
              >
                <SelectTrigger id="default_currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "USD",
                      "EUR",
                      "GBP",
                      "AED",
                      "SAR",
                      "QAR",
                      "KWD",
                      "BHD",
                      "OMR",
                      "EGP",
                      "CAD",
                      "AUD",
                      "INR",
                    ] as const
                  ).map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Used for invoices when no client currency is set.
              </p>
            </div>

            {serverResult && !serverResult.ok ? (
              <Alert variant="destructive">
                <AlertTitle>Could not save profile</AlertTitle>
                <AlertDescription>{serverResult.message}</AlertDescription>
              </Alert>
            ) : null}
            </div>
          </CardContent>

          <CardFooter className={FORM_CARD_FOOTER_ONBOARDING_SPLIT}>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-muted-foreground inline-flex",
              )}
            >
              ← Back
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                "Saving…"
              ) : (
                <>
                  Continue
                  <ArrowRightIcon data-icon="inline-end" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
