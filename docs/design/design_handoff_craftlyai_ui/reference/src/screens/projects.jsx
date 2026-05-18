// CraftlyAI — Projects + Kanban view (Linear-flavored)
const { useState: useStatePr } = React;

function Projects({ goto }) {
  const [view, setView] = useStatePr("kanban"); // "list" | "kanban"
  const [activeProject, setActiveProject] = useStatePr(MockData.pipeline[0].id);

  return (
    <div className="page" style={{ maxWidth: "none", padding: "20px 24px 60px" }}>
      <div className="page__header fade-up">
        <div>
          <h1 className="page__title">Projects</h1>
          <div className="page__subtitle">4 active · AED 52,700 in flight · 1 at risk</div>
        </div>
        <div className="page__actions">
          <div style={{
            display: "flex", padding: 2, background: "var(--bg-subtle)",
            borderRadius: 8, border: "1px solid var(--border)",
          }}>
            <button
              className={`btn btn--ghost btn--sm`}
              style={{ background: view === "list" ? "var(--bg-surface)" : "transparent", height: 26 }}
              onClick={() => setView("list")}
            ><Icon.ListIcon size={12} />List</button>
            <button
              className={`btn btn--ghost btn--sm`}
              style={{ background: view === "kanban" ? "var(--bg-surface)" : "transparent", height: 26 }}
              onClick={() => setView("kanban")}
            ><Icon.Layers size={12} />Board</button>
          </div>
          <button className="btn btn--primary"><Icon.Plus size={14} />New project</button>
        </div>
      </div>

      {/* Project selector chips */}
      <div className="fade-up delay-1" style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {MockData.pipeline.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveProject(p.id)}
            className="btn btn--secondary"
            style={{
              borderColor: activeProject === p.id ? "var(--fg)" : "var(--border)",
              background: activeProject === p.id ? "var(--bg-subtle)" : "var(--bg-surface)",
              padding: "6px 12px", height: "auto",
            }}
          >
            <span className={`status-dot status-dot--${p.risk === "high" ? "danger" : p.risk === "med" ? "warning" : "success"}`} />
            <span style={{ fontWeight: 500 }}>{p.title}</span>
            <span className="dim" style={{ fontSize: 11 }}>{p.client}</span>
          </button>
        ))}
      </div>

      {/* Project header card */}
      <div className="card fade-up delay-2" style={{ padding: 20, marginBottom: 20 }}>
        {(() => {
          const p = MockData.pipeline.find(x => x.id === activeProject) || MockData.pipeline[0];
          return (
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: 20, alignItems: "center" }}>
              <div>
                <h2 style={{
                  fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600,
                  letterSpacing: "-0.02em", marginBottom: 4,
                }}>{p.title}</h2>
                <div className="dim" style={{ fontSize: 13 }}>For <strong style={{ color: "var(--fg-2)" }}>{p.client}</strong></div>
              </div>
              <KV label="Status" >
                <StatusBadge status={p.status} />
              </KV>
              <KV label="Deadline">
                <div style={{ fontWeight: 500 }}>{p.deadline}</div>
                {p.risk === "high" && <span className="badge badge--danger" style={{ marginTop: 2 }}>At risk</span>}
              </KV>
              <KV label="Budget">
                <div className="tabular" style={{ fontWeight: 600 }}>{p.value}</div>
                <div className="dim tabular" style={{ fontSize: 11, marginTop: 2 }}>{Math.round(p.progress * 100)}% complete</div>
              </KV>
              <KV label="Team">
                <div style={{ display: "flex", gap: -8 }}>
                  <Avatar name="Lena Marchetti" size={26} />
                </div>
                <div className="dim" style={{ fontSize: 11, marginTop: 4 }}>You only</div>
              </KV>
            </div>
          );
        })()}
      </div>

      {/* Tabs */}
      <div className="tabs fade-up delay-3">
        <div className="tabs__item" data-active="true">Tasks <span className="tabs__count">9</span></div>
        <div className="tabs__item">Documents <span className="tabs__count">5</span></div>
        <div className="tabs__item">Time <span className="tabs__count">42h</span></div>
        <div className="tabs__item">Expenses <span className="tabs__count">3</span></div>
        <div className="tabs__item">Notes</div>
        <div style={{ flex: 1 }} />
        <div className="tabs__item"><Icon.Filter size={13} />Filter</div>
      </div>

      {view === "kanban" ? <Kanban /> : <ProjectListView />}
    </div>
  );
}

