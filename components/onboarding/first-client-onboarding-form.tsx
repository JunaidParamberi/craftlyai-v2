"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { ArrowRightIcon } from "lucide-react";

import { completeOnboarding } from "@/lib/onboarding/actions";
import { createClient } from "@/lib/clients/actions";
import { CLIENT_LIMITS } from "@/lib/validations/client";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export type FirstClientFormValues = {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  currency: string;
  notes: string;
};

const defaults: FirstClientFormValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  currency: "",
  notes: "",
};

export function FirstClientOnboardingForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<FirstClientFormValues>({
    defaultValues: defaults,
  });

  function skipToDashboard() {
    setServerError(null);
    clearErrors();
    startTransition(async () => {
      const result = await completeOnboarding();
      if (!result.ok) {
        setServerError(result.message);
        return;
      }
      router.refresh();
      router.push("/dashboard");
    });
  }

  function onSaveAndFinish(values: FirstClientFormValues) {
    setServerError(null);
    clearErrors();
    startTransition(async () => {
      const created = await createClient(values);
      if (!created.ok) {
        setServerError(created.message);
        if (created.fieldErrors) {
          (
            Object.entries(created.fieldErrors) as [
              keyof FirstClientFormValues,
              string[] | undefined,
            ][]
          ).forEach(([key, msgs]) => {
            const msg = msgs?.[0];
            if (msg && key in defaults) {
              setError(key, { message: msg });
            }
          });
        }
        return;
      }

      const done = await completeOnboarding();
      if (!done.ok) {
        setServerError(done.message);
        return;
      }

      reset(defaults);
      router.refresh();
      router.push("/dashboard");
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-8">
      <div className="flex shrink-0 flex-col gap-2 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Add your first client
        </h1>
        <p className="text-sm text-muted-foreground">
          Add someone you bill or work with—everything here stays private to your
          workspace. You can skip and add clients later from the dashboard.
        </p>
      </div>

      <Card
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
          /* Cap height so the body becomes a real scroll region (flex alone often won’t). */
          "max-h-[min(78vh,calc(100dvh-13rem))] sm:max-h-[calc(100svh-15rem)]",
          /* Light mode: default ring is too faint on bg-card; explicit border + ring. */
          "border border-border shadow-sm ring-1 ring-border dark:ring-border",
        )}
      >
        <form
          className="grid h-full min-h-0 min-w-0 flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden"
          onSubmit={handleSubmit(onSaveAndFinish)}
          noValidate
        >
          <CardContent
            className={cn(
              "relative z-0 min-h-0 overflow-y-auto overscroll-y-contain px-6 pt-2 touch-pan-y [-webkit-overflow-scrolling:touch] [scrollbar-gutter:stable]",
              FORM_CARD_CONTENT_BEFORE_FOOTER,
            )}
          >
            <CardTitle className="sr-only">First client</CardTitle>
            <div className="flex flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="client_name">
                    Client name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="client_name"
                    autoComplete="organization"
                    maxLength={CLIENT_LIMITS.name}
                    aria-invalid={Boolean(errors.name)}
                    {...register("name", { required: "Name is required." })}
                  />
                  {errors.name ? (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="client_email">Email</Label>
                  <Input
                    id="client_email"
                    type="email"
                    autoComplete="email"
                    maxLength={CLIENT_LIMITS.email}
                    placeholder="name@company.com"
                    aria-invalid={Boolean(errors.email)}
                    {...register("email")}
                  />
                  {errors.email ? (
                    <p className="text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="client_phone">Phone</Label>
                  <Input
                    id="client_phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={CLIENT_LIMITS.phone}
                    aria-invalid={Boolean(errors.phone)}
                    {...register("phone")}
                  />
                  {errors.phone ? (
                    <p className="text-xs text-destructive">
                      {errors.phone.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Label htmlFor="client_company">Company</Label>
                <Input
                  id="client_company"
                  autoComplete="organization"
                  maxLength={CLIENT_LIMITS.company}
                  aria-invalid={Boolean(errors.company)}
                  {...register("company")}
                />
                {errors.company ? (
                  <p className="text-xs text-destructive">
                    {errors.company.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="client_address">Address</Label>
                <Textarea
                  id="client_address"
                  rows={3}
                  maxLength={CLIENT_LIMITS.address}
                  placeholder="Street, city, region…"
                  aria-invalid={Boolean(errors.address)}
                  {...register("address")}
                />
                {errors.address ? (
                  <p className="text-xs text-destructive">
                    {errors.address.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="client_currency">Currency (ISO 4217)</Label>
                  <Input
                    id="client_currency"
                    autoComplete="off"
                    placeholder="USD"
                    maxLength={3}
                    aria-invalid={Boolean(errors.currency)}
                    {...register("currency", {
                      onChange: (e) => {
                        e.target.value = e.target.value.toUpperCase().slice(0, 3);
                      },
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional. Three letters, e.g. USD, EUR, AED.
                  </p>
                  {errors.currency ? (
                    <p className="text-xs text-destructive">
                      {errors.currency.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="client_notes">Notes</Label>
                <Textarea
                  id="client_notes"
                  rows={4}
                  maxLength={CLIENT_LIMITS.notes}
                  placeholder="Contract terms, preferences…"
                  aria-invalid={Boolean(errors.notes)}
                  {...register("notes")}
                />
                {errors.notes ? (
                  <p className="text-xs text-destructive">
                    {errors.notes.message}
                  </p>
                ) : null}
              </div>

              {serverError ? (
                <Alert variant="destructive">
                  <AlertTitle>Could not finish setup</AlertTitle>
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              ) : null}
            </div>
          </CardContent>

          <CardFooter className={FORM_CARD_FOOTER_ONBOARDING_SPLIT}>
            <Link
              href="/onboarding/brand"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-muted-foreground inline-flex",
              )}
            >
              ← Back
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={skipToDashboard}
              >
                Skip to dashboard
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  "Saving…"
                ) : (
                  <>
                    Add client and finish
                    <ArrowRightIcon data-icon="inline-end" />
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
