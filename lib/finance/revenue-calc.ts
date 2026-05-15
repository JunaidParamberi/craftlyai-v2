import { differenceInDays, parseISO } from "date-fns";

type LineItemLike = {
  quantity: string | number;
  unit_price: string | number;
  tax_rate?: string | number | null;
};

export function calcLineItemsTotal(items: LineItemLike[]): number {
  return items.reduce(
    (sum, li) => sum + Number(li.quantity) * Number(li.unit_price),
    0
  );
}

export function applyDiscount(
  subtotal: number,
  discountType: "percent" | "flat",
  discountValue: number
): number {
  if (discountValue === 0) return subtotal;
  if (discountType === "percent") {
    return subtotal * (1 - discountValue / 100);
  }
  return Math.max(0, subtotal - discountValue);
}

type PaidInvoiceLike = {
  sent_at: string | null;
  paid_at: string | null;
};

export function calcAvgPayDays(invoices: PaidInvoiceLike[]): number | null {
  const valid = invoices.filter((i) => i.sent_at && i.paid_at);
  if (valid.length === 0) return null;
  const totalDays = valid.reduce((sum, i) => {
    return sum + differenceInDays(parseISO(i.paid_at!), parseISO(i.sent_at!));
  }, 0);
  return Math.round(totalDays / valid.length);
}

export function calcTaxTotal(items: LineItemLike[]): number {
  return items.reduce(
    (sum, li) =>
      sum +
      Number(li.quantity) *
        Number(li.unit_price) *
        (Number(li.tax_rate ?? 0) / 100),
    0
  );
}

export function calcRevenueChangePct(
  current: number,
  previous: number
): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
