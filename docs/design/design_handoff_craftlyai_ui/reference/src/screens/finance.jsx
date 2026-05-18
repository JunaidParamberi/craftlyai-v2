// CraftlyAI — Finance / Invoices dashboard
function Finance({ goto }) {
  return (
    <div className="page">
      <div className="page__header fade-up">
        <div>
          <h1 className="page__title">Finance</h1>
          <div className="page__subtitle">May 1 — May 17 · 8 invoices issued · AED 60,450 total</div>
        </div>
        <div className="page__actions">
          <div style={{
            display: "flex", padding: 2, background: "var(--bg-subtle)",
            borderRadius: 8, border: "1px solid var(--border)",
          }}>
            {["This month", "Last 3M", "This year"].map((p, i) => (
              <button key={p} className="btn btn--ghost btn--sm" style={{
                background: i === 0 ? "var(--bg-surface)" : "transparent", height: 26,
              }}>{p}</button>
            ))}
          </div>
          <button className="btn btn--secondary"><Icon.Download size={14} />Export</button>
          <button className="btn btn--primary"><Icon.Plus size={14} />New invoice</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        <KPICard kpi={MockData.kpis.revenue} delay={1} />
        <KPICard kpi={MockData.kpis.outstanding} delay={2} />
        <KPICard kpi={MockData.kpis.overdue} delay={3} />
        <KPICard kpi={MockData.kpis.avgPay} delay={4} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 22 }}>
        <section className="card fade-up">
          <div className="card__header">
            <div className="card__title">Revenue trend</div>
            <span className="dim" style={{ fontSize: 12 }}>Paid invoices only · AED</span>
          </div>
          <div className="card__body">
            <AreaChart data={MockData.revenueByMonth} height={220} />
          </div>
        </section>
        <section className="card fade-up delay-1">
          <div className="card__header">
            <div className="card__title">Revenue by client</div>
            <span className="dim" style={{ fontSize: 12 }}>This year</span>
          </div>
          <div className="card__body" style={{ display: "grid", gap: 14 }}>
            {[
              { name: "Maple Co.",       v: 52900, share: 0.28, tint: "var(--chart-1)" },
              { name: "Hawthorn & Co",   v: 38400, share: 0.21, tint: "var(--chart-2)" },
              { name: "Onyx Ventures",   v: 29900, share: 0.16, tint: "var(--chart-3)" },
              { name: "Northwind Labs",  v: 21800, share: 0.12, tint: "var(--chart-4)" },
              { name: "Field Notes Co",  v: 17200, share: 0.09, tint: "var(--chart-5)" },
              { name: "Others",          v: 26450, share: 0.14, tint: "var(--fg-3)" },
            ].map((c) => (
              <div key={c.name} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c.tint }} />
                  <span style={{ fontWeight: 500 }}>{c.name}</span>
                </div>
                <span className="tabular muted" style={{ fontSize: 12.5 }}>{Math.round(c.share * 100)}%</span>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Progress value={c.share} tint={c.tint} />
                </div>
                <span className="dim tabular" style={{ fontSize: 11, gridColumn: "1 / -1" }}>AED {c.v.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card fade-up delay-2">
        <div className="card__header">
          <div className="card__title">All invoices</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn--ghost btn--sm">All</button>
            <button className="btn btn--ghost btn--sm" style={{ background: "var(--bg-subtle)" }}>Outstanding</button>
            <button className="btn btn--ghost btn--sm">Paid</button>
            <button className="btn btn--ghost btn--sm"><Icon.Filter size={12} /></button>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Client</th>
              <th>Issued</th>
              <th>Due</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {MockData.invoices.map((i) => (
              <tr key={i.id} style={{
                background: i.status === "overdue" ? "var(--danger-soft)" : undefined,
              }}>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500 }}>{i.id}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar name={i.client} size={22} />
                    <span>{i.client}</span>
                  </div>
                </td>
                <td><span className="muted">{i.issued}</span></td>
                <td>
                  <span className={i.status === "overdue" ? "" : "muted"} style={{ color: i.status === "overdue" ? "var(--danger)" : undefined, fontWeight: i.status === "overdue" ? 500 : 400 }}>
                    {i.due}
                  </span>
                </td>
                <td className="tabular" style={{ textAlign: "right", fontWeight: 500 }}>AED {i.amount.toLocaleString()}</td>
                <td><StatusBadge status={i.status} /></td>
                <td>
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <button className="btn btn--ghost btn--icon btn--sm"><Icon.Send size={12} /></button>
                    <button className="btn btn--ghost btn--icon btn--sm"><Icon.More size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

window.Screens = window.Screens || {};
window.Screens.Finance = Finance;
