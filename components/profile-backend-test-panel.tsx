"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile, type UpdateProfileResult } from "@/lib/profile/actions";
import type { ProfileRow } from "@/types";
import { cn } from "@/lib/utils";

function toInput(val: string | null): string {
  return val ?? "";
}

type Props = {
  initialProfile: ProfileRow | null;
};

export function ProfileBackendTestPanel({ initialProfile }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<UpdateProfileResult | null>(null);

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
    }),
    [initialProfile],
  );

  const [full_name, setFullName] = useState(defaults.full_name);
  const [company_name, setCompanyName] = useState(defaults.company_name);
  const [vat_registered, setVatRegistered] = useState(defaults.vat_registered);
  const [vat_number, setVatNumber] = useState(defaults.vat_number);
  const [address_line1, setAddressLine1] = useState(defaults.address_line1);
  const [address_line2, setAddressLine2] = useState(defaults.address_line2);
  const [address_city, setAddressCity] = useState(defaults.address_city);
  const [address_region, setAddressRegion] = useState(defaults.address_region);
  const [address_postal_code, setAddressPostalCode] = useState(defaults.address_postal_code);
  const [address_country, setAddressCountry] = useState(defaults.address_country);

  function emptyToNull(s: string): string | null {
    const t = s.trim();
    return t === "" ? null : t;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const patch = {
        full_name: emptyToNull(full_name),
        company_name: emptyToNull(company_name),
        vat_registered,
        vat_number: vat_registered ? emptyToNull(vat_number) : null,
        address_line1: emptyToNull(address_line1),
        address_line2: emptyToNull(address_line2),
        address_city: emptyToNull(address_city),
        address_region: emptyToNull(address_region),
        address_postal_code: emptyToNull(address_postal_code),
        address_country: emptyToNull(address_country),
      };

      const result = await updateProfile(patch);
      setLastResult(result);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={full_name}
              onChange={(ev) => setFullName(ev.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="company_name">Company name</Label>
            <Input
              id="company_name"
              name="company_name"
              value={company_name}
              onChange={(ev) => setCompanyName(ev.target.value)}
              autoComplete="organization"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={vat_registered}
              onChange={(ev) => {
                const checked = ev.target.checked;
                setVatRegistered(checked);
                if (!checked) setVatNumber("");
              }}
              className="size-4 rounded border border-input"
            />
            VAT registered
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="vat_number">VAT number</Label>
          <Input
            id="vat_number"
            name="vat_number"
            type="text"
            autoComplete="off"
            value={vat_number}
            onChange={(ev) => setVatNumber(ev.target.value)}
            aria-invalid={
              lastResult && !lastResult.ok && Boolean(lastResult.fieldErrors?.vat_number)
                ? true
                : undefined
            }
            className={cn(!vat_registered && "text-muted-foreground")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="address_line1">Address line 1</Label>
            <Input
              id="address_line1"
              name="address_line1"
              value={address_line1}
              onChange={(ev) => setAddressLine1(ev.target.value)}
              autoComplete="address-line1"
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="address_line2">Address line 2</Label>
            <Input
              id="address_line2"
              name="address_line2"
              value={address_line2}
              onChange={(ev) => setAddressLine2(ev.target.value)}
              autoComplete="address-line2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address_city">City</Label>
            <Input
              id="address_city"
              name="address_city"
              value={address_city}
              onChange={(ev) => setAddressCity(ev.target.value)}
              autoComplete="address-level2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address_region">Region / state</Label>
            <Input
              id="address_region"
              name="address_region"
              value={address_region}
              onChange={(ev) => setAddressRegion(ev.target.value)}
              autoComplete="address-level1"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address_postal_code">Postal code</Label>
            <Input
              id="address_postal_code"
              name="address_postal_code"
              value={address_postal_code}
              onChange={(ev) => setAddressPostalCode(ev.target.value)}
              autoComplete="postal-code"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address_country">Country (ISO-2)</Label>
            <Input
              id="address_country"
              name="address_country"
              value={address_country}
              onChange={(ev) => setAddressCountry(ev.target.value.toUpperCase())}
              maxLength={2}
              autoComplete="country"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save via updateProfile()"}
          </Button>
          <Link
            href="/protected"
            className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
          >
            Back to protected
          </Link>
        </div>
      </form>

      {lastResult && !lastResult.ok ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <p className="font-medium">{lastResult.message}</p>
          {lastResult.formErrors?.length ? (
            <ul className="mt-1 list-inside list-disc">
              {lastResult.formErrors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          ) : null}
          {lastResult.fieldErrors ? (
            <ul className="mt-2 list-inside list-disc text-xs">
              {Object.entries(lastResult.fieldErrors).map(([field, msgs]) =>
                msgs?.length ? (
                  <li key={field}>
                    <span className="font-mono">{field}</span>: {msgs.join(", ")}
                  </li>
                ) : null,
              )}
            </ul>
          ) : null}
        </div>
      ) : null}

      {lastResult ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Last server response</p>
          <pre
            className={cn(
              "max-h-80 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs",
              !lastResult.ok && "border-destructive/50",
            )}
          >
            {JSON.stringify(lastResult, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
