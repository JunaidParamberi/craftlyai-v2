import {
  countDoneTasks,
  countOpenTasks,
  countOverdueTasks,
} from "@/lib/tasks/task-utils";
import type { TaskListRow } from "@/types";
import { KpiCard } from "@/components/shared/kpi-card";

type TasksSummaryStripProps = {
  tasks: TaskListRow[];
};

export function TasksSummaryStrip({ tasks }: TasksSummaryStripProps) {
  const open = countOpenTasks(tasks);
  const overdue = countOverdueTasks(tasks);
  const done = countDoneTasks(tasks);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <KpiCard
        label="Open"
        value={open}
        sub={open === 1 ? "active task" : "active tasks"}
        delay={0}
      />
      <KpiCard
        label="Overdue"
        value={overdue}
        sub={overdue === 0 ? "Nothing overdue" : "needs attention"}
        variant={overdue > 0 ? "danger" : "default"}
        delay={60}
      />
      <KpiCard
        label="Done"
        value={done}
        sub={done === 1 ? "task completed" : "tasks completed"}
        delay={120}
      />
    </div>
  );
}
