import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AgingReport } from "@/lib/finance/types";

type Props = { report: AgingReport; currency: string };

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const BUCKET_STYLES = [
  { key: "current" as const, color: "bg-emerald-500" },
  { key: "overdue1to30" as const, color: "bg-amber-400" },
  { key: "overdue31to60" as const, color: "bg-orange-500" },
  { key: "overdue60plus" as const, color: "bg-red-500" },
];

export function InvoiceAgingReport({ report, currency }: Props) {
  const buckets = BUCKET_STYLES.map(({ key, color }) => ({
    ...report[key],
    color,
  }));

  const maxBucketTotal = Math.max(...buckets.map((b) => b.total), 1);
  const hasOverdue =
    report.overdue1to30.count > 0 ||
    report.overdue31to60.count > 0 ||
    report.overdue60plus.count > 0;

  return (
    <Card>
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="text-base">Invoice Aging</CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        {!hasOverdue && report.current.count === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No outstanding invoices
          </p>
        ) : !hasOverdue ? (
          <p className="py-4 text-center text-sm text-emerald-600 font-medium">
            ✓ All outstanding invoices are current — none overdue
          </p>
        ) : (
          <div className="space-y-4">
            {buckets.map((bucket) => (
              <div key={bucket.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm text-foreground">{bucket.label}</span>
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    {formatMoney(bucket.total, currency)}
                    {bucket.count > 0 && (
                      <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
                        ({bucket.count} {bucket.count === 1 ? "invoice" : "invoices"})
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-2 rounded-full transition-all duration-500", bucket.color)}
                    style={{
                      width:
                        bucket.total > 0
                          ? `${Math.round((bucket.total / maxBucketTotal) * 100)}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
