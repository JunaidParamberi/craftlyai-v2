import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientForm } from "@/components/features/clients/client-form";
import { FormPageShell } from "@/components/shared/form-page-shell";
import { getClientById } from "@/lib/clients/actions";
import { clientRowToFormValues } from "@/lib/clients/form-values";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) {
    notFound();
  }

  const formDefaults = clientRowToFormValues(client);

  return (
    <FormPageShell maxWidth="2xl">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Link
            href={`/clients/${client.id}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-fit gap-2 px-2 -ms-2",
            )}
          >
            <ArrowLeft />
            Back to client
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Edit client
          </h1>
          <p className="max-w-lg text-muted-foreground text-sm">
            Update billing and contact details. Changes appear on the client
            profile immediately.
          </p>
        </div>
        <ClientForm
          mode="edit"
          clientId={client.id}
          defaultValues={formDefaults}
        />
      </div>
    </FormPageShell>
  );
}
