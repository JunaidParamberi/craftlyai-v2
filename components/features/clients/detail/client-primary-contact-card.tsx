import Link from "next/link";

import type { ClientRow } from "@/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink, Mail, Phone, User } from "lucide-react";

type ClientPrimaryContactCardProps = {
  client: ClientRow;
};

export function ClientPrimaryContactCard({ client }: ClientPrimaryContactCardProps) {
  const mailto =
    client.email && client.email.includes("@")
      ? `mailto:${client.email}`
      : null;
  const tel = client.phone?.trim()
    ? `tel:${client.phone.replace(/\s+/g, "")}`
    : null;

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <CardDescription className="text-xs font-semibold tracking-wide uppercase">
          Primary contact
        </CardDescription>
        {mailto ? (
          <Link
            href={mailto}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Email contact"
          >
            <ExternalLink className="size-4" />
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="size-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base font-medium leading-snug">
              {client.name}
            </CardTitle>
            {client.company ? (
              <p className="text-muted-foreground text-sm">{client.company}</p>
            ) : (
              <p className="text-muted-foreground text-sm">Billing contact</p>
            )}
          </div>
        </div>
        <ul className="flex flex-col gap-3 text-sm">
          {client.email ? (
            <li>
              <a
                href={mailto ?? "#"}
                className={
                  mailto
                    ? "inline-flex items-center gap-2 text-foreground underline-offset-4 hover:underline"
                    : "inline-flex items-center gap-2 text-muted-foreground"
                }
              >
                <Mail className="size-4 shrink-0 opacity-70" />
                <span className="min-w-0 break-all">{client.email}</span>
              </a>
            </li>
          ) : (
            <li className="text-muted-foreground text-xs">No email on file</li>
          )}
          {client.phone?.trim() ? (
            <li>
              <a
                href={tel ?? "#"}
                className="inline-flex items-center gap-2 text-foreground underline-offset-4 hover:underline"
              >
                <Phone className="size-4 shrink-0 opacity-70" />
                {client.phone.trim()}
              </a>
            </li>
          ) : (
            <li className="text-muted-foreground text-xs">No phone on file</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
