import type { Metadata } from "next";
import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FinanceFilterBar } from "@/components/features/finance/finance-filter-bar";
import { SkeletonCountRecorder } from "@/hooks/use-skeleton-count";
import { FinanceSummaryCards } from "@/components/features/finance/finance-summary-cards";
import { RevenueAreaChart } from "@/components/features/finance/revenue-area-chart";
import { FinanceInvoiceTable } from "@/components/features/finance/finance-invoice-table";
import { InvoiceAgingReport } from "@/components/features/finance/invoice-aging-report";
import {
  getFinancialSummary,
  getMonthlyRevenue,
  listFinanceInvoices,
  getAgingReport,
} from "@/lib/finance/finance-queries";
import { parseDateRangeParams } from "@/lib/finance/date-utils";
import {
  parsePageParam,
  parseSortParam,
  parseSearchParam,
  parseStatusParam,
} from "@/lib/finance/filter-utils";
import type { InvoiceFilters } from "@/lib/finance/types";
import { getProfile } from "@/lib/profile/actions";

export const metadata: Metadata = { title: "Finance" };

type SearchParams = Promise<{
  from?: string;
  to?: string;
  page?: string;
  sort?: string;
  search?: string;
  status?: string;
}>;

export default async function FinancePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { from, to, page, sort, search, status } = await searchParams;
  const range = parseDateRangeParams(from, to);

  const filters: InvoiceFilters = {
    dateRange: range,
    page: parsePageParam(page),
    pageSize: 20,
    sort: parseSortParam(sort),
    search: parseSearchParam(search),
    status: parseStatusParam(status),
  };

  const profileResult = await getProfile();
  const currency =
    profileResult.ok && profileResult.profile?.default_currency
      ? profileResult.profile.default_currency
      : "USD";

  const [summary, monthlyRevenue, paginatedInvoices, agingReport] = await Promise.all([
    getFinancialSummary(range),
    getMonthlyRevenue(range),
    listFinanceInvoices(filters),
    getAgingReport(),
  ]);

  const dateParams = from && to ? `from=${from}&to=${to}` : "";

  return (
    <>
      <SkeletonCountRecorder
        id="finance:invoices"
        count={paginatedInvoices.invoices.length}
      />
      <div className="relative shrink-0 rounded-3xl border border-border/60 bg-gradient-to-br from-muted/40 via-background to-background px-4 py-6 md:overflow-hidden md:px-8 md:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -end-24 -top-24 hidden size-72 rounded-full bg-primary/[0.07] blur-3xl md:block"
        />
        <div className="relative flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Finance
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Revenue Overview
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground md:text-base">
            Track invoices, revenue, and payment performance.
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <FinanceFilterBar />
      </Suspense>

      <FinanceSummaryCards
        summary={summary}
        currency={currency}
        dateParams={dateParams}
        activeStatus={status}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Revenue
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <RevenueAreaChart data={monthlyRevenue} currency={currency} />
        </CardContent>
      </Card>

      <Card>
        <FinanceInvoiceTable
          invoices={paginatedInvoices.invoices}
          total={paginatedInvoices.total}
          pageCount={paginatedInvoices.pageCount}
          currentPage={filters.page}
          currentSort={filters.sort}
          currency={currency}
          filters={{
            dateRange: filters.dateRange,
            pageSize: filters.pageSize,
            sort: filters.sort,
            search: filters.search,
            status: filters.status,
          }}
        />
      </Card>

      <InvoiceAgingReport report={agingReport} currency={currency} />
    </>
  );
}
