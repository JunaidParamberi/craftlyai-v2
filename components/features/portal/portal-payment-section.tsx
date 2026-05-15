import { MockPaymentForm } from "@/components/features/documents/mock-payment-modal";

type PortalPaymentSectionProps = {
  payToken: string;
  invoiceId: string;
  total: number;
  currency: string;
};

export function PortalPaymentSection({
  payToken,
  invoiceId,
  total,
  currency,
}: PortalPaymentSectionProps) {
  return (
    <div className="border-t border-border/50 pt-5">
      <MockPaymentForm
        payToken={payToken}
        invoiceId={invoiceId}
        total={total}
        currency={currency}
      />
    </div>
  );
}
