import type { Metadata } from "next";
import Link from "next/link";

import { ProjectForm } from "@/components/features/projects/project-form";

export const metadata: Metadata = {
  title: "New project",
};
import { FormPageShell } from "@/components/shared/form-page-shell";
import { listClients } from "@/lib/clients/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default async function NewProjectPage() {
  const clientsResult = await listClients();
  const clients = clientsResult.ok ? clientsResult.clients : [];

  return (
    <FormPageShell maxWidth="2xl">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Link
            href="/projects"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-fit gap-2 px-2 -ms-2",
            )}
          >
            <ArrowLeft />
            Projects
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            New project
          </h1>
          <p className="max-w-lg text-muted-foreground text-sm">
            Connect work to a client, set dates and budget, then break deliverables
            into tasks on the project page.
          </p>
        </div>
        <ProjectForm mode="create" clients={clients} />
      </div>
    </FormPageShell>
  );
}
