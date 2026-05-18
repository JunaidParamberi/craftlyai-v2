// CraftlyAI — small shared building blocks used across screens.
const { useState, useEffect, useRef, useMemo } = React;

// ------- Avatar with deterministic muted color -------
function Avatar({ name, size = 28, src = null }) {
  const initials = (name || "?")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const palette = [
    ["#3550E0", "#6E83F0"],
    ["#1F8A52", "#5BB58A"],
    ["#B36A12", "#E5A861"],
    ["#7C4DBC", "#A688D9"],
    ["#0F7A8F", "#56AEC2"],
    ["#C13838", "#E68A8A"],
  ];
  const hash = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const [a, b] = palette[hash % palette.length];
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: `linear-gradient(135deg, ${a}, ${b})`,
        display: "grid", placeItems: "center",
        color: "#fff", fontSize: Math.round(size * 0.42),
        fontWeight: 600, flexShrink: 0,
      }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

// ------- Status badge for invoices/projects/tasks -------
function StatusBadge({ status }) {
  const map = {
    paid:            { cls: "success", label: "Paid" },
    sent:            { cls: "info",    label: "Sent" },
    draft:           { cls: "outline", label: "Draft" },
    overdue:         { cls: "danger",  label: "Overdue" },
    partially_paid:  { cls: "warning", label: "Partial" },
    written_off:     { cls: "outline", label: "Written off" },
    active:          { cls: "success", label: "Active" },
    planning:        { cls: "info",    label: "Planning" },
    "on hold":       { cls: "warning", label: "On hold" },
    done:            { cls: "success", label: "Done" },
    todo:            { cls: "outline", label: "To do" },
    in_progress:     { cls: "info",    label: "In progress" },
    cancelled:       { cls: "outline", label: "Cancelled" },
    high:            { cls: "danger",  label: "High" },
    med:             { cls: "warning", label: "Medium" },
    low:             { cls: "outline", label: "Low" },
    approved:        { cls: "success", label: "Approved" },
  };
  const m = map[status] || { cls: "outline", label: status };
  return <span className={`badge badge--${m.cls} badge--dot`}>{m.label}</span>;
}

// ------- KPI card -------
function KPICard({ kpi, delay = 0 }) {
  const isUp = kpi.trend === "up";
  const isDown = kpi.trend === "down";
  return (
    <div className={`card fade-up delay-${delay}`} style={{ padding: 18 }}>
      <div style={{ fontSize: 12.5, color: "var(--fg-2)", marginBottom: 8 }}>{kpi.label}</div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <div style={{
          fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600,
          letterSpacing: "-0.022em", fontVariantNumeric: "tabular-nums",
        }}>{kpi.value}</div>
        {kpi.delta && (
          <span className={`badge badge--${isUp ? "success" : isDown ? "outline" : "outline"}`} style={{ gap: 3 }}>
            {kpi.trend === "up" && <Icon.ArrowUp size={11} />}
            {kpi.trend === "down" && <Icon.ArrowDown size={11} />}
            {kpi.delta}
          </span>
        )}
      </div>
      {kpi.sub && <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 6 }}>{kpi.sub}</div>}
    </div>
  );
}

// ------- Tiny SVG area chart -------
function AreaChart({ data, height = 180, valueFormatter = (v) => v }) {
  const w = 600;
  const padL = 36, padR = 10, padT = 14, padB = 22;
  const innerW = w - padL - padR;
  const innerH = height - padT - padB;
  const vals = data.map((d) => d.v);
  const max = Math.max(...vals) * 1.15;
  const min = 0;
  const xStep = innerW / (data.length - 1);
  const points = data.map((d, i) => ({
    x: padL + i * xStep,
    y: padT + innerH - ((d.v - min) / (max - min)) * innerH,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padT + innerH} L ${points[0].x} ${padT + innerH} Z`;

  const gridLines = 4;
  const gridYs = Array.from({ length: gridLines }, (_, i) => padT + (innerH * i) / (gridLines - 1));
  const gridVals = Array.from({ length: gridLines }, (_, i) => max * (1 - i / (gridLines - 1)));

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridYs.map((y, i) => (
        <g key={i}>
          <line x1={padL} x2={w - padR} y1={y} y2={y} stroke="var(--border)" strokeDasharray="2 4" />
          <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="10" fill="var(--fg-3)">
            {valueFormatter(Math.round(gridVals[i] / 1000) + "k")}
          </text>
        </g>
      ))}
      <path d={areaPath} fill="url(#areaFill)" />
      <path d={linePath} stroke="var(--accent)" strokeWidth="1.8" fill="none" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill="var(--bg-surface)" stroke="var(--accent)" strokeWidth="1.5" />
          <text x={p.x} y={height - 6} textAnchor="middle" fontSize="10.5" fill="var(--fg-3)">
            {data[i].m}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ------- Bar mini-chart -------
function MiniBars({ values, color = "var(--accent)", height = 28 }) {
  const max = Math.max(...values);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height }}>
      {values.map((v, i) => (
        <div key={i} style={{
          width: 5, background: color, opacity: 0.25 + (v / max) * 0.75,
          height: `${(v / max) * 100}%`, borderRadius: 2,
        }} />
      ))}
    </div>
  );
}

// ------- Progress bar -------
function Progress({ value, tint = "var(--accent)" }) {
  return (
    <div style={{
      width: "100%", height: 6, background: "var(--bg-subtle)",
      borderRadius: 99, overflow: "hidden",
    }}>
      <div style={{
        width: `${Math.round(value * 100)}%`, height: "100%",
        background: tint, borderRadius: 99,
        transition: "width var(--dur-slow) var(--ease-out)",
      }} />
    </div>
  );
}

// ------- Health ring (small) -------
function HealthRing({ score, size = 32 }) {
  const r = (size - 4) / 2;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const tint =
    score >= 80 ? "var(--success)" :
    score >= 60 ? "var(--warning)" :
    "var(--danger)";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--bg-subtle)" strokeWidth="3" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={tint} strokeWidth="3" fill="none"
                strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "grid", placeItems: "center",
        fontSize: 10, fontWeight: 600, color: "var(--fg)", fontVariantNumeric: "tabular-nums",
      }}>{score}</div>
    </div>
  );
}

Object.assign(window, { Avatar, StatusBadge, KPICard, AreaChart, MiniBars, Progress, HealthRing });
