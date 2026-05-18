// CraftlyAI — Design System overview page.
// Visual reference for colors, type, spacing, components.

function DesignSystem() {
  const swatchGroups = [
    {
      label: "Surfaces", items: [
        { name: "Canvas",         token: "--bg-canvas",   text: "fg" },
        { name: "Surface",        token: "--bg-surface",  text: "fg" },
        { name: "Subtle",         token: "--bg-subtle",   text: "fg" },
        { name: "Sunken",         token: "--bg-sunken",   text: "fg" },
      ],
    },
    {
      label: "Foreground", items: [
        { name: "Primary",        token: "--fg",          text: "bg" },
        { name: "Secondary",      token: "--fg-2",        text: "bg" },
        { name: "Tertiary",       token: "--fg-3",        text: "bg" },
      ],
    },
    {
      label: "Accent · muted blue", items: [
        { name: "Accent",         token: "--accent",      text: "bg" },
        { name: "Hover",          token: "--accent-hover",text: "bg" },
        { name: "Press",          token: "--accent-press",text: "bg" },
        { name: "Soft",           token: "--accent-soft", text: "accent" },
      ],
    },
    {
      label: "Semantic", items: [
        { name: "Success",        token: "--success",     text: "bg" },
        { name: "Warning",        token: "--warning",     text: "bg" },
        { name: "Danger",         token: "--danger",      text: "bg" },
        { name: "Info",           token: "--info",        text: "bg" },
      ],
    },
  ];

  const typeSamples = [
    { name: "Display / 4xl", size: 38, weight: 600, family: "display", text: "Run the studio in one place" },
    { name: "Display / 3xl", size: 30, weight: 600, family: "display", text: "Beautiful documents, built in seconds" },
    { name: "Display / 2xl", size: 24, weight: 600, family: "display", text: "Section heading" },
    { name: "Display / xl",  size: 20, weight: 600, family: "display", text: "Card title" },
    { name: "Body / md",     size: 15, weight: 400, family: "body",    text: "The quick brown fox jumps over the lazy dog. 12,640 AED · INV-2049." },
    { name: "Body / base",   size: 14, weight: 400, family: "body",    text: "Default UI text — used for nav, table cells, body copy throughout the app." },
    { name: "Body / sm",     size: 12.5, weight: 400, family: "body",  text: "Helper text and meta — captions, timestamps, subdued labels." },
    { name: "Eyebrow",       size: 10.5, weight: 600, family: "body",  text: "EYEBROW LABEL", letter: 0.08, upper: true },
  ];

  return (
    <div className="page">
      <div className="page__header fade-up">
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Design System v0.1 · CraftlyAI</div>
          <h1 className="page__title" style={{ maxWidth: 720, letterSpacing: "-0.03em" }}>
            A calm, focused system for craftspeople who run a studio of one.
          </h1>
          <div className="page__subtitle" style={{ maxWidth: 640 }}>
            Linear-light density, generous whitespace, muted blue accent, Grotesk display + Inter body.
            Every token maps directly to shadcn/ui CSS variables — swap themes by editing one block.
          </div>
        </div>
        <div className="page__actions">
          <span className="badge badge--accent badge--dot">Light + Dark</span>
          <span className="badge badge--outline">shadcn/ui ready</span>
        </div>
      </div>

      {/* ── Foundations row ───────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginBottom: 32 }}>
        {/* Color */}
        <section className="card fade-up delay-1">
          <div className="card__header">
            <div className="card__title">Color</div>
            <span className="dim" style={{ fontSize: 12 }}>4 surfaces · 3 foreground · 4 accent · 4 semantic</span>
          </div>
          <div className="card__body" style={{ display: "grid", gap: 22 }}>
            {swatchGroups.map((g) => (
              <div key={g.label}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>{g.label}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {g.items.map((s) => (
                    <Swatch key={s.token} {...s} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Type */}
        <section className="card fade-up delay-2">
          <div className="card__header">
            <div className="card__title">Type</div>
            <span className="dim" style={{ fontSize: 12 }}>Inter Tight / Inter</span>
          </div>
          <div className="card__body" style={{ display: "grid", gap: 14 }}>
            {typeSamples.map((t) => (
              <div key={t.name} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
                <div className="eyebrow" style={{ marginBottom: 4, fontSize: 10 }}>{t.name}</div>
                <div style={{
                  fontFamily: t.family === "display" ? "var(--font-display)" : "var(--font-body)",
                  fontSize: t.size, fontWeight: t.weight,
                  letterSpacing: t.letter ? `${t.letter}em` : (t.family === "display" ? "-0.018em" : "-0.005em"),
                  textTransform: t.upper ? "uppercase" : "none",
                  lineHeight: t.size > 22 ? 1.1 : 1.4,
                  color: "var(--fg)",
                }}>
                  {t.text}
                </div>
              </div>
            ))}
            <div style={{
              padding: 14, background: "var(--bg-subtle)", borderRadius: 10,
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12,
            }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Display</div>
                <div className="muted">Inter Tight, –0.018em to –0.03em, 600</div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Body</div>
                <div className="muted">Inter, –0.005em, 400/500</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Spacing & Radius ──────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 32 }}>
        <section className="card fade-up">
          <div className="card__header">
            <div className="card__title">Spacing</div>
            <span className="dim" style={{ fontSize: 12 }}>4px base</span>
          </div>
          <div className="card__body" style={{ display: "grid", gap: 10 }}>
            {[
              { name: "1", px: 4 }, { name: "2", px: 8 }, { name: "3", px: 12 },
              { name: "4", px: 16 }, { name: "5", px: 20 }, { name: "6", px: 24 },
              { name: "8", px: 32 }, { name: "12", px: 48 }, { name: "16", px: 64 },
            ].map((s) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12 }}>
                <span className="dim" style={{ width: 40, fontFamily: "var(--font-mono)" }}>--space-{s.name}</span>
                <div style={{ height: 8, width: s.px, background: "var(--accent)", borderRadius: 2 }} />
                <span className="muted tabular">{s.px}px</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card fade-up delay-1">
          <div className="card__header">
            <div className="card__title">Radius</div>
            <span className="dim" style={{ fontSize: 12 }}>Soft, never sharp</span>
          </div>
          <div className="card__body" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { name: "xs",  px: 4 },  { name: "sm",  px: 6 },  { name: "md",  px: 8 },
              { name: "lg",  px: 12 }, { name: "xl",  px: 16 }, { name: "2xl", px: 20 },
            ].map((r) => (
              <div key={r.name} style={{ textAlign: "center" }}>
                <div style={{
                  width: "100%", aspectRatio: "1", background: "var(--bg-subtle)",
                  border: "1px solid var(--border)", borderRadius: r.px, marginBottom: 6,
                }} />
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>{r.name}</div>
                <div className="dim" style={{ fontSize: 11 }}>{r.px}px</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card fade-up delay-2">
          <div className="card__header">
            <div className="card__title">Elevation</div>
            <span className="dim" style={{ fontSize: 12 }}>4 shadow steps</span>
          </div>
          <div className="card__body" style={{ display: "grid", gap: 12 }}>
            {[
              { name: "shadow-xs", val: "var(--shadow-xs)", sub: "Buttons, table rows" },
              { name: "shadow-sm", val: "var(--shadow-sm)", sub: "Cards" },
              { name: "shadow-md", val: "var(--shadow-md)", sub: "Popovers" },
              { name: "shadow-lg", val: "var(--shadow-lg)", sub: "Sheets, modals" },
              { name: "shadow-pop",val: "var(--shadow-pop)",sub: "Cmd+K, dialogs" },
            ].map((e) => (
              <div key={e.name} style={{
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: 10, padding: "12px 14px", boxShadow: e.val,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}>{e.name}</div>
                  <div className="dim" style={{ fontSize: 11 }}>{e.sub}</div>
                </div>
                <Icon.Layers size={14} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Buttons ──────────────────────────────────────────── */}
      <section className="card fade-up" style={{ marginBottom: 24 }}>
        <div className="card__header">
          <div className="card__title">Buttons</div>
          <span className="dim" style={{ fontSize: 12 }}>3 variants × 3 sizes · matches shadcn/ui Button</span>
        </div>
        <div className="card__body" style={{ display: "grid", gap: 18 }}>
          <ComponentRow label="Primary">
            <button className="btn btn--primary btn--sm">Save</button>
            <button className="btn btn--primary">Send invoice</button>
            <button className="btn btn--primary btn--lg"><Icon.Send size={13} />Send invoice</button>
            <button className="btn btn--primary" disabled style={{ opacity: 0.5 }}>Disabled</button>
          </ComponentRow>
          <ComponentRow label="Secondary">
            <button className="btn btn--secondary btn--sm">Edit</button>
            <button className="btn btn--secondary">Download</button>
            <button className="btn btn--secondary btn--lg"><Icon.Download size={13} />Download PDF</button>
            <button className="btn btn--secondary btn--icon"><Icon.More size={14} /></button>
          </ComponentRow>
          <ComponentRow label="Ghost & Danger">
            <button className="btn btn--ghost btn--sm">Cancel</button>
            <button className="btn btn--ghost">Skip</button>
            <button className="btn btn--ghost"><Icon.Sparkles size={13} />Ask AI<span className="kbd" style={{ marginLeft: 4 }}>⌘K</span></button>
            <button className="btn btn--danger">Delete</button>
          </ComponentRow>
        </div>
      </section>

      {/* ── Inputs, Badges, Avatars ─────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, marginBottom: 24 }}>
        <section className="card fade-up">
          <div className="card__header"><div className="card__title">Inputs & forms</div></div>
          <div className="card__body" style={{ display: "grid", gap: 16, maxWidth: 480 }}>
            <div className="field">
              <label className="field__label">Client name</label>
              <input className="input" placeholder="Hawthorn & Co" />
            </div>
            <div className="field">
              <label className="field__label">Email</label>
              <input className="input" defaultValue="theo@hawthorn.co" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field">
                <label className="field__label">Currency</label>
                <div className="input" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>AED · Dirham</span>
                  <Icon.ChevronDown size={13} />
                </div>
              </div>
              <div className="field">
                <label className="field__label">Tax rate</label>
                <input className="input" defaultValue="5%" />
              </div>
            </div>
            <div className="field">
              <label className="field__label">Notes</label>
              <textarea className="input" placeholder="Internal notes…" />
            </div>
          </div>
        </section>

        <div style={{ display: "grid", gap: 20 }}>
          <section className="card fade-up delay-1">
            <div className="card__header"><div className="card__title">Badges & status</div></div>
            <div className="card__body" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["paid","sent","draft","overdue","partially_paid","active","planning","on hold","in_progress","done","todo","high","med","low","approved"].map(s => (
                <StatusBadge key={s} status={s} />
              ))}
            </div>
          </section>
          <section className="card fade-up delay-2">
            <div className="card__header"><div className="card__title">Avatars & rings</div></div>
            <div className="card__body" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <Avatar name="Lena Marchetti" size={36} />
              <Avatar name="Theo Bramwell" size={36} />
              <Avatar name="Priya Anand" size={36} />
              <Avatar name="Sara Berger" size={36} />
              <Avatar name="Reza Khalil" size={36} />
              <div style={{ width: 1, height: 32, background: "var(--border)", margin: "0 4px" }} />
              <HealthRing score={92} size={40} />
              <HealthRing score={73} size={40} />
              <HealthRing score={41} size={40} />
            </div>
          </section>
        </div>
      </div>

      {/* ── Cards, tabs, table preview ──────────────────────── */}
      <section className="card fade-up" style={{ marginBottom: 24 }}>
        <div className="card__header">
          <div className="card__title">Composition patterns</div>
          <span className="dim" style={{ fontSize: 12 }}>How tokens become product surface</span>
        </div>
        <div className="card__body" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {/* KPI sample */}
          <KPICard kpi={MockData.kpis.revenue} />

          {/* Attention item sample */}
          <div style={{
            background: "var(--warning-soft)", border: "1px solid transparent",
            borderRadius: 12, padding: 16, display: "flex", gap: 12,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(179, 106, 18, 0.15)", color: "var(--warning)",
              display: "grid", placeItems: "center",
            }}>
              <Icon.AlertCircle size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--warning)", marginBottom: 2 }}>
                Invoice INV-2049 overdue
              </div>
              <div className="dim" style={{ fontSize: 12 }}>Atlas Studio · AED 2,850</div>
            </div>
          </div>

          {/* Activity sample */}
          <div className="card" style={{ padding: 12, boxShadow: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name="Hawthorn & Co" size={28} />
              <div style={{ flex: 1, fontSize: 13 }}>
                <strong>Hawthorn & Co</strong> paid <span className="muted">INV-2051</span>
                <div className="dim" style={{ fontSize: 11.5, marginTop: 2 }}>12m ago</div>
              </div>
              <span className="badge badge--success">+AED 8,400</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs preview ────────────────────────────────────── */}
      <section className="card fade-up" style={{ marginBottom: 24 }}>
        <div className="card__header"><div className="card__title">Tabs</div></div>
        <div className="card__body">
          <div className="tabs" style={{ marginBottom: 12 }}>
            <div className="tabs__item" data-active="true">Overview <span className="tabs__count">8</span></div>
            <div className="tabs__item">Documents <span className="tabs__count">14</span></div>
            <div className="tabs__item">Activity</div>
            <div className="tabs__item">Notes</div>
            <div className="tabs__item">Settings</div>
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            Tabs use a 1.5px underline that aligns to the divider. Counts use a pill on the right.
          </div>
        </div>
      </section>

      {/* ── Skeletons & Loaders ─────────────────────────────── */}
      <SkeletonsAndLoadersSection />

      {/* ── shadcn mapping ──────────────────────────────────── */}
      <section className="card fade-up" style={{ background: "var(--bg-subtle)", borderStyle: "dashed" }}>
        <div className="card__header">
          <div className="card__title">shadcn/ui mapping</div>
          <span className="dim" style={{ fontSize: 12 }}>Drop into <code>globals.css</code> and tailwind config</span>
        </div>
        <div className="card__body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Token → shadcn</div>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: 6, fontSize: 12.5, fontFamily: "var(--font-mono)" }}>
              <ShadRow a="--bg-canvas"   b="--background" />
              <ShadRow a="--bg-surface"  b="--card / --popover" />
              <ShadRow a="--bg-subtle"   b="--muted / --secondary" />
              <ShadRow a="--fg"          b="--foreground / --card-foreground" />
              <ShadRow a="--fg-2"        b="--muted-foreground" />
              <ShadRow a="--accent"      b="--primary" />
              <ShadRow a="--accent-soft" b="--accent" />
              <ShadRow a="--border"      b="--border / --input" />
              <ShadRow a="--border-focus"b="--ring" />
              <ShadRow a="--danger"      b="--destructive" />
            </ul>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Rules</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.7, color: "var(--fg-2)" }}>
              <li>Borders are <strong>always</strong> 1px solid <code>--border</code>. No double-borders.</li>
              <li>Cards use <code>--shadow-xs</code> at rest, <code>--shadow-sm</code> on hover.</li>
              <li>Buttons default to 30px height; <code>sm</code> 26px, <code>lg</code> 38px.</li>
              <li>Focus state: 3px outer ring (<code>--accent-ring</code>) + 1px <code>--border-focus</code> border.</li>
              <li>Never use pure black/white. Foreground is <code>#14161A</code> (light) / <code>#ECEDEF</code> (dark).</li>
              <li>Stroke width on icons is <code>1.6</code> — slightly thinner than Lucide default for a calmer feel.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function Swatch({ name, token, text }) {
  const bg = `var(${token})`;
  const fg = text === "fg" ? "var(--fg)" : text === "accent" ? "var(--accent)" : "var(--fg-on-accent)";
  return (
    <div style={{
      background: bg, color: fg, borderRadius: 10,
      border: "1px solid var(--border)", padding: 12, aspectRatio: "1.4",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
    }}>
      <div style={{ fontSize: 12, fontWeight: 500 }}>{name}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, opacity: 0.75 }}>{token}</div>
    </div>
  );
}

function ComponentRow({ label, children }) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>{children}</div>
    </div>
  );
}

function ShadRow({ a, b }) {
  return (
    <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: "var(--accent)" }}>{a}</span>
      <span style={{ color: "var(--fg-3)" }}>→</span>
      <span className="muted">{b}</span>
    </li>
  );
}

// ──────────────────────────────────────────────────────────
// Skeletons & Loaders — visual reference + live demo.
// ──────────────────────────────────────────────────────────
function SkeletonsAndLoadersSection() {
  const [demoLoading, setDemoLoading] = React.useState(true);
  const [btnLoading, setBtnLoading]   = React.useState(false);

  // Auto-cycle the in-context demo so the page tells a story without clicks.
  React.useEffect(() => {
    const t = setInterval(() => setDemoLoading((v) => !v), 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="card fade-up" style={{ marginBottom: 24 }}>
      <div className="card__header">
        <div>
          <div className="card__title">Skeletons & loaders</div>
          <div className="dim" style={{ fontSize: 12, marginTop: 2 }}>
            Shimmer placeholders for data fetches · active indicators for known work
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span className="dim" style={{ fontSize: 11.5 }}>
            {demoLoading ? "Loading state" : "Loaded state"} · auto-cycles
          </span>
          <button
            className="btn btn--secondary btn--sm"
            onClick={() => setDemoLoading((v) => !v)}
          >
            Toggle
          </button>
        </div>
      </div>

      <div className="card__body" style={{ display: "grid", gap: 22 }}>
        {/* — Loaders row — */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Active loaders</div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 10,
          }}>
            <LoaderTile name="Spinner · sm">
              <Spinner size="sm" />
            </LoaderTile>
            <LoaderTile name="Spinner · md">
              <Spinner size="md" />
            </LoaderTile>
            <LoaderTile name="Spinner · lg">
              <Spinner size="lg" />
            </LoaderTile>
            <LoaderTile name="Dot pulse">
              <DotPulse />
            </LoaderTile>
            <LoaderTile name="Dot pulse · accent">
              <DotPulse accent />
            </LoaderTile>

            <LoaderTile name="AI thinking" span={2}>
              <AIThinking label="Drafting reply" />
            </LoaderTile>
            <LoaderTile name="Inline loader" span={2}>
              <InlineLoader label="Saving changes" />
            </LoaderTile>
            <LoaderTile name="On-accent" span={1}>
              <button className="btn btn--primary btn--sm" disabled style={{ opacity: 1 }}>
                <Spinner size="sm" tone="on-accent" /> Sending
              </button>
            </LoaderTile>
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Indeterminate progress</div>
            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: 10, padding: 14, display: "grid", gap: 10,
            }}>
              <ProgressIndeterminate />
              <div className="dim" style={{ fontSize: 11.5 }}>
                Used on page headers and table headers during background syncs — calmer than a spinner.
              </div>
            </div>
          </div>
        </div>

        <hr />

        {/* — Skeleton primitives — */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Skeleton primitives</div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}>
            <SkelTile name="text · 3 lines">
              <SkeletonText lines={3} />
            </SkelTile>
            <SkelTile name="text · large">
              <div style={{ display: "grid", gap: 8 }}>
                <Skeleton variant="textLg" w="80%" />
                <Skeleton variant="text" w="62%" />
              </div>
            </SkelTile>
            <SkelTile name="avatar + meta">
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <SkeletonAvatar size={32} />
                <div style={{ flex: 1, display: "grid", gap: 6 }}>
                  <Skeleton variant="text" w="70%" />
                  <Skeleton variant="text" h={9} w="40%" />
                </div>
              </div>
            </SkelTile>
            <SkelTile name="block + pill">
              <div style={{ display: "grid", gap: 8 }}>
                <Skeleton variant="block" h={56} />
                <div style={{ display: "flex", gap: 6 }}>
                  <Skeleton variant="text" w={56} h={14} r={99} />
                  <Skeleton variant="text" w={44} h={14} r={99} />
                </div>
              </div>
            </SkelTile>
          </div>
        </div>

        <hr />

        {/* — Composite: KPI loading vs loaded side-by-side — */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Composites · loading ↔ loaded</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {demoLoading ? (
              <>
                <SkeletonKPI />
                <SkeletonKPI />
                <SkeletonKPI />
                <SkeletonKPI />
              </>
            ) : (
              <>
                <KPICard kpi={MockData.kpis.revenue} />
                <KPICard kpi={MockData.kpis.outstanding} />
                <KPICard kpi={MockData.kpis.overdue} />
                <KPICard kpi={MockData.kpis.avgPay} />
              </>
            )}
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "1.4fr 1fr",
            gap: 12, marginTop: 12,
          }}>
            {/* Chart card */}
            <div className="card">
              <div className="card__header">
                <div className="card__title">Revenue</div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="btn btn--ghost btn--sm" data-active="true" style={{ background: "var(--bg-subtle)" }}>6M</button>
                  <button className="btn btn--ghost btn--sm">1Y</button>
                </div>
              </div>
              <div className="card__body" style={{ paddingBottom: 8 }}>
                {demoLoading
                  ? <SkeletonChart height={210} />
                  : <AreaChart data={MockData.revenueByMonth} height={210} />}
              </div>
            </div>

            {/* Activity card */}
            <div className="card" style={{ display: "flex", flexDirection: "column" }}>
              <div className="card__header">
                <div className="card__title">Activity</div>
                {demoLoading
                  ? <DotPulse />
                  : <button className="btn btn--ghost btn--sm">View all</button>}
              </div>
              <div style={{ flex: 1, padding: "4px 0" }}>
                {demoLoading
                  ? <SkeletonList count={5} />
                  : MockData.activity.slice(0, 5).map((v) => <MiniActivityRow key={v.id} v={v} />)}
              </div>
            </div>
          </div>
        </div>

        <hr />

        {/* — Table skeleton — */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Table loading</div>
          <div className="table--card">
            <table className="table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th style={{ textAlign: "right" }}>Value</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {demoLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={6} />)
                ) : (
                  MockData.pipeline.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className={`status-dot status-dot--${p.risk === "high" ? "danger" : p.risk === "med" ? "warning" : "muted"}`} />
                          <span style={{ fontWeight: 500 }}>{p.title}</span>
                        </div>
                      </td>
                      <td><span className="muted">{p.client}</span></td>
                      <td><StatusBadge status={p.status} /></td>
                      <td style={{ width: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Progress value={p.progress} />
                          <span className="dim tabular" style={{ fontSize: 11, minWidth: 30 }}>{Math.round(p.progress * 100)}%</span>
                        </div>
                      </td>
                      <td className="tabular" style={{ textAlign: "right", fontWeight: 500 }}>{p.value}</td>
                      <td><span className="muted">{p.deadline}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <hr />

        {/* — Button loading states — */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Buttons · loading state</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <ButtonLoading
              className="btn btn--primary"
              loading={btnLoading}
              onClick={() => { setBtnLoading(true); setTimeout(() => setBtnLoading(false), 1600); }}
            >
              <Icon.Send size={13} />
              Send invoice
            </ButtonLoading>
            <ButtonLoading className="btn btn--secondary" loading={btnLoading}>
              <Icon.Download size={13} />
              Download PDF
            </ButtonLoading>
            <ButtonLoading className="btn btn--ghost" loading={btnLoading}>
              Cancel
            </ButtonLoading>
            <span className="dim" style={{ fontSize: 12, marginLeft: 8 }}>
              Width is preserved · label is hidden, not removed.
              {btnLoading ? " Working…" : " Click ‘Send invoice’ to try."}
            </span>
          </div>
        </div>

        <hr />

        {/* — When to use what — */}
        <div style={{
          background: "var(--bg-subtle)", borderRadius: 10, padding: 16,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18,
        }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Reach for a skeleton when…</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.7, color: "var(--fg-2)" }}>
              <li>Initial page load — server data hasn’t arrived.</li>
              <li>The final layout is <strong>known</strong> and the skeleton can mirror it.</li>
              <li>Wait is likely to exceed 400ms.</li>
              <li>Multiple regions are loading independently.</li>
            </ul>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Reach for a loader when…</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.7, color: "var(--fg-2)" }}>
              <li>User triggered the work (save, send, refresh).</li>
              <li>An AI task is running — use <strong>AI thinking</strong>, not a spinner.</li>
              <li>Inside a button — use <code>ButtonLoading</code>, keep the label width.</li>
              <li>Background sync — use the indeterminate bar, not a spinner.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function LoaderTile({ name, children, span = 1 }) {
  return (
    <div style={{
      gridColumn: `span ${span}`,
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: 16,
      display: "flex", flexDirection: "column", gap: 10,
      alignItems: "flex-start",
      minHeight: 84,
      justifyContent: "space-between",
    }}>
      <div style={{ minHeight: 24, display: "flex", alignItems: "center" }}>
        {children}
      </div>
      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg-3)" }}>
        {name}
      </div>
    </div>
  );
}

function SkelTile({ name, children }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: 16,
      display: "flex", flexDirection: "column", gap: 12,
      minHeight: 110,
    }}>
      <div style={{ flex: 1 }}>{children}</div>
      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg-3)" }}>
        {name}
      </div>
    </div>
  );
}

