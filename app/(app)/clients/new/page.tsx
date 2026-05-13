import type { Metadata } from "next";
import Link from "next/link";

import { ClientForm } from "@/components/features/clients/client-form";

export const metadata: Metadata = {
  title: "New client",
};
import { FormPageShell } from "@/components/shared/form-page-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default function NewClientPage() {
  return (
    <FormPageShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Link
            href="/clients"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-fit gap-2 px-2 -ms-2",
            )}
          >
            <ArrowLeft />
            Clients
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            New client
          </h1>
          <p className="max-w-lg text-muted-foreground text-sm">
            Add someone you bill or work with. You can edit everything later.
          </p>
        </div>
        <ClientForm mode="create" />
      </div>
    </FormPageShell>
  );
}
