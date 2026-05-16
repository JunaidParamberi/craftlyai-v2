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
        <div className="flex flex-col gap-1">
          <Skeleton className="h-8 w-40 rounded-[4px] md:h-9 md:w-44" />
          <Skeleton className="h-4 w-full max-w-lg rounded-[3px]" />
        </div>
        <Skeleton className="h-9 w-[9.5rem] shrink-0 rounded-md" />
      </div>
      <Card className="overflow-hidden border border-border shadow-sm ring-1 ring-border/50">
        <CardHeader className="flex flex-col gap-4 border-b border-border/80 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-9 w-full max-w-md rounded-md" />
            <Skeleton className="h-9 w-full rounded-md sm:w-28" />
          </div>
          <div className="flex flex-wrap gap-2">
            <SkeletonRepeat
              count={statusChipCount}
              render={(i) => (
                <Skeleton key={i} className="h-8 w-28 rounded-full" />
              )}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table header */}
          <div className="flex items-center gap-4 border-b border-border py-3 ps-4 pe-4 sm:ps-6 sm:pe-6">
            <Skeleton className="h-3 w-20 flex-1 max-w-[120px] rounded-[3px]" />
            <Skeleton className="hidden h-3 w-14 rounded-[3px] md:block" />
            <Skeleton className="h-3 w-14 rounded-[3px]" />
            <Skeleton className="hidden h-3 w-16 rounded-[3px] sm:block" />
            <div className="w-12" />
          </div>
          {/* Table rows */}
          <SkeletonRepeat
            count={rowCount}
            render={(i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-border py-4 ps-4 pe-4 last:border-0 sm:ps-6 sm:pe-6"
              >
                <Skeleton className="h-4 min-w-0 flex-1 max-w-[220px] rounded-[3px]" />
                <Skeleton className="hidden h-4 w-28 rounded-[3px] md:block" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="hidden h-4 w-24 rounded-[3px] sm:block" />
                <div className="flex w-12 justify-end">
                  <Skeleton className="size-8 rounded-full" />
                </div>
              </div>
            )}
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t border-border/80 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-52 rounded-[3px]" />
          <div className="flex gap-2">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </CardFooter>
      </Card>
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
