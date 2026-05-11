import dynamic from "next/dynamic";

import { listProjects } from "@/lib/projects/actions";
import { listTimeEntries } from "@/lib/time/actions";

/** Separate client chunk avoids intermittent dev Webpack `__webpack_modules__[moduleId] is not a function` when loading the heavy Time UI bundle. */
const TimeTracker = dynamic(
  () =>
    import("@/components/features/time/time-tracker").then((m) => ({
      default: m.TimeTracker,
    })),
  {
    loading: () => (
      <div className="flex flex-col gap-4 py-2">
        <div className="h-9 max-w-md animate-pulse rounded-md bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    ),
  },
);

export default async function TimePage() {
  const [projectsRes, entriesRes] = await Promise.all([
    listProjects(),
    listTimeEntries(),
  ]);

  if (!projectsRes.ok) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Time
        </h1>
        <p className="text-destructive text-sm">{projectsRes.message}</p>
      </div>
    );
  }

  if (!entriesRes.ok) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Time
        </h1>
        <p className="text-destructive text-sm">{entriesRes.message}</p>
      </div>
    );
  }

  return (
    <TimeTracker
      projects={projectsRes.projects}
      entries={entriesRes.entries}
    />
  );
}
