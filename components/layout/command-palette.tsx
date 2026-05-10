"use client";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Search CraftlyAI"
      showCloseButton
    >
      <Command>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandEmpty>
            No commands yet. Phase 3 will connect Cmd+K to AI actions and
            navigation.
          </CommandEmpty>
          <CommandGroup heading="Soon">
            <CommandItem disabled>New project</CommandItem>
            <CommandItem disabled>Draft invoice</CommandItem>
            <CommandItem disabled>Open client</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
