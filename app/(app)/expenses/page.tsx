import { ExpensesView } from "@/components/features/expenses/expenses-view";
import { listExpenses } from "@/lib/expenses/actions";
import { listProjects } from "@/lib/projects/actions";
import { getProfile } from "@/lib/profile/actions";

export default async function ExpensesPage() {
  const [expensesResult, projectsResult, profileResult] = await Promise.all([
    listExpenses(),
    listProjects(),
    getProfile(),
  ]);

  if (!expensesResult.ok) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Expenses
        </h1>
        <p className="text-destructive text-sm">{expensesResult.message}</p>
      </div>
    );
  }

  const projects = projectsResult.ok ? projectsResult.projects : [];
  const defaultCurrency =
    profileResult.ok && profileResult.profile?.default_currency
      ? profileResult.profile.default_currency
      : "USD";

  return (
    <ExpensesView
      expenses={expensesResult.expenses}
      projects={projects}
      defaultCurrency={defaultCurrency}
      showPageHeader
    />
  );
}
