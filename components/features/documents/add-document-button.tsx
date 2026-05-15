"use client";

import Link from "next/link";
import { Lock, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/config/plans";
import type { PlanTier } from "@/config/plans";

interface AddDocumentButtonProps {
  atLimit: boolean;
  planTier: PlanTier;
  docLimit: number;
}

export function AddDocumentButton({ atLimit, planTier, docLimit }: AddDocumentButtonProps) {
  if (!atLimit) {
    return (
      <Button nativeButton={false} render={<Link href="/documents/new" />}>
        <Plus />
        New document
      </Button>
    );
  }

  const planName = PLANS[planTier].name;
  const limitDisplay = docLimit === Infinity ? "unlimited" : String(docLimit);

  function handleClick() {
    toast.error("Document limit reached", {
      description: `${planName} plan allows ${limitDisplay} documents per month. Upgrade for unlimited.`,
      action: {
        label: "Upgrade plan",
        onClick: () => { window.location.href = "/settings/billing"; },
      },
      duration: 6000,
    });
  }

  return (
    <Button variant="outline" onClick={handleClick} className="gap-2">
      <Lock className="size-4 text-muted-foreground" />
      New document
    </Button>
  );
}
