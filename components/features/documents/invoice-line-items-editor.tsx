"use client";

import { useState, useTransition } from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertLineItem, deleteLineItem, updateInvoiceMeta } from "@/lib/documents/invoice-mutations";
import { cn } from "@/lib/utils";
import type { LineItemRow } from "@/types";

interface InvoiceLineItemsEditorProps {
  documentId: string;
  initialItems: LineItemRow[];
  currency?: string;
  discountValue?: number;
  discountType?: 'percent' | 'flat';
  onDiscountSave?: (value: number, type: 'percent' | 'flat') => void;
}

interface LocalLineItem {
  /** Undefined for brand-new rows not yet persisted. */
  id: string | undefined;
  /** Temporary key for React reconciliation only. */
  key: string;
  description: string;
  quantity: string;
  unit_price: string;
  tax_rate: string;
  sort_order: number;
}

function toLocal(item: LineItemRow): LocalLineItem {
  return {
    id: item.id,
    key: item.id,
    description: item.description,
    quantity: String(item.quantity),
    unit_price: String(item.unit_price),
    tax_rate: String(item.tax_rate),
    sort_order: item.sort_order,
  };
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function rowAmount(item: LocalLineItem): number {
  const qty = parseFloat(item.quantity) || 0;
  const price = parseFloat(item.unit_price) || 0;
  return qty * price;
}

function rowTax(item: LocalLineItem): number {
  const qty = parseFloat(item.quantity) || 0;
  const price = parseFloat(item.unit_price) || 0;
  const rate = parseFloat(item.tax_rate) || 0;
  return qty * price * (rate / 100);
}

export function InvoiceLineItemsEditor({
  documentId,
  initialItems,
  currency = "USD",
  discountValue = 0,
  discountType: initialDiscountType = 'percent',
  onDiscountSave,
}: InvoiceLineItemsEditorProps) {
  const [items, setItems] = useState<LocalLineItem[]>(
    initialItems.map(toLocal)
  );
  const [discountVal, setDiscountVal] = useState<number>(discountValue);
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>(initialDiscountType);
  const [, startTransition] = useTransition();

  const updateItem = (key: string, field: keyof LocalLineItem, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

  const handleBlur = (key: string) => {
    const item = items.find((i) => i.key === key);
    if (!item) return;

    startTransition(async () => {
      const result = await upsertLineItem(documentId, {
        id: item.id,
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        unit_price: parseFloat(item.unit_price) || 0,
        tax_rate: parseFloat(item.tax_rate) || 0,
        sort_order: item.sort_order,
      });

      if (result.ok && result.lineItem) {
        // If it was a new row, store the real id for future updates
        if (!item.id) {
          setItems((prev) =>
            prev.map((i) =>
              i.key === key ? { ...i, id: result.lineItem!.id } : i
            )
          );
        }
      }
    });
  };

  const handleDelete = (key: string) => {
    const item = items.find((i) => i.key === key);
    if (!item) return;

    // Remove optimistically
    setItems((prev) => prev.filter((i) => i.key !== key));

    // Only call server if row was persisted
    if (item.id) {
      startTransition(async () => {
        await deleteLineItem(item.id!, documentId);
      });
    }
  };

  const handleAddRow = () => {
    const newKey = crypto.randomUUID();
    setItems((prev) => [
      ...prev,
      {
        id: undefined,
        key: newKey,
        description: "",
        quantity: "1",
        unit_price: "0",
        tax_rate: "0",
        sort_order: prev.length,
      },
    ]);
  };

  const handleTypeChange = (newType: 'percent' | 'flat') => {
    setDiscountType(newType);
    startTransition(async () => {
      if (onDiscountSave) {
        onDiscountSave(discountVal, newType);
      } else {
        await updateInvoiceMeta(documentId, { discount_type: newType, discount_value: discountVal });
      }
    });
  };

  const handleDiscountBlur = () => {
    startTransition(async () => {
      if (onDiscountSave) {
        onDiscountSave(discountVal, discountType);
      } else {
        await updateInvoiceMeta(documentId, { discount_type: discountType, discount_value: discountVal });
      }
    });
  };

  const subtotal = items.reduce((sum, item) => sum + rowAmount(item), 0);
  const totalTax = items.reduce((sum, item) => sum + rowTax(item), 0);
  const discount = discountType === 'flat'
    ? Math.min(discountVal, subtotal)
    : subtotal * (discountVal / 100);
  const discountedSubtotal = subtotal - discount;
  const totalDue = discountedSubtotal + totalTax;

  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-foreground">Line Items</h2>

      <div className="w-full overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                Description
              </th>
              <th className="w-20 px-3 py-2 text-right font-medium text-muted-foreground">
                Qty
              </th>
              <th className="w-28 px-3 py-2 text-right font-medium text-muted-foreground">
                Unit Price
              </th>
              <th className="w-20 px-3 py-2 text-right font-medium text-muted-foreground">
                Tax %
              </th>
              <th className="w-28 px-3 py-2 text-right font-medium text-muted-foreground">
                Amount
              </th>
              <th className="w-10 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.key} className="border-b border-border last:border-0">
                <td className="px-2 py-1.5">
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateItem(item.key, "description", e.target.value)
                    }
                    onBlur={() => handleBlur(item.key)}
                    placeholder="Item description"
                    className="h-8 border-0 bg-transparent px-1 shadow-none focus-visible:ring-1"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.key, "quantity", e.target.value)
                    }
                    onBlur={() => handleBlur(item.key)}
                    className="h-8 border-0 bg-transparent px-1 text-right shadow-none focus-visible:ring-1"
                    min={0}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) =>
                      updateItem(item.key, "unit_price", e.target.value)
                    }
                    onBlur={() => handleBlur(item.key)}
                    className="h-8 border-0 bg-transparent px-1 text-right shadow-none focus-visible:ring-1"
                    min={0}
                    step={0.01}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    type="number"
                    value={item.tax_rate}
                    onChange={(e) =>
                      updateItem(item.key, "tax_rate", e.target.value)
                    }
                    onBlur={() => handleBlur(item.key)}
                    className="h-8 border-0 bg-transparent px-1 text-right shadow-none focus-visible:ring-1"
                    min={0}
                    max={100}
                    step={0.1}
                  />
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-foreground">
                  {formatCurrency(rowAmount(item), currency)}
                </td>
                <td className="px-2 py-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => handleDelete(item.key)}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete line item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-sm text-muted-foreground"
                >
                  No line items yet. Add one below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-start justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add line item
        </Button>

        <div className="min-w-48 space-y-1 text-sm">
          <div className="flex justify-between gap-8 text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">
              {formatCurrency(subtotal, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <span className="shrink-0">Discount</span>
            <div className="flex items-center gap-1">
              <div className="flex rounded border border-border overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => handleTypeChange('percent')}
                  className={cn(
                    "px-2 py-0.5 transition-colors",
                    discountType === 'percent'
                      ? "bg-foreground text-background"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  )}
                >%</button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('flat')}
                  className={cn(
                    "px-2 py-0.5 transition-colors border-l border-border",
                    discountType === 'flat'
                      ? "bg-foreground text-background"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  )}
                >$</button>
              </div>
              <input
                type="number"
                min={0}
                step={0.01}
                value={discountVal}
                onChange={(e) => setDiscountVal(parseFloat(e.target.value) || 0)}
                onBlur={handleDiscountBlur}
                className="w-20 rounded border border-border bg-background px-2 py-0.5 text-right text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          {discount > 0 ? (
            <div className="flex justify-between gap-8 text-destructive">
              <span>{discountType === 'percent' ? `Discount (${discountVal}%)` : 'Discount'}</span>
              <span className="tabular-nums">
                -{formatCurrency(discount, currency)}
              </span>
            </div>
          ) : null}
          {totalTax > 0 ? (
            <div className="flex justify-between gap-8 text-muted-foreground">
              <span>Tax</span>
              <span className="tabular-nums">
                {formatCurrency(totalTax, currency)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between gap-8 border-t border-border pt-1 text-base font-semibold text-foreground">
            <span>Total Due</span>
            <span className="tabular-nums">
              {formatCurrency(totalDue, currency)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
