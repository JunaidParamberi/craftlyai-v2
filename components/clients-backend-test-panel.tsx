"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  createClient,
  type CreateClientResult,
  listClients,
  type ListClientsResult,
} from "@/lib/clients/actions";
import type { ClientRow } from "@/types";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  initialClients: ClientRow[];
};

export function ClientsBackendTestPanel({ initialClients }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clients, setClients] = useState<ClientRow[]>(initialClients);
  const [lastListResult, setLastListResult] = useState<ListClientsResult | null>(
    null,
  );
  const [lastCreateResult, setLastCreateResult] =
    useState<CreateClientResult | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("");
  const [notes, setNotes] = useState("");

  const panelKey = useMemo(
    () => clients.map((c) => c.updated_at).join("|") || "empty",
    [clients],
  );

  function refreshList() {
    startTransition(async () => {
      const result = await listClients();
      setLastListResult(result);
      if (result.ok) {
        setClients(result.clients);
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLastCreateResult(null);
    startTransition(async () => {
      const result = await createClient({
        name,
        email,
        phone,
        company,
        address,
        currency,
        notes,
      });
      setLastCreateResult(result);
      if (result.ok) {
        setName("");
        setEmail("");
        setPhone("");
        setCompany("");
        setAddress("");
        setCurrency("");
        setNotes("");
        router.refresh();
        const list = await listClients();
        setLastListResult(list);
        if (list.ok) {
          setClients(list.clients);
        }
      }
    });
  }

  return (
    <div key={panelKey} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          Insert via{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            createClient()
          </code>
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="client-name">Name *</Label>
              <Input
                id="client-name"
                name="name"
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                placeholder="Acme Ltd"
                autoComplete="organization"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                name="email"
                type="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                placeholder="billing@example.com"
              />
              {lastCreateResult?.ok === false &&
              lastCreateResult.fieldErrors?.email?.length ? (
                <p className="text-xs text-destructive">
                  {lastCreateResult.fieldErrors.email.join(", ")}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="client-phone">Phone</Label>
              <Input
                id="client-phone"
                name="phone"
                value={phone}
                onChange={(ev) => setPhone(ev.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="client-company">Company</Label>
              <Input
                id="client-company"
                name="company"
                value={company}
                onChange={(ev) => setCompany(ev.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="client-address">Address</Label>
              <Input
                id="client-address"
                name="address"
                value={address}
                onChange={(ev) => setAddress(ev.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="client-currency">Currency (ISO 4217)</Label>
              <Input
                id="client-currency"
                name="currency"
                value={currency}
                onChange={(ev) =>
                  setCurrency(ev.target.value.toUpperCase().slice(0, 3))
                }
                placeholder="USD"
                maxLength={3}
                autoComplete="off"
              />
              {lastCreateResult?.ok === false &&
              lastCreateResult.fieldErrors?.currency?.length ? (
                <p className="text-xs text-destructive">
                  {lastCreateResult.fieldErrors.currency.join(", ")}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="client-notes">Notes</Label>
              <Input
                id="client-notes"
                name="notes"
                value={notes}
                onChange={(ev) => setNotes(ev.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Create client"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={refreshList}
            >
              Refresh list
            </Button>
          </div>
        </form>

        {lastCreateResult && !lastCreateResult.ok ? (
          <div
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {lastCreateResult.message}
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Rows for your user (
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              listClients
            </code>
            )
          </h2>
          <span className="text-xs text-muted-foreground">
            {clients.length} row(s)
          </span>
        </div>
        {!lastListResult?.ok && lastListResult !== null ? (
          <div
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            listClients failed:{" "}
            {!lastListResult.ok ? lastListResult.message : ""}
          </div>
        ) : null}
        <pre className="max-h-96 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs">
          {JSON.stringify(clients, null, 2)}
        </pre>
      </section>

      {lastCreateResult?.ok ? (
        <section className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Last create response
          </p>
          <pre
            className={cn(
              "max-h-64 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs",
              "border-emerald-500/30 bg-emerald-500/5",
            )}
          >
            {JSON.stringify(lastCreateResult, null, 2)}
          </pre>
        </section>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Remove this route before production or protect behind an env flag.{" "}
        <Link href="/profile-test" className="underline underline-offset-4">
          Profile test
        </Link>
        {" · "}
        <Link href="/dashboard" className="underline underline-offset-4">
          Protected home
        </Link>
      </p>
    </div>
  );
}
