"use client";

import { ProjectsPageSkeleton } from "@/components/features/projects/skeletons";
import { PROJECT_LIST_FILTER_TABS } from "@/lib/projects/display";
import { useSkeletonCount } from "@/hooks/use-skeleton-count";
import { TABLE_PAGE_SIZE } from "@/lib/ui/skeleton-count";

export function ProjectsPageSkeletonLoader() {
  const rowCount = useSkeletonCount("projects:list", { cap: TABLE_PAGE_SIZE });
  return (
    <ProjectsPageSkeleton
      rowCount={rowCount}
      statusChipCount={PROJECT_LIST_FILTER_TABS.length}
    />
  );
}
