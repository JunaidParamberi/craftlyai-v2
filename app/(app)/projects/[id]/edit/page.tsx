import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/features/projects/project-form";
import { FormPageShell } from "@/components/shared/form-page-shell";
import { listClients } from "@/lib/clients/actions";
import { projectRowToFormValues } from "@/lib/projects/form-values";
import { getProjectById } from "@/lib/projects/actions";
import { pageTitle } from "@/lib/metadata";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);
  return {
    title: project ? pageTitle("Edit", project.title) : "Edit",
  };
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) {
    notFound();
  }

  const clientsResult = await listClients();
  const clients = clientsResult.ok ? clientsResult.clients : [];
  const formDefaults = projectRowToFormValues(project);

  return (
    <FormPageShell maxWidth="2xl">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Link
            href={`/projects/${project.id}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-fit gap-2 px-2 -ms-2",
            )}
          >
            <ArrowLeft />
            Back to project
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Edit project
          </h1>
          <p className="max-w-lg text-muted-foreground text-sm">
            Update title, client link, status, and dates. Task work stays on the
            project page.
          </p>
        </div>
        <ProjectForm
          mode="edit"
          projectId={project.id}
          clients={clients}
          defaultValues={formDefaults}
        />
      </div>
    </FormPageShell>
  );
}
