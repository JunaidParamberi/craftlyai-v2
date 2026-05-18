// CraftlyAI — main app shell. Two-tier sidebar (icon rail + contextual pane) + topbar.
const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA } = React;

// ----- Sections (the icon rail) -----
const SECTIONS = [
  { id: "home",      icon: "Home",        label: "Home",      pane: "home" },
  { id: "work",      icon: "Briefcase",   label: "Work",      pane: "work" },
  { id: "money",     icon: "Wallet",      label: "Money",     pane: "money" },
  { id: "design",    icon: "Layers",      label: "Design system", pane: "design" },
];

// Each section's pane content & nav items
const PANES = {
  home: {
    title: "Home",
    sections: [
      { items: [
        { id: "dashboard", icon: "Home",     label: "Dashboard",   route: "dashboard" },
        { id: "inbox",     icon: "Inbox",    label: "Inbox",       route: "tasks",      count: 3 },
        { id: "tasks",     icon: "CheckSquare", label: "Tasks",    route: "tasks",      count: 12 },
        { id: "time",      icon: "Timer",    label: "Time",        route: "time" },
      ]},
    ],
    pinned: {
      label: "Pinned",
      items: [
        { id: "pin-hawthorn", icon: "Flame",   label: "Hawthorn rebrand",   route: "projects", color: "var(--danger)" },
        { id: "pin-maple",    icon: "Folder",  label: "Maple seasonal site", route: "projects", color: "var(--success)" },
      ]
    }
  },
  work: {
    title: "Work",
    sections: [
      { label: "CRM", items: [
        { id: "clients",   icon: "Users",       label: "Clients",     route: "clients",   count: 8 },
        { id: "projects",  icon: "Folder",      label: "Projects",    route: "projects",  count: 4 },
      ]},
      { label: "Documents", items: [
        { id: "all-docs",  icon: "FileText",    label: "All documents", route: "documents", count: 36 },
        { id: "invoices",  icon: "Receipt",     label: "Invoices",      route: "documents", count: 14 },
        { id: "quotes",    icon: "Quote",       label: "Quotes",        route: "documents", count: 9 },
        { id: "proposals", icon: "FileText",    label: "Proposals",     route: "documents", count: 7 },
        { id: "templates", icon: "Layers",      label: "Templates",     route: "documents", count: 12 },
      ]},
    ],
  },
  money: {
    title: "Money",
    sections: [
      { items: [
        { id: "finance",   icon: "TrendUp",     label: "Finance",     route: "finance" },
        { id: "expenses",  icon: "Wallet",      label: "Expenses",    route: "expenses",  count: 23 },
        { id: "invoices2", icon: "Receipt",     label: "Invoices",    route: "finance",   count: 14 },
      ]},
      { label: "Reports", items: [
        { id: "tax",       icon: "FileText",    label: "Tax (VAT)",   route: "finance" },
        { id: "by-client", icon: "Users",       label: "By client",   route: "finance" },
      ]},
    ],
  },
  design: {
    title: "Design system",
    sections: [
      { items: [
        { id: "ds",        icon: "Layers",      label: "Overview",        route: "design-system" },
        { id: "ds-color",  icon: "Tag",         label: "Color",           route: "design-system" },
        { id: "ds-type",   icon: "Hash",        label: "Type",            route: "design-system" },
        { id: "ds-comp",   icon: "Sliders",     label: "Components",      route: "design-system" },
      ]},
      { label: "Auth", items: [
        { id: "login",     icon: "Lock",        label: "Login / onboarding", route: "login" },
      ]},
    ],
  },
};

// Route → which section pane should be open
const ROUTE_TO_SECTION = {
  "design-system": "design",
  "login": "design",
  "dashboard": "home",
  "tasks": "home",
  "time": "home",
  "clients": "work",
  "projects": "work",
  "documents": "work",
  "finance": "money",
  "expenses": "money",
  "settings": "home",
  "cmdk": "home",
};

const ROUTE_LABELS = {
  "design-system": ["Design system", "Overview"],
  "dashboard": ["Home", "Dashboard"],
  "clients": ["Work", "Clients"],
  "projects": ["Work", "Projects"],
  "documents": ["Work", "Documents"],
  "finance": ["Money", "Finance"],
  "tasks": ["Home", "Tasks"],
  "time": ["Home", "Time"],
  "expenses": ["Money", "Expenses"],
  "settings": ["Settings", "General"],
  "login": ["Auth", "Sign in"],
};

