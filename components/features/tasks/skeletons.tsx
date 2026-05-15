import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TasksPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[7.5rem] w-full rounded-lg" />
        ))}
      </div>
      <Card>
        <CardHeader className="border-b border-border/60 pb-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-3 xl:flex-row">
            <Skeleton className="h-9 w-full xl:w-72" />
            <Skeleton className="hidden h-9 flex-1 xl:block" />
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
