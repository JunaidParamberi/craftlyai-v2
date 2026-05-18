// CraftlyAI — Tasks (cross-project)
const { useState: useStateT } = React;

function Tasks({ goto }) {
  const [filter, setFilter] = useStateT("open");

  const filtered = MockData.tasks.filter((t) => {
    if (filter === "open")    return t.status !== "done";
    if (filter === "overdue") return t.overdue;
    if (filter === "today")   return t.due === "Today";
    if (filter === "done")    return t.status === "done";
    return true;
  });

  const open    = MockData.tasks.filter(t => t.status !== "done").length;
  const overdue = MockData.tasks.filter(t => t.overdue).length;
  const today   = MockData.tasks.filter(t => t.due === "Today").length;
  const done    = MockData.tasks.filter(t => t.status === "done").length;

  return (
    <div className="page">
      <div className="page__header fade-up">
        <div>
          <h1 className="page__title">Tasks</h1>
          <div className="page__subtitle">{open} open across 4 projects · {overdue} overdue</div>
        </div>
        <div className="page__actions">
          <button className="btn btn--secondary"><Icon.Sparkles size={14} />Plan my week</button>
          <button className="btn btn--primary"><Icon.Plus size={14} />New task</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 22 }}>
        <TaskKpi label="Open"    value={open}    tone="info"    onClick={() => setFilter("open")}    active={filter === "open"} />
        <TaskKpi label="Due today" value={today}  tone="warning" onClick={() => setFilter("today")}   active={filter === "today"} />
        <TaskKpi label="Overdue" value={overdue} tone="danger"  onClick={() => setFilter("overdue")} active={filter === "overdue"} />
        <TaskKpi label="Done this month" value={done} tone="success" onClick={() => setFilter("done")} active={filter === "done"} />
      </div>

      <div className="tabs fade-up delay-1">
        <div className="tabs__item" data-active="true">All projects</div>
        <div className="tabs__item">Hawthorn rebrand</div>
        <div className="tabs__item">Northwind landing v3</div>
        <div className="tabs__item">Maple seasonal site</div>
        <div style={{ flex: 1 }} />
        <div className="tabs__item"><Icon.ArrowDown size={13} />Due date</div>
        <div className="tabs__item"><Icon.Filter size={13} />Filter</div>
      </div>

      <div className="card fade-up delay-2">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 28 }}></th>
              <th>Task</th>
              <th>Project</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td><input type="checkbox" defaultChecked={t.status === "done"} /></td>
                <td style={{
                  textDecoration: t.status === "done" ? "line-through" : "none",
                  color: t.status === "done" ? "var(--fg-3)" : "var(--fg)",
                  fontWeight: 500,
                }}>{t.title}</td>
                <td><span className="muted">{t.project}</span></td>
                <td><StatusBadge status={t.status} /></td>
                <td><StatusBadge status={t.priority} /></td>
                <td>
                  <span style={{
                    color: t.overdue ? "var(--danger)" : t.due === "Today" ? "var(--warning)" : "var(--fg-2)",
                    fontWeight: t.overdue || t.due === "Today" ? 500 : 400,
                    fontSize: 13,
                  }}>{t.due}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TaskKpi({ label, value, tone, onClick, active }) {
  const tones = {
    info:    { bg: "var(--info-soft)",    fg: "var(--info)" },
    warning: { bg: "var(--warning-soft)", fg: "var(--warning)" },
    danger:  { bg: "var(--danger-soft)",  fg: "var(--danger)" },
    success: { bg: "var(--success-soft)", fg: "var(--success)" },
  }[tone];
  return (
    <button
      onClick={onClick}
      className="card"
      style={{
        padding: 16, textAlign: "left", cursor: "pointer",
        background: active ? tones.bg : "var(--bg-surface)",
        borderColor: active ? "transparent" : "var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ fontSize: 12.5, color: active ? tones.fg : "var(--fg-2)", marginBottom: 4 }}>{label}</div>
        <div style={{
          fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600,
          color: active ? tones.fg : "var(--fg)", letterSpacing: "-0.022em",
        }}>{value}</div>
      </div>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: tones.bg, color: tones.fg,
        display: "grid", placeItems: "center", opacity: active ? 1 : 0.7,
      }}>
        {tone === "info" && <Icon.CheckSquare size={15} />}
        {tone === "warning" && <Icon.Clock size={15} />}
        {tone === "danger" && <Icon.AlertCircle size={15} />}
        {tone === "success" && <Icon.Check size={15} />}
      </div>
    </button>
  );
}

window.Screens = window.Screens || {};
window.Screens.Tasks = Tasks;
