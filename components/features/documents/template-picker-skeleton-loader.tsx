"use client";

import { TemplatePickerSkeleton } from "@/components/features/documents/skeletons";
import { useSkeletonCount } from "@/hooks/use-skeleton-count";

export function TemplatePickerSkeletonLoader() {
  const templateCount = useSkeletonCount("documents:templates");
  return <TemplatePickerSkeleton templateCount={templateCount} />;
}