function App() {
  const [theme, setTheme] = useStateA(() => localStorage.getItem("craftly-theme") || "light");
  const [route, setRoute] = useStateA(() => localStorage.getItem("craftly-route") || "design-system");
  const [section, setSection] = useStateA(() => ROUTE_TO_SECTION[localStorage.getItem("craftly-route") || "design-system"] || "design");
  const [cmdkOpen, setCmdkOpen] = useStateA(false);

  useEffectA(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("craftly-theme", theme);
  }, [theme]);

  useEffectA(() => {
    localStorage.setItem("craftly-route", route);
  }, [route]);

  // Cmd+K trigger
  useEffectA(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdkOpen(true);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const goto = (r) => {
    setRoute(r);
    const s = ROUTE_TO_SECTION[r];
    if (s) setSection(s);
  };

  // Hide pane for login/full-screen routes
  const fullscreen = route === "login";

  if (fullscreen) {
    return (
      <>
        <Screens.Login goto={goto} theme={theme} setTheme={setTheme} />
        <CmdK open={cmdkOpen} onClose={() => setCmdkOpen(false)} onNavigate={goto} />
      </>
    );
  }

  const pane = PANES[section];
  const crumbs = ROUTE_LABELS[route] || ["", ""];

  return (
    <>
      <div className="app">
        {/* Icon rail */}
        <aside className="rail">
          <div className="rail__logo" title="CraftlyAI">C</div>
          <div className="rail__group">
            {SECTIONS.map((s) => {
              const Ic = Icon[s.icon];
              return (
                <button
                  key={s.id}
                  className="rail__btn"
                  data-active={section === s.id}
                  onClick={() => setSection(s.id)}
                  aria-label={s.label}
                >
                  <Ic size={18} />
                  <span className="rail__tooltip">{s.label}</span>
                </button>
              );
            })}
          </div>
          <div className="rail__group rail__group--bottom">
            <button className="rail__btn" onClick={() => goto("settings")} data-active={route === "settings"}>
              <Icon.Settings size={18} />
              <span className="rail__tooltip">Settings</span>
            </button>
            <button className="rail__btn" onClick={() => setCmdkOpen(true)}>
              <Icon.Command size={18} />
              <span className="rail__tooltip">Command (⌘K)</span>
            </button>
          </div>
        </aside>

        {/* Contextual pane */}
        <aside className="pane">
          <div className="pane__header">
            <div className="pane__title">{pane.title}</div>
            <button className="btn btn--ghost btn--icon btn--sm" title="New" onClick={() => setCmdkOpen(true)}>
              <Icon.Plus size={14} />
            </button>
          </div>
          <div className="pane__search" onClick={() => setCmdkOpen(true)}>
            <Icon.Search size={14} />
            <span style={{ flex: 1 }}>Quick search…</span>
            <kbd>⌘K</kbd>
          </div>
          <div className="pane__body">
            {pane.sections.map((sec, i) => (
              <div className="pane__section" key={i}>
                {sec.label && <div className="pane__section-label">{sec.label}</div>}
                {sec.items.map((it) => {
                  const Ic = Icon[it.icon];
                  return (
                    <div
                      key={it.id}
                      className="pane__item"
                      data-active={route === it.route && (it.id === route || section === ROUTE_TO_SECTION[it.route])}
                      onClick={() => goto(it.route)}
                    >
                      <span className="pane__item-icon" style={it.color ? { color: it.color } : undefined}>
                        <Ic size={15} />
                      </span>
                      <span>{it.label}</span>
                      {typeof it.count === "number" && <span className="pane__item-count">{it.count}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
            {pane.pinned && (
              <div className="pane__section">
                <div className="pane__section-label">{pane.pinned.label}</div>
                {pane.pinned.items.map((it) => {
                  const Ic = Icon[it.icon];
                  return (
                    <div key={it.id} className="pane__item" onClick={() => goto(it.route)}>
                      <span className="pane__item-icon" style={it.color ? { color: it.color } : undefined}>
                        <Ic size={15} />
                      </span>
                      <span>{it.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="pane__footer">
            <div className="pane__user">
              <Avatar name={MockData.user.name} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="pane__user-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {MockData.user.name}
                </div>
                <div className="pane__user-plan">{MockData.user.plan} plan</div>
              </div>
              <Icon.ChevronDown size={14} />
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <header className="topbar">
            <div className="topbar__crumbs">
              <span>{crumbs[0]}</span>
              <Icon.ChevronRight size={12} />
              <strong>{crumbs[1]}</strong>
            </div>
            <div className="topbar__actions">
              <button className="btn btn--ghost btn--sm" onClick={() => setCmdkOpen(true)}>
                <Icon.Sparkles size={14} />
                Ask AI
                <span className="kbd" style={{ marginLeft: 4 }}>⌘K</span>
              </button>
              <button className="btn btn--ghost btn--icon btn--sm" title="Notifications">
                <Icon.Bell size={15} />
              </button>
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
          </header>
          <div className="main__body">
            <Router route={route} goto={goto} />
          </div>
        </main>
      </div>

      <CmdK open={cmdkOpen} onClose={() => setCmdkOpen(false)} onNavigate={goto} />
    </>
  );
}

function ThemeToggle({ theme, setTheme }) {
  return (
    <div className="theme-toggle">
      <button data-active={theme === "light"} onClick={() => setTheme("light")} title="Light"><Icon.Sun size={13} /></button>
      <button data-active={theme === "dark"} onClick={() => setTheme("dark")} title="Dark"><Icon.Moon size={13} /></button>
    </div>
  );
}

function Router({ route, goto }) {
  const S = window.Screens;
  switch (route) {
    case "design-system": return <S.DesignSystem />;
    case "dashboard":     return <S.Dashboard goto={goto} />;
    case "clients":       return <S.Clients goto={goto} />;
    case "projects":      return <S.Projects goto={goto} />;
    case "documents":     return <S.Documents goto={goto} />;
    case "finance":       return <S.Finance goto={goto} />;
    case "tasks":         return <S.Tasks goto={goto} />;
    case "time":          return <S.TimeTracker goto={goto} />;
    case "expenses":      return <S.Expenses goto={goto} />;
    case "settings":      return <S.Settings goto={goto} />;
    default:              return <S.DesignSystem />;
  }
}

window.App = App;
