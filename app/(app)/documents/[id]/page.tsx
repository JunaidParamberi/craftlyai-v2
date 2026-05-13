import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Download, Pencil } from "lucide-react";

import { getClientById } from "@/lib/clients/client-queries";
import { getDocumentById } from "@/lib/documents/document-queries";
import { buildVariableContext } from "@/lib/documents/variables-server";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

import { DocumentDetailView } from "@/components/features/documents/document-detail-view";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const document = await getDocumentById(id);
  return { title: document?.title ?? "Document" };
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const document = await getDocumentById(id);
  if (!document) {
    notFound();
  }

  const [client, projectTitle, variableContext] = await Promise.all([
    document.client_id ? getClientById(document.client_id) : Promise.resolve(null),
    document.project_id ? fetchProjectTitle(document.project_id) : Promise.resolve(null),
    buildVariableContext({
      clientId: document.client_id,
      projectId: document.project_id,
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          Back to documents
        </Link>
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a
                href={`/api/documents/${document.id}/pdf`}
                download={`${document.title.replace(/[^a-zA-Z0-9_\-. ]/g, "").trim() || "document"}.pdf`}
              />
            }
          >
            <Download className="size-4" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/documents/${document.id}/edit`} />}
          >
            <Pencil className="size-4" />
            Edit document
          </Button>
        </div>
      </div>

      <DocumentDetailView
        document={document}
        variableContext={variableContext}
        clientName={client?.name ?? null}
        projectTitle={projectTitle}
      />
    </div>
  );
}

async function fetchProjectTitle(projectId: string): Promise<string | null> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("projects")
    .select("title")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();
  return data?.title ?? null;
}
