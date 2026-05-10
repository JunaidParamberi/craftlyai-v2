import { Skeleton } from "@/components/ui/skeleton";

export default function OnboardingLoading() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b border-border px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-4 w-24 shrink-0" />
          <div className="flex flex-1 justify-center px-0 md:px-8">
            <div className="flex w-full max-w-md gap-1">
              {[1, 2, 3].map((s) => (
                <Skeleton key={s} className="h-1.5 flex-1 rounded-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-4 w-32 shrink-0 md:min-w-[9rem]" />
        </div>
      </header>
      <div className="flex flex-1 flex-col px-4 py-10 md:px-8">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
          <Skeleton className="mx-auto h-9 w-72 max-w-full" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
