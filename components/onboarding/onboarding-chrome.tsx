import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  step: 1 | 2 | 3;
  stepLabel: string;
  children: ReactNode;
};

export function OnboardingChrome({ step, stepLabel, children }: Props) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b border-border px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="shrink-0 text-sm text-muted-foreground">
            Step {step} of 3
          </p>
          <div className="flex flex-1 justify-center px-0 md:px-8">
            <div className="flex w-full max-w-md gap-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    s <= step ? "bg-primary" : "bg-muted",
                  )}
                />
              ))}
            </div>
          </div>
          <p className="shrink-0 text-right text-sm text-muted-foreground md:min-w-[9rem]">
            {stepLabel}
          </p>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-10 md:px-8">
        <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
