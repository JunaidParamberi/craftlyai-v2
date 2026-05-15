import { AlertCircle, CircleCheck, ListTodo } from "lucide-react";

import {
  countDoneTasks,
  countOpenTasks,
  countOverdueTasks,
} from "@/lib/tasks/task-utils";
import type { TaskListRow } from "@/types";

import { KpiCard } from "@/components/features/finance/kpi-card";

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
        value={String(open)}
        subLabel={open === 1 ? "active task" : "active tasks"}
        icon={ListTodo}
        accentColor="border-primary"
        iconBg="bg-primary/10"
        iconColor="text-primary"
        index={0}
      />
      <KpiCard
        label="Overdue"
        value={String(overdue)}
        subLabel={
          overdue === 0 ? "Nothing overdue" : "needs attention"
        }
        icon={AlertCircle}
        accentColor="border-destructive"
        iconBg="bg-destructive/10"
        iconColor="text-destructive"
        subLabelColor={overdue > 0 ? "text-destructive" : undefined}
        index={1}
      />
      <KpiCard
        label="Done"
        value={String(done)}
        subLabel={done === 1 ? "task completed" : "tasks completed"}
        icon={CircleCheck}
        accentColor="border-border"
        iconBg="bg-muted"
        iconColor="text-muted-foreground"
        index={2}
      />
    </div>
  );
}
