"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { createClient, updateClient } from "@/lib/clients/actions";
import {
  CLIENT_LIMITS,
  type ClientCreateFormInput,
} from "@/lib/validations/client";
import { cn } from "@/lib/utils";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const emptyDefaults: ClientCreateFormInput = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  currency: "",
  notes: "",
};

type ClientFormProps =
  | {
      mode: "create";
      defaultValues?: ClientCreateFormInput;
    }
  | {
      mode: "edit";
      clientId: string;
      defaultValues: ClientCreateFormInput;
    };

export function ClientForm(props: ClientFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const defaults =
    props.mode === "create"
      ? (props.defaultValues ?? emptyDefaults)
      : props.defaultValues;

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ClientCreateFormInput>({
    defaultValues: defaults,
  });

  function onSubmit(values: ClientCreateFormInput) {
    setServerError(null);
    clearErrors();
    startTransition(async () => {
      if (props.mode === "create") {
        const created = await createClient(values);
        if (!created.ok) {
          setServerError(created.message);
          if (created.fieldErrors) {
            (
              Object.entries(created.fieldErrors) as [
                keyof ClientCreateFormInput,
                string[] | undefined,
              ][]
            ).forEach(([key, msgs]) => {
              const msg = msgs?.[0];
              if (msg) {
                setError(key, { message: msg });
              }
            });
          }
          return;
        }
        router.push(`/protected/clients/${created.client.id}`);
        router.refresh();
        return;
      }

      const updated = await updateClient(props.clientId, values);
      if (!updated.ok) {
        setServerError(updated.message);
        if (updated.fieldErrors) {
          (
            Object.entries(updated.fieldErrors) as [
              keyof ClientCreateFormInput,
              string[] | undefined,
            ][]
          ).forEach(([key, msgs]) => {
            const msg = msgs?.[0];
            if (msg) {
              setError(key, { message: msg });
            }
          });
        }
        return;
      }

      router.push(`/protected/clients/${props.clientId}`);
      router.refresh();
    });
  }

  return (
    <Card
      className={cn(
        "border border-border shadow-sm ring-1 ring-border dark:ring-border",
      )}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg">
            {props.mode === "create" ? "Client details" : "Edit client"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 pt-2">
          {serverError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not save</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="crm_client_name">
                Client name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="crm_client_name"
                autoComplete="organization"
                maxLength={CLIENT_LIMITS.name}
                aria-invalid={Boolean(errors.name)}
                {...register("name", { required: "Name is required." })}
              />
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="crm_client_email">Email</Label>
              <Input
                id="crm_client_email"
                type="email"
                autoComplete="email"
                maxLength={CLIENT_LIMITS.email}
                placeholder="name@company.com"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="crm_client_phone">Phone</Label>
              <Input
                id="crm_client_phone"
                type="tel"
                autoComplete="tel"
                maxLength={CLIENT_LIMITS.phone}
                aria-invalid={Boolean(errors.phone)}
                {...register("phone")}
              />
              {errors.phone ? (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              ) : null}
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Label htmlFor="crm_client_company">Company</Label>
            <Input
              id="crm_client_company"
              autoComplete="organization"
              maxLength={CLIENT_LIMITS.company}
              aria-invalid={Boolean(errors.company)}
              {...register("company")}
            />
            {errors.company ? (
              <p className="text-xs text-destructive">{errors.company.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="crm_client_address">Address</Label>
            <Textarea
              id="crm_client_address"
              rows={3}
              maxLength={CLIENT_LIMITS.address}
              placeholder="Street, city, region…"
              aria-invalid={Boolean(errors.address)}
              {...register("address")}
            />
            {errors.address ? (
              <p className="text-xs text-destructive">{errors.address.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="crm_client_currency">Currency (ISO 4217)</Label>
              <Input
                id="crm_client_currency"
                autoComplete="off"
                maxLength={3}
                placeholder="USD"
                aria-invalid={Boolean(errors.currency)}
                {...register("currency")}
              />
              {errors.currency ? (
                <p className="text-xs text-destructive">
                  {errors.currency.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="crm_client_notes">Notes</Label>
            <Textarea
              id="crm_client_notes"
              rows={4}
              maxLength={CLIENT_LIMITS.notes}
              aria-invalid={Boolean(errors.notes)}
              {...register("notes")}
            />
            {errors.notes ? (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end gap-2 border-t border-border pt-6">
          <Link
            href="/protected/clients"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving…"
              : props.mode === "create"
                ? "Create client"
                : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
