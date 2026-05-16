"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateLPOMeta, uploadLPOPdf } from "@/lib/documents/lpo-mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const formSchema = z.object({
  lpo_number: z.string().trim().min(1, "LPO number is required.").max(100),
  lpo_validity_date: z.string().nullable().optional(),
  lpo_amount: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  documentId: string;
  initialValues: {
    lpo_number: string | null;
    lpo_validity_date: string | null;
    lpo_amount: number | null;
    lpo_pdf_url: string | null;
  };
}

export function LPOMetaFields({ documentId, initialValues }: Props) {
  const [isPending, startTransition] = useTransition();
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lpo_number: initialValues.lpo_number ?? "",
      lpo_validity_date: initialValues.lpo_validity_date ?? "",
      lpo_amount:
        initialValues.lpo_amount != null
          ? String(initialValues.lpo_amount)
          : "",
    },
  });

  function onSubmit(data: FormValues) {
    const lpo_amount =
      data.lpo_amount && data.lpo_amount !== ""
        ? Number(data.lpo_amount)
        : undefined;

    if (lpo_amount !== undefined && lpo_amount <= 0) {
      toast.error("Amount must be positive.");
      return;
    }

    startTransition(async () => {
      const metaResult = await updateLPOMeta(documentId, {
        lpo_number: data.lpo_number,
        lpo_validity_date: data.lpo_validity_date ?? null,
        lpo_amount: lpo_amount ?? null,
      });

      if (!metaResult.ok) {
        toast.error(metaResult.error ?? "Failed to save LPO details.");
        return;
      }

      if (pdfFile) {
        const fd = new FormData();
        fd.append("lpo_pdf", pdfFile);
        const uploadResult = await uploadLPOPdf(documentId, fd);
        if (!uploadResult.ok) {
          toast.error(uploadResult.error ?? "Failed to upload PDF.");
          return;
        }
      }

      toast.success("LPO details saved.");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border p-4">
      <h3 className="text-sm font-semibold">LPO Details</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="lpo_number">
            LPO Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lpo_number"
            placeholder="e.g. LPO-2026-001"
            {...register("lpo_number")}
          />
          {errors.lpo_number && (
            <p className="text-xs text-destructive">{errors.lpo_number.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lpo_amount">Authorized Amount</Label>
          <Input
            id="lpo_amount"
            type="number"
            step="0.01"
            placeholder="e.g. 5000.00"
            {...register("lpo_amount")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lpo_validity_date">Valid Until</Label>
          <Input
            id="lpo_validity_date"
            type="date"
            {...register("lpo_validity_date")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lpo_pdf">Client LPO Document</Label>
          <Input
            id="lpo_pdf"
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
          />
          {initialValues.lpo_pdf_url && (
            <a
              href={initialValues.lpo_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline"
            >
              View uploaded LPO
            </a>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? "Saving…" : "Save LPO Details"}
      </Button>
    </form>
  );
}
