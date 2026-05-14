"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface QuoteRespondFormProps {
  approvalToken: string;
}

type FormStatus = "idle" | "loading" | "approved" | "declined" | "error";

export function QuoteRespondForm({ approvalToken }: QuoteRespondFormProps) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [, startTransition] = useTransition();

  const handleRespond = (action: "approve" | "decline") => {
    setStatus("loading");
    startTransition(async () => {
      try {
        const res = await fetch("/api/quotes/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approval_token: approvalToken,
            action,
            message: message.trim() || undefined,
          }),
        });

        if (res.ok) {
          setStatus(action === "approve" ? "approved" : "declined");
        } else if (res.status === 409) {
          setStatus("error");
          setErrorMessage("This quote has already been responded to.");
        } else {
          const data = await res.json().catch(() => ({}));
          setStatus("error");
          setErrorMessage((data as { error?: string }).error ?? "Something went wrong.");
        }
      } catch {
        setStatus("error");
        setErrorMessage("Network error. Please try again.");
      }
    });
  };

  if (status === "approved") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle2 className="size-6 text-emerald-600" />
        </div>
        <p className="font-semibold text-foreground">Quote approved!</p>
        <p className="text-sm text-muted-foreground">
          The sender has been notified.
        </p>
      </div>
    );
  }

  if (status === "declined") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <XCircle className="size-6 text-muted-foreground" />
        </div>
        <p className="font-semibold text-foreground">Quote declined.</p>
        <p className="text-sm text-muted-foreground">
          The sender has been notified.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="approval-message">
          Message{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="approval-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a note for the sender…"
          rows={3}
          disabled={status === "loading"}
        />
      </div>

      {status === "error" ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <div className="flex gap-3">
        <Button
          onClick={() => handleRespond("approve")}
          disabled={status === "loading"}
          className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <CheckCircle2 className="size-4" />
          Approve
        </Button>
        <Button
          variant="outline"
          onClick={() => handleRespond("decline")}
          disabled={status === "loading"}
          className="flex-1 gap-2"
        >
          <XCircle className="size-4" />
          Decline
        </Button>
      </div>
    </div>
  );
}
