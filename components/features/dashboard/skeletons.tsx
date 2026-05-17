import {
  SkeletonKPI,
  SkeletonListRow,
  Skeleton,
} from "@/components/shared/skeletons";
import { SkeletonRepeat } from "@/components/shared/skeleton-repeat";

export type DashboardPageSkeletonProps = {
  statCardCount?: number;
  activityRowCount?: number;
  showAttentionBanner?: boolean;
};

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
      {/* Page header */}
      <div className="flex flex-col gap-1.5">
        <Skeleton w={64} h={10} r={3} />
        <Skeleton w={192} h={28} r={4} />
      </div>

      {/* KPI grid — mirrors DashboardKpiCards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SkeletonRepeat count={statCardCount} render={(i) => <SkeletonKPI key={i} />} />
      </div>

      {showAttentionBanner && <Skeleton h={56} r={6} />}

      {/* Activity + Pipeline */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Activity feed */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
            <div className="flex flex-col gap-1.5">
              <Skeleton w={128} h={13} r={3} />
              <Skeleton w={200} h={10} r={3} />
            </div>
            <Skeleton w={72} h={28} r={6} />
          </div>
          <div className="flex flex-col divide-y divide-border/50 px-4 py-2">
            <SkeletonRepeat
              count={activityRowCount}
              render={(i) => <SkeletonListRow key={i} withAvatar withMeta />}
            />
          </div>
        </div>

        {/* Pipeline */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
            <div className="flex flex-col gap-1.5">
              <Skeleton w={112} h={13} r={3} />
              <Skeleton w={160} h={10} r={3} />
            </div>
            <Skeleton w={72} h={28} r={6} />
          </div>
          <div className="flex flex-col gap-3 p-4">
            <SkeletonRepeat count={3} render={(i) => <Skeleton key={i} h={72} r={6} />} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProtectedPlaceholderSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading"
      className="flex flex-col gap-3 max-w-xl"
    >
      <Skeleton w={176} h={32} r={6} />
      <Skeleton w="100%" h={16} r={4} />
      <Skeleton w="80%" h={16} r={4} />
    </div>
  );
}
