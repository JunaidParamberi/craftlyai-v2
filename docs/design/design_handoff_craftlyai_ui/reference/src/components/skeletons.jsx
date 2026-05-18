// CraftlyAI — Skeletons & Loaders
// Two families:
//   1. Skeletons: low-energy shimmer placeholders that match the shape of content.
//   2. Loaders:   active indicators when we KNOW work is happening (spinner, dots, AI thinking, indeterminate bar).
//
// Rule of thumb:
//   - Server data render? -> Skeleton matching final layout.
//   - Background AI task / form submit / refresh? -> Loader.
//   - Don't combine both; pick one per surface.

const { useState: useStateSk } = React;

// ───────────────────────────────────────────────── BASE ──
// Generic shimmer block. Use width/height/radius props for one-offs;
// reach for the named variants below for common shapes.
function Skeleton({ w, h = 12, r, variant, style, className = "", pulse = false }) {
  const cls = [
    "skeleton",
    pulse && "skeleton--pulse",
    variant === "text"   && "skeleton--text",
    variant === "textLg" && "skeleton--text-lg",
    variant === "circle" && "skeleton--circle",
    variant === "block"  && "skeleton--block",
    className,
  ].filter(Boolean).join(" ");
  return (
    <span
      className={cls}
      style={{
        width: w ?? "100%",
        height: h,
        borderRadius: r,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

// Multiple text lines, last line shorter — mimics a paragraph.
function SkeletonText({ lines = 3, lastWidth = "62%", lineHeight = 11, gap = 8 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          h={lineHeight}
          w={i === lines - 1 ? lastWidth : "100%"}
        />
      ))}
    </div>
  );
}

// Avatar circle.
function SkeletonAvatar({ size = 28 }) {
  return <Skeleton variant="circle" w={size} h={size} />;
}

// ───────────────────────────────────────── COMPOSITES ──
// These mirror the real components 1:1 so swapping them in feels seamless.

function SkeletonKPI() {
  return (
    <div className="card" style={{ padding: 18 }}>
      <Skeleton variant="text" h={11} w={80} style={{ marginBottom: 12 }} />
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <Skeleton variant="text" h={22} w={120} />
        <Skeleton variant="text" h={14} w={42} r={99} />
      </div>
      <Skeleton variant="text" h={10} w="55%" style={{ marginTop: 12 }} />
    </div>
  );
}

function SkeletonListRow({ withAvatar = true, withMeta = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
      {withAvatar && <Skeleton variant="circle" w={28} h={28} />}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <Skeleton variant="text" h={11} w="68%" />
        {withMeta && <Skeleton variant="text" h={9} w="34%" />}
      </div>
      <Skeleton variant="text" h={14} w={56} r={99} />
    </div>
  );
}

function SkeletonTableRow({ cols = 6 }) {
  // Distribution: first cell wider (title), middle cells medium, last short
  const widths = [
    "70%", "50%", 64, 110, 70, 56,
  ];
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <Skeleton variant="text" h={11} w={widths[i] ?? "60%"} />
        </td>
      ))}
    </tr>
  );
}

function SkeletonTable({ rows = 5, cols = 6, headers }) {
  return (
    <table className="table">
      {headers && (
        <thead>
          <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
      )}
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} cols={cols} />
        ))}
      </tbody>
    </table>
  );
}

