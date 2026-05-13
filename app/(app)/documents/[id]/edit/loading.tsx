import { DocumentEditorSkeleton } from "@/components/features/documents/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditDocumentLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-8 w-48" />
      <DocumentEditorSkeleton />
    </div>
  );
}
