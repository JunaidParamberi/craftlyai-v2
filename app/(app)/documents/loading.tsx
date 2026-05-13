import { DocumentsTableSkeleton } from "@/components/features/documents/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <DocumentsTableSkeleton />
    </div>
  );
}
