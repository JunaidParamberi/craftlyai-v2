import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { listDocuments } from "@/lib/documents/document-queries";
import { getProfile } from "@/lib/profile/actions";
import { createClient } from "@/lib/supabase/server";
import { getPlanLimit, startOfCurrentMonth } from "@/lib/plan-usage/helpers";
import { paginatedListSkeletonCount } from "@/lib/ui/skeleton-count";
import { SkeletonCountRecorder } from "@/hooks/use-skeleton-count";

import { DocumentsTable } from "@/components/features/documents/documents-table";
import { AddDocumentButton } from "@/components/features/documents/add-document-button";
import { UpgradeGhostRow } from "@/components/features/billing/upgrade-ghost-row";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PlanTier } from "@/config/plans";

export const metadata: Metadata = {
  title: "Documents",
};

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [documentsResult, profileResult, docCountResult] = await Promise.all([
    listDocuments(),
    getProfile(),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user?.id ?? "")
      .gte("created_at", startOfCurrentMonth()),
  ]);

  if (!documentsResult.ok) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Documents
        </h1>
        <p className="text-destructive text-sm">{documentsResult.message}</p>
      </div>
    );
  }

  const { documents } = documentsResult;
  const planTier = (profileResult.ok && profileResult.profile?.plan_tier
    ? profileResult.profile.plan_tier
    : "free") as PlanTier;
  const docLimit = getPlanLimit(planTier, "docsPerMonth");
  const docCountThisMonth = docCountResult.count ?? 0;
  const atLimit = docLimit !== Infinity && docCountThisMonth >= docLimit;

  return (
    <div className="flex flex-col gap-8">
      <SkeletonCountRecorder
        id="documents:list"
        count={paginatedListSkeletonCount(documents.length)}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Documents
          </h1>
          <p className="max-w-lg text-muted-foreground text-sm">
            Proposals, quotes, invoices, and everything you send to clients —
            written here, sent from here.
          </p>
        </div>
        <AddDocumentButton
          atLimit={atLimit}
          planTier={planTier}
          docLimit={docLimit}
        />
      </div>

      {documents.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No documents yet</CardTitle>
            <CardDescription>
              Start from a template or a blank canvas. Documents save
              automatically as you edit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button nativeButton={false} render={<Link href="/documents/new" />}>
              <Plus />
              Create your first document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          <DocumentsTable documents={documents} />
          {atLimit && (
            <UpgradeGhostRow
              title="Create more documents"
              description={`Free plan: ${docCountThisMonth}/${docLimit} documents used this month — upgrade for unlimited`}
            />
          )}
        </div>
      )}
    </div>
  );
}
