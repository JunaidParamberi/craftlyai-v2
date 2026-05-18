// Cmd+K AI palette overlay
const { useState: useStateK, useEffect: useEffectK, useRef: useRefK, useMemo: useMemoK } = React;

function CmdK({ open, onClose, onNavigate }) {
  const [q, setQ] = useStateK("");
  const [active, setActive] = useStateK(0);
  const inputRef = useRefK(null);

  useEffectK(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQ("");
      setActive(0);
    }
  }, [open]);

  const items = useMemoK(() => {
    const all = [];
    const data = window.MockData.cmdk;
    if (q.trim()) {
      all.push({ group: "Ask CraftlyAI", items: [
        { id: "ai-q", icon: "Sparkles", label: q, sub: "Ask the AI router · routes to the right specialist", meta: "↵" },
      ]});
    }
    all.push({ group: "Suggested", items: data.quick });
    all.push({ group: "Go to", items: data.navigate });
    all.push({ group: "Create", items: data.create });
    // filter
    if (q.trim()) {
      const f = q.toLowerCase();
      return all.map(g => ({
        ...g,
        items: g.items.filter(it => g.group === "Ask CraftlyAI" || it.label.toLowerCase().includes(f)),
      })).filter(g => g.items.length);
    }
    return all;
  }, [q]);

  const flat = useMemoK(() => items.flatMap(g => g.items), [items]);

  useEffectK(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, flat.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
      else if (e.key === "Enter") {
        e.preventDefault();
        const sel = flat[active];
        if (sel) handleSelect(sel);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, flat, active]);

  const handleSelect = (it) => {
    const map = {
      "Dashboard": "dashboard", "Clients": "clients", "Projects": "projects",
      "Documents": "documents", "Finance": "finance",
    };
    if (map[it.label]) onNavigate(map[it.label]);
    onClose();
  };

  if (!open) return null;

  let runningIdx = -1;

  return (
    <div className="cmdk-backdrop" onClick={onClose}>
      <div className="cmdk" onClick={(e) => e.stopPropagation()}>
        <div className="cmdk__input">
          <Icon.Sparkles size={18} />
          <input
            ref={inputRef}
            placeholder="Ask CraftlyAI, search, or jump to…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
          />
          <span className="kbd">esc</span>
        </div>
        <div className="cmdk__body">
          {items.map((g) => (
            <div key={g.group}>
              <div className="cmdk__group-label">{g.group}</div>
              {g.items.map((it) => {
                runningIdx++;
                const IcoComp = Icon[it.icon] || Icon.Sparkles;
                const isAI = g.group === "Ask CraftlyAI" || g.group === "Suggested";
                return (
                  <div
                    key={it.id}
                    className="cmdk__item"
                    data-active={runningIdx === active}
                    onMouseEnter={() => setActive(runningIdx)}
                    onClick={() => handleSelect(it)}
                  >
                    <div className="cmdk__item-icon" style={isAI ? { background: "var(--accent-soft)", color: "var(--accent)" } : undefined}>
                      <IcoComp size={14} />
                    </div>
                    <div className="cmdk__item-text">
                      <div>{it.label}</div>
                      {it.sub && <div className="cmdk__item-sub">{it.sub}</div>}
                    </div>
                    {it.meta && <span className="kbd">{it.meta}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="cmdk__footer">
          <div className="cmdk__ai-hint">
            <Icon.Sparkles size={12} />
            <span>Router · Haiku, ~1.2s</span>
          </div>
          <div className="cmdk__footer-keys">
            <span><span className="kbd">↑↓</span> navigate</span>
            <span><span className="kbd">↵</span> select</span>
          </div>
        </div>
      </div>
    </div>
  );
}

window.CmdK = CmdK;
