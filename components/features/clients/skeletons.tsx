import { FormPageShell } from "@/components/shared/form-page-shell";
import {
  FORM_CARD_CONTENT_BEFORE_FOOTER,
  FORM_CARD_FOOTER_END_ACTIONS,
} from "@/lib/ui/form-card";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ClientsPageSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-40 md:h-10 md:w-44" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <Skeleton className="h-9 w-[9.5rem] shrink-0 rounded-4xl" />
      </div>
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm ring-1 ring-border/50">
        <div className="flex flex-col gap-3 border-b border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-9 w-full max-w-sm rounded-4xl" />
          <Skeleton className="h-9 w-full rounded-4xl sm:w-28" />
        </div>
        <div className="px-4 py-3 sm:px-6">
          <div className="flex gap-4 border-b border-border py-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="hidden h-4 w-20 md:block" />
            <Skeleton className="hidden h-4 w-14 lg:block" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="ms-auto h-4 w-8" />
          </div>
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border py-4 last:border-0"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <Skeleton className="h-5 max-w-[200px]" />
              </div>
              <Skeleton className="hidden h-4 w-24 md:block" />
              <Skeleton className="hidden h-4 w-32 lg:block" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="size-8 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 border-t border-border/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientFormCardSkeleton() {
  return (
    <Card className="border border-border shadow-sm ring-1 ring-border dark:ring-border">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent
        className={cn("flex flex-col gap-6 pt-2", FORM_CARD_CONTENT_BEFORE_FOOTER)}
      >
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-40" />
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Skeleton className="h-10 flex-1 rounded-lg sm:max-w-[14rem]" />
            <Skeleton className="h-10 flex-1 rounded-lg sm:max-w-[14rem]" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-9 w-full rounded-4xl" />
            <Skeleton className="h-3 w-full max-w-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-full rounded-4xl" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-9 w-full rounded-4xl" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-9 w-full rounded-4xl" />
          <Skeleton className="h-3 w-full max-w-lg" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="min-h-[4.5rem] w-full rounded-2xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-9 w-full rounded-4xl" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="min-h-[6rem] w-full rounded-2xl" />
        </div>
      </CardContent>
      <CardFooter className={FORM_CARD_FOOTER_END_ACTIONS}>
        <Skeleton className="h-9 w-20 rounded-4xl" />
        <Skeleton className="h-9 w-28 rounded-4xl" />
      </CardFooter>
    </Card>
  );
}

export function ClientNewPageSkeleton() {
  return (
    <FormPageShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-9 w-48 md:h-10 md:w-52" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <ClientFormCardSkeleton />
      </div>
    </FormPageShell>
  );
}

export function ClientDetailPageSkeleton() {
  return (
    <FormPageShell maxWidth="7xl">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-4 w-32" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
              <Skeleton className="size-16 shrink-0 rounded-2xl" />
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-9 w-48 max-w-full" />
                  <Skeleton className="h-6 w-32 rounded-full" />
                </div>
                <Skeleton className="h-4 w-64 max-w-full" />
                <Skeleton className="h-4 w-full max-w-xl" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-28 rounded-4xl" />
              <Skeleton className="h-9 w-32 rounded-4xl" />
              <Skeleton className="h-9 w-24 rounded-4xl" />
              <Skeleton className="size-9 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-2 border-b border-border/60 pb-1">
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-36" />
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(260px,320px)]">
          <div className="flex flex-col gap-8">
            <Skeleton className="min-h-[200px] w-full rounded-4xl" />
            <Skeleton className="min-h-[120px] w-full rounded-4xl" />
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="min-h-[220px] w-full rounded-4xl" />
            <Skeleton className="min-h-[200px] w-full rounded-4xl" />
          </div>
        </div>
      </div>
    </FormPageShell>
  );
}

/** Matches clients-test layout (narrow column + panel). */
export function ClientsTestPageSkeleton() {
  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-56" />
      </header>
      <Card className="border border-border">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-9 w-full rounded-4xl" />
            <Skeleton className="h-9 w-full rounded-4xl" />
          </div>
          <Skeleton className="min-h-[120px] w-full rounded-2xl" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-24 rounded-4xl" />
            <Skeleton className="h-9 w-28 rounded-4xl" />
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-3 w-40" />
    </div>
  );
}
