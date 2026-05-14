"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createProject, updateProject } from "@/lib/projects/actions";
import {
  PROJECT_LIMITS,
  type ProjectCreateFormInput,
} from "@/lib/validations/project";
import {
  FORM_CARD_CONTENT_BEFORE_FOOTER,
  FORM_CARD_FOOTER_END_ACTIONS,
} from "@/lib/ui/form-card";
import { cn } from "@/lib/utils";
import { projectStatusLabel } from "@/lib/projects/display";
import type { ClientRow, ProjectStatus } from "@/types";

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FormDatePicker } from "@/components/shared/form-date-picker";

const STATUS_VALUES: ProjectStatus[] = [
  "planning",
  "active",
  "on_hold",
  "completed",
  "archived",
];

function emptyDefaults(clients: ClientRow[]): ProjectCreateFormInput {
  return {
    client_id: clients[0]?.id ?? "",
    title: "",
    status: "planning",
    budget: "",
    spent: "",
    start_date: "",
    deadline: "",
  };
}

type ProjectFormProps =
  | {
      mode: "create";
      clients: ClientRow[];
      defaultValues?: ProjectCreateFormInput;
    }
  | {
      mode: "edit";
      projectId: string;
      clients: ClientRow[];
      defaultValues: ProjectCreateFormInput;
    };

export function ProjectForm(props: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const defaults =
    props.mode === "create"
      ? (props.defaultValues ?? emptyDefaults(props.clients))
      : props.defaultValues;

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ProjectCreateFormInput>({
    defaultValues: defaults,
  });

  function onSubmit(values: ProjectCreateFormInput) {
    setServerError(null);
    clearErrors();
    startTransition(async () => {
      if (props.mode === "create") {
        const created = await createProject(values);
        if (!created.ok) {
          setServerError(created.message);
          if (created.fieldErrors) {
            (
              Object.entries(created.fieldErrors) as [
                keyof ProjectCreateFormInput,
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
        toast.success("Project created");
        router.push(`/projects/${created.project.id}`);
        router.refresh();
        return;
      }

      const updated = await updateProject(props.projectId, values);
      if (!updated.ok) {
        setServerError(updated.message);
        if (updated.fieldErrors) {
          (
            Object.entries(updated.fieldErrors) as [
              keyof ProjectCreateFormInput,
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

      toast.success("Project updated");
      router.push(`/projects/${props.projectId}`);
      router.refresh();
    });
  }

  if (props.clients.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Add a client first</CardTitle>
          <p className="text-muted-foreground text-sm">
            Projects must be linked to someone in your CRM.
          </p>
        </CardHeader>
        <CardContent>
          <Button nativeButton={false} render={<Link href="/clients/new" />}>
            New client
          </Button>
        </CardContent>
      </Card>
    );
  }

  const cancelHref =
    props.mode === "create" ? "/projects" : `/projects/${props.projectId}`;

  return (
    <Card
      className={cn(
        "border border-border shadow-sm ring-1 ring-border dark:ring-border",
      )}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg">
            {props.mode === "create" ? "Project details" : "Edit project"}
          </CardTitle>
        </CardHeader>
        <CardContent
          className={cn("flex flex-col gap-6 pt-2", FORM_CARD_CONTENT_BEFORE_FOOTER)}
        >
          {serverError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not save</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="project_client">
              Client <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="client_id"
              control={control}
              rules={{ required: "Client is required." }}
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={(v) => {
                    field.onChange(v ?? "");
                  }}
                >
                  <SelectTrigger
                    id="project_client"
                    className="w-full min-w-0"
                    size="default"
                    aria-invalid={Boolean(errors.client_id)}
                  >
                    <SelectValue placeholder="Select client">
                      {field.value
                        ? (props.clients.find((c) => c.id === field.value)
                            ?.name ?? "Unknown client")
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {props.clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.client_id ? (
              <p className="text-xs text-destructive">
                {errors.client_id.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project_title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="project_title"
              maxLength={PROJECT_LIMITS.title}
              aria-invalid={Boolean(errors.title)}
              {...register("title", { required: "Title is required." })}
            />
            {errors.title ? (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project_status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    if (v) {
                      field.onChange(v as ProjectStatus);
                    }
                  }}
                >
                  <SelectTrigger
                    id="project_status"
                    className="w-full min-w-0"
                    size="default"
                  >
                    <SelectValue placeholder="Select status">
                      {field.value ? projectStatusLabel(field.value) : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {STATUS_VALUES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {projectStatusLabel(s)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="project_budget">Budget</Label>
              <Input
                id="project_budget"
                type="text"
                inputMode="decimal"
                placeholder="0"
                aria-invalid={Boolean(errors.budget)}
                {...register("budget")}
              />
              {errors.budget ? (
                <p className="text-xs text-destructive">
                  {errors.budget.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="project_spent">Spent</Label>
              <Input
                id="project_spent"
                type="text"
                inputMode="decimal"
                placeholder="0"
                aria-invalid={Boolean(errors.spent)}
                {...register("spent")}
              />
              {errors.spent ? (
                <p className="text-xs text-destructive">
                  {errors.spent.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="project_start">Start date</Label>
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <FormDatePicker
                    id="project_start"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Start date"
                    aria-invalid={Boolean(errors.start_date)}
                  />
                )}
              />
              {errors.start_date ? (
                <p className="text-xs text-destructive">
                  {errors.start_date.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="project_deadline">Deadline</Label>
              <Controller
                name="deadline"
                control={control}
                render={({ field }) => (
                  <FormDatePicker
                    id="project_deadline"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Deadline"
                    aria-invalid={Boolean(errors.deadline)}
                  />
                )}
              />
              {errors.deadline ? (
                <p className="text-xs text-destructive">
                  {errors.deadline.message}
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
        <CardFooter className={FORM_CARD_FOOTER_END_ACTIONS}>
          <Link href={cancelHref} className={cn(buttonVariants({ variant: "outline" }))}>
            Cancel
          </Link>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving…"
              : props.mode === "create"
                ? "Create project"
                : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
