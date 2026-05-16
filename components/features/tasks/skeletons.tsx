import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TasksPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-32 rounded-[4px] md:h-9" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} size="sm">
            <CardHeader className="pb-2">
              <Skeleton className="h-[10px] w-20 rounded-[3px]" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0">
              <Skeleton className="h-7 w-16 rounded-[4px]" />
              <Skeleton className="h-[10px] w-24 rounded-[3px]" />
            </CardContent>
          </Card>
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
              <Skeleton key={i} className="h-[3.25rem] w-full rounded-[6px]" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
