"use client";

import { ClientsPageSkeleton } from "@/components/features/clients/skeletons";
import { useSkeletonCount } from "@/hooks/use-skeleton-count";
import { TABLE_PAGE_SIZE } from "@/lib/ui/skeleton-count";

export function ClientsPageSkeletonLoader() {
  const rowCount = useSkeletonCount("clients:list", { cap: TABLE_PAGE_SIZE });
  return <ClientsPageSkeleton rowCount={rowCount} />;
}
