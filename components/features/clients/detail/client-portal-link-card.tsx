"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Check, Copy, Link2, RefreshCw } from "lucide-react";

import {
  ensurePortalToken,
  regeneratePortalToken,
} from "@/lib/clients/portal-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ClientPortalLinkCardProps = {
  clientId: string;
  initialPortalToken: string | null;
};

export function ClientPortalLinkCard({
  clientId,
  initialPortalToken,
}: ClientPortalLinkCardProps) {
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const loadUrl = useCallback(async () => {
    const result = await ensurePortalToken(clientId);
    if (result.ok) {
      setPortalUrl(result.portalUrl);
      setError(null);
    } else {
      setError(result.error);
    }
  }, [clientId]);

  useEffect(() => {
    if (initialPortalToken) {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      setPortalUrl(`${appUrl}/portal/${initialPortalToken}`);
    } else {
      void loadUrl();
    }
  }, [initialPortalToken, loadUrl]);

  async function handleCopy() {
    if (!portalUrl) return;
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  function handleRegenerate() {
    startTransition(async () => {
      const result = await regeneratePortalToken(clientId);
      if (result.ok) {
        setPortalUrl(result.portalUrl);
        setError(null);
        setRegenerateOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="size-4 text-muted-foreground" />
          Client portal
        </CardTitle>
        <CardDescription>
          Share this link with your client—no login required. They can view
          documents and pay invoices.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-3 py-2 font-mono text-xs">
            {portalUrl ?? (pending ? "Loading…" : "—")}
          </code>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!portalUrl || pending}
              onClick={() => void handleCopy()}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => setRegenerateOpen(true)}
            >
              <RefreshCw className="size-4" />
              Regenerate
            </Button>
          </div>
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>

      <Dialog open={regenerateOpen} onOpenChange={setRegenerateOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Regenerate portal link?</DialogTitle>
            <DialogDescription>
              The current link will stop working. Anyone with the old link will
              need the new URL.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRegenerateOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleRegenerate} disabled={pending}>
              {pending ? "Regenerating…" : "Regenerate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
