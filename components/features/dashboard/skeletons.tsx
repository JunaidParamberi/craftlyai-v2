import { FormPageShell } from "@/components/shared/form-page-shell";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonRepeat } from "@/components/shared/skeleton-repeat";

export type DashboardPageSkeletonProps = {
  statCardCount?: number;
  activityRowCount?: number;
  showAttentionBanner?: boolean;
};

/** Mirrors dashboard home exactly — flat page header, KPI grid, attention slot, activity + pipeline. */
export function DashboardPageSkeleton({
  statCardCount = 4,
  activityRowCount = 3,
  showAttentionBanner = true,
}: DashboardPageSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading dashboard"
      className="flex flex-col gap-6"
    >
      {/* Flat page header */}
      <div className="flex flex-col gap-1">
        <Skeleton className="h-[10px] w-16 rounded-[3px]" />
        <Skeleton className="h-7 w-48 rounded-[4px] md:h-8" />
      </div>

      {/* KPI cards — same grid as DashboardKpiCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SkeletonRepeat
          count={statCardCount}
          render={(i) => (
            <Card key={i} size="sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-[10px] w-24 rounded-[3px]" />
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-0">
                <Skeleton className="h-7 w-28 rounded-[4px]" />
                <Skeleton className="h-5 w-20 rounded-[4px]" />
              </CardContent>
            </Card>
          )}
        />
      </div>

      {showAttentionBanner ? (
        <Skeleton className="h-14 w-full rounded-[10px]" />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3" size="sm">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-[14px] w-32 rounded-[3px]" />
              <Skeleton className="h-[11px] w-52 rounded-[3px]" />
            </div>
            <Skeleton className="h-8 w-20 shrink-0 rounded-md" />
          </CardHeader>
          <CardContent className="flex flex-col gap-0 pt-6">
            <SkeletonRepeat
              count={activityRowCount}
              render={(row) => (
                <div key={row}>
                  {row > 0 ? <Separator className="my-0" /> : null}
                  <div className="flex gap-3 py-3">
                    <Skeleton className="size-9 shrink-0 rounded-full" />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <Skeleton className="h-[14px] w-full max-w-xs rounded-[3px]" />
                      <Skeleton className="h-[10px] w-20 rounded-[3px]" />
                    </div>
                  </div>
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2" size="sm">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-[14px] w-28 rounded-[3px]" />
              <Skeleton className="h-[11px] w-44 rounded-[3px]" />
            </div>
            <Skeleton className="h-8 w-20 shrink-0 rounded-md" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-6">
            <SkeletonRepeat
              count={3}
              render={(i) => (
                <Skeleton key={i} className="h-[4.5rem] w-full rounded-[12px]" />
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** Matches generic placeholder pages (Projects, Settings, …); full-width, left-aligned like SectionPlaceholder. */
export function ProtectedPlaceholderSkeleton() {
  return (
    <FormPageShell maxWidth="full">
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading"
        className="flex flex-col gap-3"
      >
        <Skeleton className="h-8 w-44 max-w-[85%] rounded-lg md:h-9 md:w-52" />
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
    </FormPageShell>
  );
}
