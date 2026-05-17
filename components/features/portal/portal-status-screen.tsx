type PortalStatusScreenProps = {
  title: string;
  message: string;
  variant?: "success" | "neutral";
};

export function PortalStatusScreen({
  title,
  message,
  variant = "neutral",
}: PortalStatusScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        {variant === "success" ? (
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success,#1F8A52)_12%,transparent)]">
            <svg
              className="size-7 text-[var(--success,#1F8A52)]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
        ) : null}
        <p className="font-display text-2xl font-semibold text-foreground">
          {title}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
