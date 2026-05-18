import { Skeleton } from "@/components/shared/skeletons";
import { SkeletonRepeat } from "@/components/shared/skeleton-repeat";

const DEFAULT_ROW_COUNT = 6;

function SkeletonProjectTasksTableRow() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="tasks-table-cell w-8">
        <Skeleton variant="circle" w={16} h={16} />
      </td>
      <td className="tasks-table-cell">
        <Skeleton w="72%" h={12} r={3} />
      </td>
      <td className="tasks-table-cell">
        <Skeleton w={88} h={22} r={99} />
      </td>
      <td className="tasks-table-cell">
        <Skeleton w={56} h={22} r={99} />
      </td>
      <td className="tasks-table-cell">
        <Skeleton w={64} h={12} r={3} />
      </td>
    </tr>
  );
}

export type ProjectTasksListSkeletonProps = {
  rowCount?: number;
};

/** Mirrors project hub list table (checkbox + Task / Status / Priority / Due). */
export function ProjectTasksListSkeleton({
  rowCount = DEFAULT_ROW_COUNT,
}: ProjectTasksListSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading tasks"
      className="overflow-hidden rounded-xl border border-border bg-card shadow-xs"
    >
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="tasks-table-head w-8" aria-hidden>
              <span className="sr-only">Done</span>
            </th>
            <th className="tasks-table-head" aria-hidden>
              <Skeleton w={36} h={10} r={2} />
            </th>
            <th className="tasks-table-head" aria-hidden>
              <Skeleton w={44} h={10} r={2} />
            </th>
            <th className="tasks-table-head" aria-hidden>
              <Skeleton w={48} h={10} r={2} />
            </th>
            <th className="tasks-table-head" aria-hidden>
              <Skeleton w={28} h={10} r={2} />
            </th>
          </tr>
        </thead>
        <tbody>
          <SkeletonRepeat
            count={rowCount}
            render={(i) => <SkeletonProjectTasksTableRow key={i} />}
          />
        </tbody>
      </table>
    </div>
  );
}

/** Mirrors project hub kanban grid (4 columns). */
export function ProjectTasksKanbanSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading board"
      className="grid min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4"
    >
      {Array.from({ length: 4 }).map((_, col) => (
        <div key={col} className="flex flex-col gap-2">
          <Skeleton w="60%" h={14} r={4} />
          {Array.from({ length: 3 }).map((__, row) => (
            <Skeleton key={row} w="100%" h={88} r={10} />
          ))}
        </div>
      ))}
    </div>
  );
}
