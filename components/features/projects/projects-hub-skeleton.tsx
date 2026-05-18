import { Skeleton } from "@/components/shared/skeletons";
import {
  ProjectTasksKanbanSkeleton,
  ProjectTasksListSkeleton,
} from "@/components/features/projects/project-tasks-skeletons";
import type { ProjectsHubViewMode } from "@/lib/projects/hub-view-preference";

export type ProjectsHubSkeletonProps = {
  viewMode?: ProjectsHubViewMode;
};

export function ProjectsHubSkeleton({
  viewMode = "board",
}: ProjectsHubSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading projects"
      className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-4 py-7 pb-20 sm:px-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton w={160} h={30} r={6} />
          <Skeleton w={280} h={14} r={4} />
        </div>
        <div className="flex gap-2">
          <Skeleton w={120} h={30} r={8} />
          <Skeleton w={120} h={30} r={8} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} w={140} h={28} r={9999} />
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-2 lg:col-span-1">
            <Skeleton w="70%" h={22} r={5} />
            <Skeleton w="50%" h={12} r={4} />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton w={48} h={10} r={4} />
              <Skeleton w="80%" h={16} r={4} />
              <Skeleton w="55%" h={10} r={4} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 border-b border-border pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} w={72} h={28} r={4} />
        ))}
      </div>

      {viewMode === "list" ? (
        <ProjectTasksListSkeleton />
      ) : (
        <ProjectTasksKanbanSkeleton />
      )}
    </div>
  );
}
