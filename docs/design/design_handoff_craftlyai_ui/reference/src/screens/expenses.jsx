// CraftlyAI — Expenses
function Expenses({ goto }) {
  const total = MockData.expenses.reduce((a, b) => a + b.amount, 0);
  const byCat = MockData.expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount; return acc;
  }, {});
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const catTint = { Software: "var(--chart-1)", Subscriptions: "var(--chart-2)", Meals: "var(--chart-3)", Travel: "var(--chart-4)" };

  return (
    <div className="page">
      <div className="page__header fade-up">
        <div>
          <h1 className="page__title">Expenses</h1>
          <div className="page__subtitle">May · AED {total.toLocaleString()} across {MockData.expenses.length} expenses</div>
        </div>
        <div className="page__actions">
          <button className="btn btn--secondary"><Icon.Upload size={14} />Upload receipts</button>
          <button className="btn btn--primary"><Icon.Plus size={14} />New expense</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 22 }}>
        <div className="card fade-up delay-1" style={{ padding: 18 }}>
          <div className="dim" style={{ fontSize: 12.5, marginBottom: 8 }}>Total this month</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, letterSpacing: "-0.022em" }} className="tabular">
            AED {total.toLocaleString()}
          </div>
          <div className="dim" style={{ fontSize: 11.5, marginTop: 6 }}>
            <span style={{ color: "var(--success)" }}>−12.4%</span> vs April
          </div>
        </div>
        <div className="card fade-up delay-2" style={{ padding: 18 }}>
          <div className="dim" style={{ fontSize: 12.5, marginBottom: 8 }}>Billable to clients</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, letterSpacing: "-0.022em" }} className="tabular">
            AED 206
          </div>
          <div className="dim" style={{ fontSize: 11.5, marginTop: 6 }}>2 expenses · 2 projects</div>
        </div>
        <div className="card fade-up delay-3" style={{ padding: 18 }}>
          <div className="dim" style={{ fontSize: 12.5, marginBottom: 8 }}>Missing receipts</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, letterSpacing: "-0.022em", color: "var(--warning)" }} className="tabular">
            1
          </div>
          <div className="dim" style={{ fontSize: 11.5, marginTop: 6 }}>Uber · May 8 · AED 64</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        <section className="card fade-up">
          <div className="card__header">
            <div className="card__title">All expenses</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn--ghost btn--sm" style={{ background: "var(--bg-subtle)" }}>All</button>
              <button className="btn btn--ghost btn--sm">Billable</button>
              <button className="btn btn--ghost btn--sm">No receipt</button>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th>Category</th>
                <th>Project</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {MockData.expenses.map((e) => (
                <tr key={e.id}>
                  <td><span className="muted">{e.date}</span></td>
                  <td><span style={{ fontWeight: 500 }}>{e.vendor}</span></td>
                  <td>
                    <span className="badge" style={{ background: "var(--bg-subtle)", color: "var(--fg-2)" }}>
                      <span className="status-dot" style={{ background: catTint[e.category] || "var(--fg-3)" }} />
                      {e.category}
                    </span>
                  </td>
                  <td><span className="muted">{e.project}</span></td>
                  <td className="tabular" style={{ textAlign: "right", fontWeight: 500 }}>AED {e.amount.toLocaleString()}</td>
                  <td>
                    {e.hasReceipt
                      ? <span style={{ color: "var(--success)", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12 }}><Icon.PaperClip size={12} />1 file</span>
                      : <span className="badge badge--warning">Missing</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <aside className="card fade-up delay-1" style={{ alignSelf: "flex-start" }}>
          <div className="card__header"><div className="card__title">By category</div></div>
          <div className="card__body" style={{ display: "grid", gap: 12 }}>
            {cats.map(([cat, amt]) => (
              <div key={cat}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span className="status-dot" style={{ background: catTint[cat] || "var(--fg-3)" }} />
                    <span style={{ fontWeight: 500 }}>{cat}</span>
                  </span>
                  <span className="tabular muted">AED {amt}</span>
                </div>
                <Progress value={amt / total} tint={catTint[cat] || "var(--fg-3)"} />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

window.Screens = window.Screens || {};
window.Screens.Expenses = Expenses;