// SVG-shaped chart skeleton — looks like a real line/area chart while loading.
function SkeletonChart({ height = 180 }) {
  const w = 600;
  // hand-picked "calm" silhouette so it doesn't look like noise
  const ys = [0.6, 0.55, 0.7, 0.5, 0.62, 0.4, 0.48];
  const padL = 36, padR = 10, padT = 14, padB = 22;
  const innerW = w - padL - padR;
  const innerH = height - padT - padB;
  const xStep = innerW / (ys.length - 1);
  const pts = ys.map((y, i) => [padL + i * xStep, padT + y * innerH]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1][0]} ${padT + innerH} L ${pts[0][0]} ${padT + innerH} Z`;
  const gridYs = [0, 0.33, 0.66, 1].map(t => padT + innerH * t);
  return (
    <div className="skeleton" style={{
      width: "100%", height, background: "transparent",
      animation: "skeleton-pulse 1.6s var(--ease-in-out) infinite",
      backgroundImage: "none",
    }} aria-hidden="true">
      <svg viewBox={`0 0 ${w} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {gridYs.map((y, i) => (
          <line key={i} x1={padL} x2={w - padR} y1={y} y2={y}
                stroke="var(--border)" strokeDasharray="2 4" />
        ))}
        <path d={area} fill="var(--bg-subtle)" />
        <path d={line} stroke="var(--border-strong)" strokeWidth="1.6" fill="none" />
      </svg>
    </div>
  );
}

// Activity / pane item style stack
function SkeletonList({ count = 5, withAvatar = true }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListRow key={i} withAvatar={withAvatar} withMeta={i % 2 === 0} />
      ))}
    </div>
  );
}

// Generic card with header + body — for placeholder panels
function SkeletonCard({ title = true, body = true, lines = 3, height }) {
  return (
    <div className="card" style={{ height }}>
      {title && (
        <div className="card__header">
          <Skeleton variant="text" h={13} w={140} />
          <Skeleton variant="text" h={11} w={56} r={99} />
        </div>
      )}
      {body && (
        <div className="card__body">
          <SkeletonText lines={lines} />
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────── LOADERS ──

function Spinner({ size = "md", tone }) {
  const cls = [
    "spinner",
    `spinner--${size}`,
    tone === "muted"     && "spinner--muted",
    tone === "on-accent" && "spinner--on-accent",
  ].filter(Boolean).join(" ");
  return <span className={cls} role="status" aria-label="Loading" />;
}

function DotPulse({ accent = false }) {
  return (
    <span className={`dot-pulse ${accent ? "dot-pulse--accent" : ""}`} role="status" aria-label="Working">
      <span></span><span></span><span></span>
    </span>
  );
}

function ProgressIndeterminate({ style }) {
  return <div className="progress-indet" style={style} role="progressbar" aria-busy="true" />;
}

// "Thinking..." indicator for AI surfaces — sparkle + accent shimmer text.
function AIThinking({ label = "Thinking", size = 15 }) {
  return (
    <span className="ai-thinking" style={{ fontSize: size }} role="status">
      <span className="ai-thinking__icon" style={{ display: "inline-flex" }}>
        <Icon.Sparkles size={Math.round(size * 0.95)} />
      </span>
      <span className="ai-thinking__text">{label}…</span>
    </span>
  );
}

// Inline label + spinner — for buttons/forms ("Saving…")
function InlineLoader({ label = "Loading", spinnerSize = "sm" }) {
  return (
    <span className="inline-loader">
      <Spinner size={spinnerSize} tone="muted" />
      {label}…
    </span>
  );
}

// Button-internal loader: wraps children, swaps them for a spinner when loading=true,
// keeps width by rendering children invisibly.
function ButtonLoading({ loading, children, ...rest }) {
  return (
    <button {...rest} disabled={loading || rest.disabled} style={{ position: "relative", ...rest.style }}>
      <span style={{ visibility: loading ? "hidden" : "visible", display: "inline-flex", alignItems: "center", gap: 6 }}>
        {children}
      </span>
      {loading && (
        <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <Spinner size="sm" tone={rest.className?.includes("btn--primary") ? "on-accent" : "muted"} />
        </span>
      )}
    </button>
  );
}

Object.assign(window, {
  Skeleton, SkeletonText, SkeletonAvatar,
  SkeletonKPI, SkeletonListRow, SkeletonList,
  SkeletonTableRow, SkeletonTable, SkeletonChart, SkeletonCard,
  Spinner, DotPulse, ProgressIndeterminate, AIThinking, InlineLoader, ButtonLoading,
});
