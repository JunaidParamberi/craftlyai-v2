"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteClient } from "@/lib/clients/client-mutations";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteClientButtonProps = {
  clientId: string;
  clientName: string;
};

export function DeleteClientButton({
  clientId,
  clientName,
}: DeleteClientButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteClient(clientId);
      if (!result.ok) {
        setError(result.message);
        toast.error(result.message ?? "Failed to delete client.");
        return;
      }
      setOpen(false);
      toast.success("Client deleted");
      router.push("/clients");
      router.refresh();
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        Delete client
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Delete this client?</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">{clientName}</span>{" "}
              from your workspace. You can add them again later.
            </DialogDescription>
          </DialogHeader>
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
