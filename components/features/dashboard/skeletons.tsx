import { FormPageShell } from "@/components/shared/form-page-shell";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonRepeat } from "@/components/shared/skeleton-repeat";

export type DashboardPageSkeletonProps = {
  statCardCount?: number;
  activityRowCount?: number;
};

/** Mirrors dashboard home: hero band, stat row, activity + AI column. */
export function DashboardPageSkeleton({
  statCardCount = 3,
  activityRowCount = 2,
}: DashboardPageSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading dashboard"
      className="flex flex-col gap-6"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-muted/40 via-background to-background px-5 py-8 md:px-8 md:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -end-24 -top-24 size-72 rounded-full bg-primary/[0.06] blur-3xl"
        />
        <div className="relative flex flex-col gap-3">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-9 w-full max-w-md md:h-10" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonRepeat
          count={statCardCount}
          render={(i) => (
            <Card key={i} size="sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-6 w-32 max-w-full rounded-full" />
              </CardContent>
            </Card>
          )}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" size="sm">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
            <Skeleton className="h-8 w-20 shrink-0" />
          </CardHeader>
          <CardContent className="flex flex-col gap-0 pt-6">
            <SkeletonRepeat
              count={activityRowCount}
              render={(row) => (
                <div key={row}>
                  {row > 0 ? <Separator className="my-0" /> : null}
                  <div className="flex gap-3 py-3">
                    <Skeleton className="size-9 shrink-0 rounded-2xl" />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <Skeleton className="h-4 w-full max-w-md" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card
          size="sm"
          className="border-primary/15 bg-gradient-to-b from-card to-muted/30"
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="size-9 shrink-0 rounded-2xl" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full max-w-[220px]" />
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-stretch gap-2 pt-0">
            <Skeleton className="h-9 w-full" />
          </CardFooter>
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
