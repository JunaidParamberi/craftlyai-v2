// CraftlyAI — Documents / Document Studio
const { useState: useStateD } = React;

function Documents({ goto }) {
  const [view, setView] = useStateD("list"); // "list" | "studio"

  if (view === "studio") return <DocumentStudio onBack={() => setView("list")} />;

  return (
    <div className="page">
      <div className="page__header fade-up">
        <div>
          <h1 className="page__title">Documents</h1>
          <div className="page__subtitle">36 documents · 9 awaiting client action</div>
        </div>
        <div className="page__actions">
          <button className="btn btn--secondary"><Icon.Sparkles size={14} />Draft with AI</button>
          <button className="btn btn--primary" onClick={() => setView("studio")}><Icon.Plus size={14} />New document</button>
        </div>
      </div>

      <div className="tabs fade-up delay-1">
        <div className="tabs__item" data-active="true">All <span className="tabs__count">36</span></div>
        <div className="tabs__item">Invoices <span className="tabs__count">14</span></div>
        <div className="tabs__item">Quotes <span className="tabs__count">9</span></div>
        <div className="tabs__item">Proposals <span className="tabs__count">7</span></div>
        <div className="tabs__item">Payment vouchers <span className="tabs__count">6</span></div>
        <div style={{ flex: 1 }} />
        <div className="tabs__item"><Icon.Filter size={13} />Filter</div>
      </div>

      {/* Template starters */}
      <div className="fade-up delay-2" style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Start from a template</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { icon: "Receipt",  label: "Standard invoice", sub: "Most-used · 12 used this month",   tone: "var(--accent)" },
            { icon: "Quote",    label: "Basic quote",      sub: "5 line items · tax field",         tone: "var(--info)" },
            { icon: "FileText", label: "Project proposal", sub: "Sections + pricing table",         tone: "var(--success)" },
            { icon: "Sparkles", label: "AI from scratch",  sub: "Describe what you need",           tone: "var(--accent)", ai: true },
          ].map((t) => {
            const I = Icon[t.icon];
            return (
              <button
                key={t.label}
                onClick={() => setView("studio")}
                className="card"
                style={{
                  padding: 14, textAlign: "left", cursor: "pointer",
                  background: t.ai ? "linear-gradient(135deg, var(--accent-soft), var(--bg-surface))" : "var(--bg-surface)",
                  borderColor: t.ai ? "var(--accent-soft-2)" : "var(--border)",
                  display: "flex", flexDirection: "column", gap: 10,
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: t.ai ? "var(--accent)" : "var(--bg-subtle)",
                  color: t.ai ? "#fff" : t.tone,
                  display: "grid", placeItems: "center",
                }}>
                  <I size={15} />
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13.5 }}>{t.label}</div>
                  <div className="dim" style={{ fontSize: 11.5, marginTop: 3 }}>{t.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Documents table */}
      <div className="card fade-up delay-3">
        <table className="table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Client</th>
              <th>Issued</th>
              <th>Due</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th>Status</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {MockData.invoices.map((i) => (
              <tr key={i.id} onClick={() => setView("studio")} style={{ cursor: "pointer" }}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon.Receipt size={15} />
                    <span style={{ fontWeight: 500, fontFamily: "var(--font-mono)", fontSize: 13 }}>{i.id}</span>
                  </div>
                </td>
                <td>{i.client}</td>
                <td><span className="muted">{i.issued}</span></td>
                <td><span className="muted">{i.due}</span></td>
                <td className="tabular" style={{ textAlign: "right", fontWeight: 500 }}>
                  AED {i.amount.toLocaleString()}
                </td>
                <td><StatusBadge status={i.status} /></td>
                <td><button className="btn btn--ghost btn--icon btn--sm"><Icon.More size={13} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DocumentStudio({ onBack }) {
  return (
    <div style={{ padding: "16px 24px 60px" }}>
      <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <button className="btn btn--ghost btn--sm" onClick={onBack}><Icon.ChevronLeft size={13} />Documents</button>
        <span className="dim">/</span>
        <span style={{ fontWeight: 500, fontFamily: "var(--font-mono)", fontSize: 13 }}>INV-2052</span>
        <StatusBadge status="sent" />
        <div style={{ flex: 1 }} />
        <button className="btn btn--ghost btn--sm"><Icon.Sparkles size={13} />Rewrite with AI</button>
        <button className="btn btn--secondary btn--sm"><Icon.Download size={13} />PDF</button>
        <button className="btn btn--secondary btn--sm"><Icon.Eye size={13} />Preview</button>
        <button className="btn btn--primary btn--sm"><Icon.Send size={13} />Send</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "flex-start" }}>
        {/* Editor */}
        <div className="card fade-up delay-1" style={{ padding: 0, overflow: "hidden" }}>
          {/* Toolbar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "8px 12px", borderBottom: "1px solid var(--border)",
            background: "var(--bg-canvas)",
          }}>
            <ToolbarBtn><Icon.Bold size={14} /></ToolbarBtn>
            <ToolbarBtn><Icon.Italic size={14} /></ToolbarBtn>
            <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 4px" }} />
            <ToolbarBtn><Icon.Hash size={14} /></ToolbarBtn>
            <ToolbarBtn><Icon.ListIcon size={14} /></ToolbarBtn>
            <ToolbarBtn><Icon.Quote size={14} /></ToolbarBtn>
            <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 4px" }} />
            <ToolbarBtn><Icon.Layers size={14} /></ToolbarBtn>
            <ToolbarBtn><Icon.PaperClip size={14} /></ToolbarBtn>
            <div style={{ flex: 1 }} />
            <span className="dim" style={{ fontSize: 11.5 }}>Saved · 2m ago</span>
          </div>

          {/* Document canvas */}
          <div style={{ padding: "40px 56px", background: "var(--bg-canvas)", minHeight: 600 }}>
            <div style={{
              background: "var(--bg-surface)", padding: "44px 56px",
              borderRadius: 8, boxShadow: "var(--shadow-md)", maxWidth: 720, margin: "0 auto",
            }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 36 }}>
                <div>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: "var(--fg)", color: "var(--bg-surface)",
                    display: "grid", placeItems: "center",
                    fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 12,
                  }}>L</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16 }}>Studio Marchetti</div>
                  <div className="dim" style={{ fontSize: 12, marginTop: 2 }}>lena@studiomarchetti.com</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <h1 style={{
                    fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600,
                    letterSpacing: "-0.025em", marginBottom: 4,
                  }}>Invoice</h1>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>INV-2052</div>
                  <div className="dim" style={{ fontSize: 12, marginTop: 2 }}>Issued May 14, 2026</div>
                </div>
              </div>

              {/* Bill to */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>Bill to</div>
                  <div style={{ fontWeight: 500 }}>Onyx Ventures</div>
                  <div className="dim" style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 2 }}>
                    Dana Cole<br />dana@onyx.vc<br />228 Lafayette St, NY 10012
                  </div>
                </div>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>Details</div>
                  <div style={{ display: "grid", gap: 4, fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="dim">Due date</span><span style={{ fontWeight: 500 }}>May 28, 2026</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="dim">Currency</span><span>AED</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="dim">Project</span><span>Onyx site v2</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line items */}
              <table style={{ width: "100%", fontSize: 13, marginBottom: 24 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ textAlign: "left", padding: "8px 0", fontSize: 11, color: "var(--fg-3)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>Description</th>
                    <th style={{ textAlign: "right", padding: "8px 0", fontSize: 11, color: "var(--fg-3)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", width: 60 }}>Qty</th>
                    <th style={{ textAlign: "right", padding: "8px 0", fontSize: 11, color: "var(--fg-3)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", width: 100 }}>Rate</th>
                    <th style={{ textAlign: "right", padding: "8px 0", fontSize: 11, color: "var(--fg-3)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", width: 100 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <LineRow desc="Design system + component library" qty="1" rate="3,200" total="3,200" />
                  <LineRow desc="Landing page (4 sections, responsive)" qty="1" rate="2,800" total="2,800" />
                  <LineRow desc="Engineering pairing — week of May 6" qty="12" rate="220" total="2,640" />
                  <LineRow desc="Post-launch tweaks" qty="1" rate="560" total="560" />
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: 260, display: "grid", gap: 6, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="dim">Subtotal</span><span className="tabular">9,200</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="dim">VAT 5%</span><span className="tabular">460</span>
                  </div>
                  <hr style={{ margin: "6px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 16 }}>
                    <span>Total AED</span><span className="tabular">9,660</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inspector sidebar */}
        <div className="fade-up delay-2" style={{ display: "grid", gap: 16, position: "sticky", top: 16 }}>
          <div className="card">
            <div className="card__header"><div className="card__title">Document</div></div>
            <div className="card__body" style={{ display: "grid", gap: 12 }}>
              <div className="field">
                <label className="field__label">Type</label>
                <div className="input" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Invoice</span><Icon.ChevronDown size={13} />
                </div>
              </div>
              <div className="field">
                <label className="field__label">Client</label>
                <div className="input" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar name="Onyx Ventures" size={18} /><span>Onyx Ventures</span>
                </div>
              </div>
              <div className="field">
                <label className="field__label">Project</label>
                <div className="input" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Onyx site v2</span><Icon.ChevronDown size={13} />
                </div>
              </div>
              <div className="field">
                <label className="field__label">Due date</label>
                <div className="input" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>May 28, 2026</span><Icon.Calendar size={13} />
                </div>
              </div>
            </div>
          </div>

          {/* AI assistant card */}
          <div className="card" style={{
            background: "linear-gradient(135deg, var(--accent-soft), var(--bg-surface))",
            borderColor: "var(--accent-soft-2)",
          }}>
            <div className="card__header" style={{ borderBottom: "1px solid var(--accent-soft-2)" }}>
              <div className="card__title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon.Sparkles size={14} />AI suggestions
              </div>
              <span className="badge badge--accent">Sonnet</span>
            </div>
            <div className="card__body" style={{ display: "grid", gap: 8 }}>
              {[
                "Add late-fee terms (5% after 30d)",
                "Suggest a 10% retainer discount for Onyx",
                "Pull last month's hours into a new line item",
              ].map((s) => (
                <button key={s} className="btn btn--ghost btn--sm" style={{
                  justifyContent: "flex-start", textAlign: "left",
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                  padding: "8px 10px", height: "auto", lineHeight: 1.3, whiteSpace: "normal",
                }}>
                  <Icon.Sparkles size={12} />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card__header"><div className="card__title">Activity</div></div>
            <div style={{ padding: "8px 0" }}>
              {[
                { who: "You",      what: "edited line item",  when: "2m ago",  I: Icon.Edit },
                { who: "Dana Cole",what: "viewed document",   when: "1h ago",  I: Icon.Eye },
                { who: "You",      what: "sent via email",    when: "Thu",     I: Icon.Send },
                { who: "You",      what: "created from template", when: "Thu", I: Icon.Plus },
              ].map((a, i) => {
                const A = a.I;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 16px", fontSize: 12.5,
                  }}>
                    <A size={13} style={{ color: "var(--fg-3)" }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 500 }}>{a.who}</span>{" "}
                      <span className="muted">{a.what}</span>
                    </div>
                    <span className="dim" style={{ fontSize: 11 }}>{a.when}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolbarBtn({ children }) {
  return (
    <button className="btn btn--ghost btn--icon btn--sm" style={{ height: 28, width: 28 }}>
      {children}
    </button>
  );
}

function LineRow({ desc, qty, rate, total }) {
  return (
    <tr style={{ borderBottom: "1px solid var(--border)" }}>
      <td style={{ padding: "10px 0" }}>{desc}</td>
      <td style={{ padding: "10px 0", textAlign: "right" }} className="tabular">{qty}</td>
      <td style={{ padding: "10px 0", textAlign: "right" }} className="tabular">{rate}</td>
      <td style={{ padding: "10px 0", textAlign: "right", fontWeight: 500 }} className="tabular">{total}</td>
    </tr>
  );
}

window.Screens = window.Screens || {};
window.Screens.Documents = Documents;
