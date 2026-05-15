"use client";

import { DocumentsTableSkeleton } from "@/components/features/documents/skeletons";
import { useSkeletonCount } from "@/hooks/use-skeleton-count";
import { TABLE_PAGE_SIZE } from "@/lib/ui/skeleton-count";

export function DocumentsPageSkeletonLoader() {
  const rowCount = useSkeletonCount("documents:list", { cap: TABLE_PAGE_SIZE });
  return <DocumentsTableSkeleton rowCount={rowCount} />;
}
