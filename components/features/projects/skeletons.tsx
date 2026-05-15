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
import { SkeletonRepeat } from "@/components/shared/skeleton-repeat";

export type ProjectsPageSkeletonProps = {
  rowCount?: number;
  statusChipCount?: number;
};

export function ProjectsPageSkeleton({
  rowCount = 0,
  statusChipCount = 4,
}: ProjectsPageSkeletonProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-40 md:h-10 md:w-44" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <Skeleton className="h-9 w-[9.5rem] shrink-0" />
      </div>
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm ring-1 ring-border/50">
        <div className="flex flex-col gap-4 border-b border-border/80 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-9 w-full max-w-md" />
            <Skeleton className="h-9 w-full sm:w-28" />
          </div>
          <div className="flex flex-wrap gap-2">
            <SkeletonRepeat
              count={statusChipCount}
              render={(i) => (
                <Skeleton key={i} className="h-8 w-28 rounded-full" />
              )}
            />
          </div>
        </div>
        <div className="px-4 py-3 sm:px-6">
          <div className="flex gap-4 border-b border-border py-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="hidden h-4 w-16 md:block" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="hidden h-4 w-20 sm:block" />
            <Skeleton className="ms-auto h-4 w-8" />
          </div>
          <SkeletonRepeat
            count={rowCount}
            render={(i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-border py-4 last:border-0"
              >
                <Skeleton className="h-5 min-w-0 flex-1 max-w-[220px]" />
                <Skeleton className="hidden h-4 w-28 md:block" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="hidden h-4 w-24 sm:block" />
                <Skeleton className="size-8 shrink-0 rounded-full" />
              </div>
            )}
          />
        </div>
        <div className="flex flex-col gap-3 border-t border-border/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-52" />
          <div className="flex gap-2">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectFormCardSkeleton() {
  return (
    <Card className="border border-border shadow-sm ring-1 ring-border dark:ring-border">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent
        className={cn("flex flex-col gap-6 pt-2", FORM_CARD_CONTENT_BEFORE_FOOTER)}
      >
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </CardContent>
      <CardFooter className={FORM_CARD_FOOTER_END_ACTIONS}>
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-32" />
      </CardFooter>
    </Card>
  );
}

export function ProjectNewPageSkeleton() {
  return (
    <FormPageShell maxWidth="2xl">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-9 w-48 md:h-10 md:w-52" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <ProjectFormCardSkeleton />
      </div>
    </FormPageShell>
  );
}

export function ProjectEditPageSkeleton() {
  return <ProjectNewPageSkeleton />;
}

export function ProjectDetailPageSkeleton() {
  return (
    <FormPageShell maxWidth="7xl">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="size-4 rounded-sm" />
          <Skeleton className="h-4 w-48 max-w-[60%]" />
        </div>
        <Card className="overflow-hidden border-border/80 shadow-sm">
          <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <Skeleton className="h-9 w-full max-w-xl" />
                <Skeleton className="h-4 w-full max-w-2xl" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap gap-4 border-b border-transparent pb-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-14" />
                <Skeleton className="h-8 w-28" />
              </div>
              <div className="grid gap-8 lg:grid-cols-[1fr_minmax(260px,300px)]">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between gap-2">
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-36" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                  {Array.from({ length: 3 }, (_, i) => (
                    <Skeleton key={i} className="min-h-[88px] w-full rounded-2xl" />
                  ))}
                </div>
                <div className="flex flex-col gap-6">
                  <Skeleton className="min-h-[180px] w-full" />
                  <Skeleton className="min-h-[160px] w-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FormPageShell>
  );
}