function KV({ label, children }) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function Kanban() {
  const cols = [
    { id: "todo",        label: "To do",       count: MockData.kanban.todo.length,        tone: "var(--fg-3)" },
    { id: "in_progress", label: "In progress", count: MockData.kanban.in_progress.length, tone: "var(--info)" },
    { id: "done",        label: "Done",        count: MockData.kanban.done.length,        tone: "var(--success)" },
    { id: "cancelled",   label: "Cancelled",   count: MockData.kanban.cancelled.length,   tone: "var(--fg-3)" },
  ];

  return (
    <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
      {cols.map((col) => (
        <div key={col.id} style={{
          background: "var(--bg-canvas)", borderRadius: 12,
          display: "flex", flexDirection: "column", minHeight: 400,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "0 4px 12px",
          }}>
            <span className="status-dot" style={{ background: col.tone }} />
            <span style={{ fontWeight: 500, fontSize: 13 }}>{col.label}</span>
            <span className="tabs__count">{col.count}</span>
            <div style={{ flex: 1 }} />
            <button className="btn btn--ghost btn--icon btn--sm"><Icon.Plus size={12} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 60 }}>
            {MockData.kanban[col.id].map((t, idx) => (
              <KanbanCard key={t.id} task={t} dim={col.id === "done" || col.id === "cancelled"} />
            ))}
            <button className="btn btn--ghost btn--sm" style={{
              justifyContent: "flex-start", color: "var(--fg-3)",
              padding: "6px 10px", height: "auto",
            }}>
              <Icon.Plus size={12} /> Add task
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function KanbanCard({ task, dim }) {
  return (
    <div className="card" style={{
      padding: 12, borderRadius: 10, cursor: "grab",
      opacity: dim ? 0.7 : 1,
      transition: "transform var(--dur-fast), box-shadow var(--dur-fast)",
    }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        {task.labels.map((l) => (
          <span key={l} className="badge" style={{ fontSize: 10 }}>{l}</span>
        ))}
      </div>
      <div style={{
        fontSize: 13.5, fontWeight: 500, marginBottom: 12, lineHeight: 1.35,
        textDecoration: dim ? "line-through" : "none",
        color: dim ? "var(--fg-2)" : "var(--fg)",
      }}>
        {task.title}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className={`badge badge--${task.priority === "high" ? "danger" : task.priority === "med" ? "warning" : "outline"}`} style={{ fontSize: 10 }}>
            {task.priority}
          </span>
          <span className="dim" style={{ fontSize: 11 }}>· {task.due}</span>
        </div>
        <Avatar name={task.assignee} size={20} />
      </div>
    </div>
  );
}

function ProjectListView() {
  return (
    <div className="card fade-up">
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 28 }}></th>
            <th>Task</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due</th>
            <th>Assignee</th>
          </tr>
        </thead>
        <tbody>
          {MockData.tasks.slice(0, 8).map((t) => (
            <tr key={t.id}>
              <td><input type="checkbox" defaultChecked={t.status === "done"} /></td>
              <td>
                <div style={{ fontWeight: 500, textDecoration: t.status === "done" ? "line-through" : "none", color: t.status === "done" ? "var(--fg-2)" : "var(--fg)" }}>
                  {t.title}
                </div>
                <div className="dim" style={{ fontSize: 11, marginTop: 2 }}>{t.project}</div>
              </td>
              <td><StatusBadge status={t.status} /></td>
              <td><StatusBadge status={t.priority} /></td>
              <td><span className={t.overdue ? "" : "muted"} style={{ color: t.overdue ? "var(--danger)" : undefined }}>{t.due}</span></td>
              <td><Avatar name="Lena Marchetti" size={22} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

window.Screens = window.Screens || {};
window.Screens.Projects = Projects;
