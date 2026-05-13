import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ClientDetailView } from "@/components/features/clients/detail/client-detail-view";
import { FormPageShell } from "@/components/shared/form-page-shell";
import { getClientById } from "@/lib/clients/actions";
import { listProjects } from "@/lib/projects/actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const client = await getClientById(id);
  return { title: client?.name ?? "Client" };
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) {
    notFound();
  }

  const projectsResult = await listProjects();
  const projects = projectsResult.ok ? projectsResult.projects : [];

  return (
    <FormPageShell maxWidth="7xl">
      <ClientDetailView client={client} projects={projects} />
    </FormPageShell>
  );
}
