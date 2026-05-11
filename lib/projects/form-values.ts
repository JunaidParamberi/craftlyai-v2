import type { ProjectCreateFormInput } from "@/lib/validations/project";
import type { ProjectListRow } from "@/types";

function moneyToFormField(n: number | null): string {
  if (n === null || n === undefined) {
    return "";
  }
  return String(n);
}

/** Map a persisted project to react-hook-form defaults for create/edit. */
export function projectRowToFormValues(row: ProjectListRow): ProjectCreateFormInput {
  return {
    client_id: row.client_id,
    title: row.title,
    status: row.status,
    budget: moneyToFormField(row.budget),
    spent: moneyToFormField(row.spent),
    start_date: row.start_date ?? "",
    deadline: row.deadline ?? "",
  };
}
