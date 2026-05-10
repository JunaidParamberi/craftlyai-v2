import { FormPageShell } from "@/components/shared/form-page-shell";
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
      <ul className="flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i}>
            <div className="block rounded-2xl ring-1 ring-border">
              <Card className="border-0 shadow-none ring-0">
                <CardContent className="flex items-center gap-4 py-4">
                  <Skeleton className="size-10 shrink-0 rounded-xl" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Skeleton className="h-5 max-w-[240px]" />
                    <Skeleton className="h-4 max-w-[320px]" />
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="size-4 rounded" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ClientFormCardSkeleton() {
  return (
    <Card className="border border-border shadow-sm ring-1 ring-border dark:ring-border">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full rounded-4xl" />
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
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full rounded-4xl" />
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
      <CardFooter className="flex flex-wrap justify-end gap-2 border-t border-border pt-6">
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
    <FormPageShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-3">
            <Skeleton className="h-8 w-28 rounded-md" />
            <div className="flex min-w-0 flex-col gap-2">
              <Skeleton className="h-9 w-full max-w-md" />
              <Skeleton className="h-4 w-48 max-w-full" />
            </div>
          </div>
          <Skeleton className="h-9 w-36 shrink-0 rounded-4xl" />
        </div>
        <ClientFormCardSkeleton />
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
