import { CheckCircle2, Sparkles } from "lucide-react";

export function AuthMarketingPanel() {
  return (
    <aside
      aria-hidden
      className="relative hidden overflow-hidden border-s border-[var(--border)] lg:flex lg:items-center lg:justify-center"
      style={{
        background:
          "linear-gradient(160deg, var(--accent-soft) 0%, var(--bg-canvas) 70%)",
      }}
    >
      <svg
        className="pointer-events-none absolute inset-0 size-full opacity-25"
        aria-hidden
      >
        <defs>
          <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid)" />
      </svg>

      <div className="relative z-10 w-full max-w-[460px] px-10 xl:px-12">
        <div className="auth-preview-card" style={{ animationDelay: "0ms" }}>
          <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--fg-3)]">
            CraftlyAI · v1
          </div>
          <h2 className="mb-3.5 font-display text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[var(--fg)]">
            Your studio,
            <br />
            running itself in the background.
          </h2>
          <p className="mb-7 max-w-md text-[15px] leading-[1.55] text-[var(--fg-2)]">
            One quiet app for clients, projects, invoices and time. The AI handles the
            busywork — so you can stay in the craft.
          </p>
        </div>

        <div
          className="grid gap-3"
          style={{ transform: "perspective(900px) rotateY(-3deg) rotateX(2deg)" }}
        >
          <PreviewCard delay="120ms">
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-white">
                <Sparkles className="size-[15px]" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-[var(--fg)]">
                  Drafted follow-up for Atlas Studio
                </div>
                <div className="mt-0.5 truncate text-[11px] text-[var(--fg-3)]">
                  Ready in your outbox · INV-2049
                </div>
              </div>
              <span className="shrink-0 rounded-md bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                AI
              </span>
            </div>
          </PreviewCard>

          <PreviewCard delay="220ms" className="ml-8">
            <div className="mb-1 text-[11px] text-[var(--fg-3)]">Revenue this month</div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[22px] font-semibold tracking-[-0.022em] tabular-nums text-[var(--fg)]">
                AED 42,180
              </span>
              <span className="rounded-md bg-[var(--success-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--success)]">
                +18%
              </span>
            </div>
          </PreviewCard>

          <PreviewCard delay="320ms" className="ml-4">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-[18px] shrink-0 text-[var(--success)]" strokeWidth={1.8} />
              <div className="min-w-0 flex-1 truncate text-[13px] text-[var(--fg)]">
                <strong className="font-semibold">Hawthorn &amp; Co</strong>{" "}
                <span className="text-[var(--fg-3)]">paid INV-2051</span>
              </div>
              <span className="shrink-0 text-[13px] font-semibold tabular-nums text-[var(--fg)]">
                +8,400
              </span>
            </div>
          </PreviewCard>
        </div>
      </div>
    </aside>
  );
}

function PreviewCard({
  children,
  delay,
  className,
}: {
  children: React.ReactNode;
  delay: string;
  className?: string;
}) {
  return (
    <div
      className={`auth-preview-card rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3.5 shadow-[var(--shadow-lg)] ${className ?? ""}`}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
}
