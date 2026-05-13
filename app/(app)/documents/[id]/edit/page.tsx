import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { listClients } from "@/lib/clients/client-queries";
import { getDocumentById } from "@/lib/documents/document-queries";
import { documentToFormValues } from "@/lib/documents/form-values";
import { listProjects } from "@/lib/projects/actions";

import { DocumentForm } from "@/components/features/documents/document-form";

export const metadata: Metadata = {
  title: "Edit document",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditDocumentPage({ params }: PageProps) {
  const { id } = await params;
  const document = await getDocumentById(id);
  if (!document) {
    notFound();
  }

  const [clientsResult, projectsResult] = await Promise.all([
    listClients(),
    listProjects(),
  ]);

  const clients = clientsResult.ok ? clientsResult.clients : [];
  const projects = projectsResult.ok ? projectsResult.projects : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href={`/documents/${document.id}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          Back to document
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Edit document
          </h1>
        </div>
      </div>

      <DocumentForm
        mode="edit"
        documentId={document.id}
        defaultValues={documentToFormValues(document)}
        clients={clients}
        projects={projects}
      />
    </div>
  );
}