// Compact activity row used inside the loading↔loaded demo
function MiniActivityRow({ v }) {
  const icon = {
    payment: { I: Icon.DollarSign, tone: "var(--success)" },
    view:    { I: Icon.Eye,        tone: "var(--info)" },
    doc:     { I: Icon.FileText,   tone: "var(--fg-2)" },
    approved:{ I: Icon.CircleCheck,tone: "var(--success)" },
    time:    { I: Icon.Timer,      tone: "var(--fg-2)" },
    comment: { I: Icon.Quote,      tone: "var(--fg-2)" },
  }[v.type] || { I: Icon.Info, tone: "var(--fg-2)" };
  const I = icon.I;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 16px", borderBottom: "1px solid var(--border)",
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7,
        background: "var(--bg-subtle)", color: icon.tone,
        display: "grid", placeItems: "center", flexShrink: 0,
      }}>
        <I size={13} />
      </div>
      <div style={{ flex: 1, minWidth: 0, fontSize: 13 }}>
        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <strong style={{ fontWeight: 500 }}>{v.who}</strong> <span className="muted">{v.text}</span>
        </div>
        <div className="dim" style={{ fontSize: 11.5, marginTop: 1 }}>{v.when}</div>
      </div>
    </div>
  );
}

window.Screens = window.Screens || {};
window.Screens.DesignSystem = DesignSystem;
