// CraftlyAI — Dashboard
function Dashboard({ goto }) {
  const k = MockData.kpis;
  return (
    <div className="page">
      <div className="page__header fade-up">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Friday · May 17</div>
          <h1 className="page__title">Good morning, Lena.</h1>
          <div className="page__subtitle">3 things need you · AED 12,640 outstanding · 1 deadline this week.</div>
        </div>
        <div className="page__actions">
          <button className="btn btn--secondary"><Icon.Calendar size={14} />This month</button>
          <button className="btn btn--primary"><Icon.Plus size={14} />New invoice</button>
        </div>
      </div>

      {/* AI sidekick strip */}
      <div className="fade-up delay-1" style={{
        background: "linear-gradient(135deg, var(--accent-soft), var(--bg-surface) 60%)",
        border: "1px solid var(--border)", borderRadius: 14, padding: 16,
        display: "flex", alignItems: "center", gap: 14, marginBottom: 22,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: "var(--accent)", color: "#fff",
          display: "grid", placeItems: "center", flexShrink: 0,
        }}>
          <Icon.Sparkles size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, marginBottom: 2 }}>
            I drafted your Friday digest — 2 follow-ups ready to send, 1 quote needs a nudge.
          </div>
          <div className="dim" style={{ fontSize: 12 }}>
            Project Intelligence · ran 4 minutes ago · 1,240 tokens
          </div>
        </div>
        <button className="btn btn--secondary btn--sm">Review</button>
        <button className="btn btn--ghost btn--icon btn--sm" title="Dismiss"><Icon.X size={13} /></button>
      </div>

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        <KPICard kpi={k.revenue}     delay={1} />
        <KPICard kpi={k.outstanding} delay={2} />
        <KPICard kpi={k.overdue}     delay={3} />
        <KPICard kpi={k.avgPay}      delay={4} />
      </div>

      {/* Attention */}
      <div className="fade-up delay-2" style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Needs attention</div>
          <span className="dim" style={{ fontSize: 12 }}>3 items · scored by AI</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {MockData.attention.map((a) => {
            const tone =
              a.kind === "overdue" ? { soft: "var(--danger-soft)", fg: "var(--danger)", I: Icon.AlertTriangle } :
              a.kind === "deadline" ? { soft: "var(--warning-soft)", fg: "var(--warning)", I: Icon.Clock } :
                                       { soft: "var(--info-soft)",    fg: "var(--info)",   I: Icon.Quote };
            const TI = tone.I;
            return (
              <div key={a.id} className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: tone.soft, color: tone.fg,
                    display: "grid", placeItems: "center", flexShrink: 0,
                  }}>
                    <TI size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.35 }}>{a.title}</div>
                    <div className="dim" style={{ fontSize: 12, marginTop: 2 }}>{a.who}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                  <button className="btn btn--secondary btn--sm" style={{ flex: 1 }}>
                    <Icon.Sparkles size={12} />{a.action}
                  </button>
                  <button className="btn btn--ghost btn--icon btn--sm"><Icon.More size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue chart + activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 22 }}>
        <section className="card fade-up delay-3">
          <div className="card__header">
            <div>
              <div className="card__title">Revenue</div>
              <div className="dim" style={{ fontSize: 12, marginTop: 2 }}>Last 6 months</div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button className="btn btn--ghost btn--sm" data-active="true" style={{ background: "var(--bg-subtle)" }}>6M</button>
              <button className="btn btn--ghost btn--sm">1Y</button>
              <button className="btn btn--ghost btn--sm">All</button>
            </div>
          </div>
          <div className="card__body" style={{ paddingBottom: 8 }}>
            <AreaChart data={MockData.revenueByMonth} height={210} />
          </div>
          <div className="card__footer" style={{ display: "flex", gap: 24, fontSize: 12 }}>
            <div>
              <div className="dim">Total · last 6mo</div>
              <div className="tabular" style={{ fontWeight: 600, fontSize: 16 }}>AED 189,580</div>
            </div>
            <div>
              <div className="dim">Avg monthly</div>
              <div className="tabular" style={{ fontWeight: 600, fontSize: 16 }}>AED 31,597</div>
            </div>
            <div>
              <div className="dim">Best month</div>
              <div className="tabular" style={{ fontWeight: 600, fontSize: 16 }}>May · 42.1k</div>
            </div>
          </div>
        </section>

        <section className="card fade-up delay-4" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card__header">
            <div className="card__title">Activity</div>
            <button className="btn btn--ghost btn--sm">View all</button>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "4px 0" }}>
            {MockData.activity.slice(0, 7).map((v) => (
              <ActivityRow key={v.id} v={v} />
            ))}
          </div>
        </section>
      </div>

      {/* Active pipeline */}
      <section className="card fade-up">
        <div className="card__header">
          <div className="card__title">Active pipeline</div>
          <button className="btn btn--ghost btn--sm" onClick={() => goto("projects")}>
            All projects <Icon.ChevronRight size={12} />
          </button>
        </div>
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
            {MockData.pipeline.map((p) => (
              <tr key={p.id} onClick={() => goto("projects")} style={{ cursor: "pointer" }}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className={`status-dot status-dot--${
                      p.risk === "high" ? "danger" : p.risk === "med" ? "warning" : "muted"
                    }`} />
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
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function ActivityRow({ v }) {
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
          {v.meta && <span className="dim"> · {v.meta}</span>}
        </div>
        <div className="dim" style={{ fontSize: 11.5, marginTop: 1 }}>{v.when}</div>
      </div>
    </div>
  );
}

window.Screens = window.Screens || {};
window.Screens.Dashboard = Dashboard;
