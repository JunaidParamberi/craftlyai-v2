import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonRepeat } from "@/components/shared/skeleton-repeat";

export type DocumentsTableSkeletonProps = {
  rowCount?: number;
};

export function DocumentsTableSkeleton({ rowCount = 0 }: DocumentsTableSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-full" />
      <div className="rounded-xl border border-border/70">
        <SkeletonRepeat
          count={rowCount}
          render={(i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border/60 px-4 py-4 last:border-b-0"
            >
              <Skeleton className="size-2 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          )}
        />
      </div>
    </div>
  );
}

export function DocumentEditorSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[28rem] w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}

export type TemplatePickerSkeletonProps = {
  templateCount?: number;
};

export function TemplatePickerSkeleton({
  templateCount = 0,
}: TemplatePickerSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SkeletonRepeat
        count={templateCount}
        render={(i) => (
          <Skeleton key={i} className="aspect-[5/4] rounded-xl" />
        )}
      />
    </div>
  );
}
