import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { listDocuments } from "@/lib/documents/document-queries";
import { paginatedListSkeletonCount } from "@/lib/ui/skeleton-count";
import { SkeletonCountRecorder } from "@/hooks/use-skeleton-count";

import { DocumentsTable } from "@/components/features/documents/documents-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Documents",
};

export default async function DocumentsPage() {
  const result = await listDocuments();

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Documents
        </h1>
        <p className="text-destructive text-sm">{result.message}</p>
      </div>
    );
  }

  const { documents } = result;

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
        <Button nativeButton={false} render={<Link href="/documents/new" />}>
          <Plus />
          New document
        </Button>
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
        <DocumentsTable documents={documents} />
      )}
    </div>
  );
}
