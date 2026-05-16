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
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Finance
        </p>
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
          Revenue Overview
        </h1>
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
