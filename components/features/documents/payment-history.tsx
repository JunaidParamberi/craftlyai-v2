import Link from "next/link";
import type { PaymentMethod, PaymentRow } from "@/types";

const METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: "Bank transfer",
  cash: "Cash",
  cheque: "Cheque",
  card: "Card",
  other: "Other",
};

interface PaymentHistoryProps {
  payments: PaymentRow[];
  currency: string;
  voucherByPaymentId?: Record<string, { id: string; voucher_number: string | null }>;
}

export function PaymentHistory({
  payments,
  currency,
  voucherByPaymentId = {},
}: PaymentHistoryProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(n);

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 flex flex-col gap-3">
      <h2 className="text-sm font-semibold">Payment history</h2>

      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No payments recorded.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-left text-[0.7rem] uppercase tracking-widest text-muted-foreground">
              <th className="pb-2 pr-4 font-medium">Date</th>
              <th className="pb-2 pr-4 font-medium">Method</th>
              <th className="pb-2 pr-4 font-medium">Reference</th>
              <th className="pb-2 pr-4 font-medium">Voucher</th>
              <th className="pb-2 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-border/30 last:border-0">
                <td className="py-2 pr-4 text-muted-foreground">
                  {new Date(p.paid_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="py-2 pr-4">
                  {METHOD_LABELS[p.method as PaymentMethod] ?? p.method}
                </td>
                <td className="py-2 pr-4 text-muted-foreground">
                  {p.reference ?? "—"}
                </td>
                <td className="py-2 pr-4">
                  {voucherByPaymentId[p.id] ? (
                    <Link
                      href={`/documents/${voucherByPaymentId[p.id].id}`}
                      className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {voucherByPaymentId[p.id].voucher_number ?? "View voucher"}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-2 text-right font-medium text-emerald-600">
                  {fmt(Number(p.amount))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
