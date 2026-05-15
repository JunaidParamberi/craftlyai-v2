import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonRepeat } from "@/components/shared/skeleton-repeat";

const FINANCE_KPI_COUNT = 4;
const FINANCE_PRESET_COUNT = 3;

export type FinancePageSkeletonProps = {
  invoiceRowCount?: number;
  kpiCount?: number;
  presetCount?: number;
};

export function FinancePageSkeleton({
  invoiceRowCount = 0,
  kpiCount = FINANCE_KPI_COUNT,
  presetCount = FINANCE_PRESET_COUNT,
}: FinancePageSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading finance"
      className="flex flex-col gap-6"
    >
      <div className="relative shrink-0 rounded-3xl border border-border/60 bg-gradient-to-br from-muted/40 via-background to-background px-4 py-6 md:overflow-hidden md:px-8 md:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -end-24 -top-24 hidden size-72 rounded-full bg-primary/[0.07] blur-3xl md:block"
        />
        <div className="relative flex flex-col gap-2">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-9 w-full max-w-xs md:h-10" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-full border border-border bg-muted/40 p-0.5">
          <SkeletonRepeat
            count={presetCount}
            render={(i) => (
              <Skeleton key={i} className="mx-0.5 h-8 w-[5.5rem] rounded-full" />
            )}
          />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SkeletonRepeat
          count={kpiCount}
          render={(i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-lg border border-border border-l-[3px] border-l-border bg-card px-5 py-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="size-7 rounded-md" />
              </div>
              <Skeleton className="h-[1.6rem] w-32" />
              <Skeleton className="mt-2 h-[11px] w-32" />
            </div>
          )}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/60 pb-4">
          <Skeleton className="h-5 w-20" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center gap-4 border-b border-border bg-muted/30 px-4 py-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="ms-auto h-3 w-16" />
          </div>
          <SkeletonRepeat
            count={invoiceRowCount}
            render={(i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-border px-4 py-3.5 last:border-0"
              >
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="ms-auto h-4 w-20" />
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
