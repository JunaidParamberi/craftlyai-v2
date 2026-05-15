import { TemplatePickerSkeletonLoader } from "@/components/features/documents/template-picker-skeleton-loader";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewDocumentLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <TemplatePickerSkeletonLoader />
    </div>
  );
}
