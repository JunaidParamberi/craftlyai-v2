"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { lpoMetaSchema, type LPOMetaInput } from "@/lib/validations/document";
import { updateLPOMeta, uploadLPOPdf } from "@/lib/documents/lpo-mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
  } = useForm<LPOMetaInput>({
    resolver: zodResolver(lpoMetaSchema),
    defaultValues: {
      lpo_number: initialValues.lpo_number ?? "",
      lpo_validity_date: initialValues.lpo_validity_date ?? "",
      lpo_amount: initialValues.lpo_amount ?? undefined,
    },
  });

  function onSubmit(data: LPOMetaInput) {
    startTransition(async () => {
      const metaResult = await updateLPOMeta(documentId, data);
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
          {errors.lpo_amount && (
            <p className="text-xs text-destructive">{errors.lpo_amount.message}</p>
          )}
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
