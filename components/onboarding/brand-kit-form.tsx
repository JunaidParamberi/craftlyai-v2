"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, ImageIcon } from "lucide-react";

import { skipBrandOnboarding } from "@/lib/onboarding/actions";
import { saveBrandKit } from "@/lib/brand-kit/actions";
import {
  brandKitFormSchema,
  type BrandKitFormValues,
} from "@/lib/validations/brand-kit";
import type { BrandKitRow } from "@/types";
import { cn } from "@/lib/utils";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const FONT_OPTIONS = [
  "Inter",
  "Hanken Grotesk",
  "DM Sans",
  "IBM Plex Sans",
  "Source Serif 4",
  "Playfair Display",
  "Geist",
  "JetBrains Mono",
] as const;

type Props = {
  initialBrandKit: BrandKitRow | null;
  /** Default `/onboarding/client`. Pass `false` to only `router.refresh()` (protected test harness). */
  redirectAfterSave?: string | false;
  backHref?: string;
  backLabel?: string;
  submitLabel?: string;
  variant?: "default" | "onboarding";
};

export function BrandKitForm({
  initialBrandKit,
  redirectAfterSave,
  backHref: backHrefProp,
  backLabel: backLabelProp,
  submitLabel: submitLabelProp,
  variant = "default",
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined> | undefined
  >();
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  const backHref =
    backHrefProp ??
    (variant === "onboarding" ? "/onboarding/profile" : "/profile-test");
  const backLabel =
    backLabelProp ?? (variant === "onboarding" ? "← Back" : "Back to profile");
  const submitLabel =
    submitLabelProp ?? (variant === "onboarding" ? "Continue" : "Save and continue");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BrandKitFormValues>({
    resolver: zodResolver(brandKitFormSchema),
    defaultValues: {
      primary_color: initialBrandKit?.primary_color ?? "#0a0a0a",
      secondary_color: initialBrandKit?.secondary_color ?? "#fafafa",
      font: initialBrandKit?.font ?? "Inter",
      email_signature: initialBrandKit?.email_signature ?? "",
    },
  });

  const primaryColor = watch("primary_color");
  const secondaryColor = watch("secondary_color");
  const font = watch("font");

  const previewLogoSrc =
    logoPreviewUrl ?? initialBrandKit?.logo_url ?? null;

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setLogoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function onSubmit(values: BrandKitFormValues) {
    setLastError(null);
    setFieldErrors(undefined);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("primary_color", values.primary_color);
      fd.append("secondary_color", values.secondary_color);
      fd.append("font", values.font);
      fd.append("email_signature", values.email_signature);
      const file = logoInputRef.current?.files?.[0];
      if (file) {
        fd.append("logo", file);
      }

      const result = await saveBrandKit(fd);
      if (!result.ok) {
        setLastError(result.message);
        setFieldErrors(result.fieldErrors);
        return;
      }
      if (logoInputRef.current) logoInputRef.current.value = "";
      router.refresh();
      const next =
        redirectAfterSave === false
          ? null
          : typeof redirectAfterSave === "string"
            ? redirectAfterSave
            : "/onboarding/client";
      if (next) {
        router.push(next);
      }
    });
  }

  function handleSkip() {
    setLastError(null);
    startTransition(async () => {
      const result = await skipBrandOnboarding();
      if (!result.ok) {
        setLastError(result.message);
        return;
      }
      router.refresh();
      router.push("/onboarding/client");
    });
  }

  const logoDropzone = (
    <div className="flex flex-col gap-2">
      <Label htmlFor="logo">Workspace logo</Label>
      <button
        type="button"
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 transition-colors hover:bg-muted/50",
          variant === "onboarding" && "py-12",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const file = e.dataTransfer.files?.[0];
          if (file && logoInputRef.current) {
            const dt = new DataTransfer();
            dt.items.add(file);
            logoInputRef.current.files = dt.files;
            handleLogoChange({
              target: logoInputRef.current,
            } as React.ChangeEvent<HTMLInputElement>);
          }
        }}
        onClick={() => logoInputRef.current?.click()}
      >
        <ImageIcon className="size-8 text-muted-foreground" aria-hidden />
        <span className="text-sm font-medium text-foreground">
          Click to upload or drag and drop
        </span>
        <span className="text-xs text-muted-foreground">
          SVG, PNG, or JPG (max. 5MB)
        </span>
        <input
          ref={logoInputRef}
          id="logo"
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="sr-only"
          onChange={handleLogoChange}
        />
      </button>
      {initialBrandKit?.logo_url && !logoPreviewUrl ? (
        <p className="text-xs text-muted-foreground">
          Saving without a new file keeps your current logo.
        </p>
      ) : null}
    </div>
  );

  const colorFields = (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="primary_color">Primary color</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id="primary_color"
            type="text"
            autoComplete="off"
            className="min-w-0 flex-1 font-mono text-xs sm:text-sm"
            aria-invalid={Boolean(errors.primary_color)}
            {...register("primary_color")}
          />
          <input
            type="color"
            className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent"
            aria-label="Primary color picker"
            value={primaryColor}
            onChange={(e) =>
              setValue("primary_color", e.target.value, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
        </div>
        {errors.primary_color ? (
          <p className="text-xs text-destructive">{errors.primary_color.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="secondary_color">Secondary color</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id="secondary_color"
            type="text"
            autoComplete="off"
            className="min-w-0 flex-1 font-mono text-xs sm:text-sm"
            aria-invalid={Boolean(errors.secondary_color)}
            {...register("secondary_color")}
          />
          <input
            type="color"
            className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent"
            aria-label="Secondary color picker"
            value={secondaryColor}
            onChange={(e) =>
              setValue("secondary_color", e.target.value, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
        </div>
        {errors.secondary_color ? (
          <p className="text-xs text-destructive">{errors.secondary_color.message}</p>
        ) : null}
      </div>
    </div>
  );

  const fontField =
    variant === "onboarding" ? (
      <div className="flex flex-col gap-2">
        <Label htmlFor="font-select">Brand font (optional)</Label>
        <Select
          value={font}
          onValueChange={(v) => {
            if (v) setValue("font", v, { shouldValidate: true, shouldDirty: true });
          }}
        >
          <SelectTrigger id="font-select" className="w-full min-w-0" size="default">
            <SelectValue placeholder="Select a font" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {FONT_OPTIONS.map((f) => (
                <SelectItem key={f} value={f}>
                  <span className="font-medium">Aa</span> {f}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.font ? (
          <p className="text-xs text-destructive">{errors.font.message}</p>
        ) : null}
      </div>
    ) : (
      <div className="flex flex-col gap-2">
        <Label htmlFor="font">Font name</Label>
        <Input
          id="font"
          autoComplete="off"
          placeholder="Inter"
          aria-invalid={Boolean(errors.font)}
          {...register("font")}
        />
        {errors.font ? (
          <p className="text-xs text-destructive">{errors.font.message}</p>
        ) : null}
      </div>
    );

  const emailSignatureField =
    variant === "default" ? (
      <div className="flex flex-col gap-2">
        <Label htmlFor="email_signature">Email signature</Label>
        <textarea
          id="email_signature"
          rows={5}
          className={cn(
            "min-h-[120px] w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 dark:bg-input/30",
            errors.email_signature && "border-destructive",
          )}
          placeholder="Best regards, …"
          aria-invalid={Boolean(errors.email_signature)}
          {...register("email_signature")}
        />
        {errors.email_signature ? (
          <p className="text-xs text-destructive">{errors.email_signature.message}</p>
        ) : null}
      </div>
    ) : null;

  const previewSection =
    variant === "onboarding" ? (
      <div className="flex flex-col gap-2">
        <Label>Preview</Label>
        <Card className="overflow-hidden shadow-xs ring-1 ring-foreground/10">
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex gap-4">
              <div
                className="w-1.5 shrink-0 self-stretch rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                    {previewLogoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element -- blob + Supabase URLs
                      <img
                        src={previewLogoSrc}
                        alt=""
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="size-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 pt-1">
                    <div
                      className="h-2.5 max-w-[55%] rounded-full bg-muted"
                      style={{ fontFamily: font }}
                    />
                    <div className="h-2.5 max-w-[88%] rounded-full bg-muted/70" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <div
                    className="h-9 min-w-[7rem] rounded-md shadow-xs"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    ) : null;

  const errorBlock =
    lastError || (fieldErrors && Object.keys(fieldErrors).length > 0) ? (
      variant === "onboarding" ? (
        <Alert variant="destructive">
          <AlertTitle>Could not save brand kit</AlertTitle>
          <AlertDescription>
            <p>{lastError}</p>
            {fieldErrors ? (
              <ul className="mt-2 list-inside list-disc text-xs">
                {Object.entries(fieldErrors).map(([k, msgs]) =>
                  msgs?.length ? (
                    <li key={k}>
                      <span className="font-mono">{k}</span>: {msgs.join(", ")}
                    </li>
                  ) : null,
                )}
              </ul>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <p>{lastError}</p>
          {fieldErrors ? (
            <ul className="mt-1 list-inside list-disc text-xs">
              {Object.entries(fieldErrors).map(([k, msgs]) =>
                msgs?.length ? (
                  <li key={k}>
                    <span className="font-mono">{k}</span>: {msgs.join(", ")}
                  </li>
                ) : null,
              )}
            </ul>
          ) : null}
        </div>
      )
    ) : null;

  const onboardingFooter = (
    <CardFooter className="shrink-0 flex flex-wrap items-center justify-between gap-4 border-t border-border bg-card px-6 pt-6 pb-6">
      <Link
        href={backHref}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "text-muted-foreground inline-flex",
        )}
      >
        {backLabel}
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={handleSkip}
        >
          Skip
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            "Saving…"
          ) : (
            <>
              {submitLabel}
              <ArrowRightIcon data-icon="inline-end" />
            </>
          )}
        </Button>
      </div>
    </CardFooter>
  );

  const defaultFooter = (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : submitLabel}
      </Button>
      <Link
        href={backHref}
        className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
      >
        {backLabel}
      </Link>
    </div>
  );

  if (variant === "onboarding") {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-8">
        <div className="flex shrink-0 flex-col gap-2 text-center">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Brand identity
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload your logo and select your brand colors. We&apos;ll use these to
            customize your client portals and invoices.
          </p>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden shadow-sm">
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <CardContent className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 pt-2 pb-6">
              <CardTitle className="sr-only">Brand kit</CardTitle>
              <div className="flex flex-col gap-6">
                {initialBrandKit?.logo_url ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Current logo on file
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={initialBrandKit.logo_url}
                      alt="Current brand logo"
                      className="h-16 w-16 rounded-md border border-border bg-muted object-contain p-1"
                    />
                  </div>
                ) : null}

                {logoDropzone}
                <Separator />
                {colorFields}
                {fontField}
                {previewSection}
                {emailSignatureField}
                {errorBlock}
              </div>
            </CardContent>
            {onboardingFooter}
          </form>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {initialBrandKit?.logo_url ? (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Current logo
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={initialBrandKit.logo_url}
            alt="Brand logo"
            className="h-20 w-20 rounded-md border border-border bg-muted object-contain p-1"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="logo-flat">Logo</Label>
        <input
          ref={logoInputRef}
          id="logo-flat"
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="text-sm file:me-3 file:rounded-md file:border file:border-input file:bg-background file:px-2 file:py-1"
        />
        <p className="text-xs text-muted-foreground">
          PNG, JPEG, WebP, GIF, or SVG. Max 5 MB. Optional.
        </p>
      </div>

      {colorFields}
      {fontField}
      {emailSignatureField}
      {errorBlock}
      {defaultFooter}
    </form>
  );
}
