import Link from "next/link";
import { redirect } from "next/navigation";

import { ClientsBackendTestPanel } from "@/components/clients-backend-test-panel";
import { listClients } from "@/lib/clients/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Clients backend test · CraftlyAI",
};

export default async function ClientsBackendTestPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const result = await listClients();
  const clients = result.ok ? result.clients : [];

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Dev harness for{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">clients</code>{" "}
          table —{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            createClient
          </code>{" "}
          /{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            listClients
          </code>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Clients backend test
        </h1>
        <p className="text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="text-foreground">{user.email}</span>
        </p>
      </header>

      {!result.ok ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          listClients failed (check migration applied): {result.message}
        </div>
      ) : null}

      <ClientsBackendTestPanel initialClients={clients} />

      <p className="text-xs text-muted-foreground">
        <Link href="/onboarding/client" className="underline underline-offset-4">
          Onboarding · First client
        </Link>
      </p>
    </div>
  );
}
