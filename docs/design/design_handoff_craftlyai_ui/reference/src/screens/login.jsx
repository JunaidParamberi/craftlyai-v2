// CraftlyAI — Login / onboarding (split layout)
const { useState: useStateL } = React;

function Login({ goto, theme, setTheme }) {
  const [stage, setStage] = useStateL("login"); // "login" | "onboard"
  return (
    <div data-theme={theme} style={{
      minHeight: "100vh", background: "var(--bg-canvas)",
      display: "grid", gridTemplateColumns: "1fr 1fr",
    }}>
      {/* Left — form */}
      <div style={{
        display: "flex", flexDirection: "column",
        padding: "32px 56px", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "var(--fg)", color: "var(--bg-canvas)",
              display: "grid", placeItems: "center",
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, letterSpacing: "-0.04em",
            }}>C</div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em" }}>CraftlyAI</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="btn btn--ghost btn--sm" onClick={() => goto("design-system")}>
              <Icon.ChevronLeft size={12} />Back to system
            </button>
            <div className="theme-toggle">
              <button data-active={theme === "light"} onClick={() => setTheme("light")}><Icon.Sun size={13} /></button>
              <button data-active={theme === "dark"} onClick={() => setTheme("dark")}><Icon.Moon size={13} /></button>
            </div>
          </div>
        </div>

        <div className="fade-up" style={{ maxWidth: 380, width: "100%", margin: "0 auto" }}>
          {stage === "login" ? <LoginForm onContinue={() => setStage("onboard")} goto={goto} /> : <OnboardForm onFinish={() => goto("dashboard")} />}
        </div>

        <div className="dim" style={{ fontSize: 12, display: "flex", justifyContent: "space-between" }}>
          <span>© 2026 CraftlyAI</span>
          <div style={{ display: "flex", gap: 14 }}>
            <span>Privacy</span><span>Terms</span><span>Help</span>
          </div>
        </div>
      </div>

      {/* Right — visual */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(160deg, var(--accent-soft) 0%, var(--bg-canvas) 70%)",
        borderLeft: "1px solid var(--border)",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        padding: 48,
      }}>
        {/* Decorative grid */}
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.25 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <div className="fade-up" style={{ maxWidth: 460, position: "relative", zIndex: 1 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>CraftlyAI · v1</div>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 600,
            letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 14,
          }}>
            Your studio,<br />running itself in the background.
          </h2>
          <p style={{ fontSize: 15, color: "var(--fg-2)", lineHeight: 1.55, marginBottom: 28 }}>
            One quiet app for clients, projects, invoices and time. The AI handles the busywork — so you can stay in the craft.
          </p>

          {/* Mock floating cards */}
          <div style={{ display: "grid", gap: 12, transform: "perspective(900px) rotateY(-3deg) rotateX(2deg)" }}>
            <div className="card" style={{ padding: 14, boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center" }}>
                <Icon.Sparkles size={15} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Drafted follow-up for Atlas Studio</div>
                <div className="dim" style={{ fontSize: 11, marginTop: 2 }}>Ready in your outbox · INV-2049</div>
              </div>
              <span className="badge badge--accent">AI</span>
            </div>
            <div className="card" style={{ padding: 14, boxShadow: "var(--shadow-lg)", marginLeft: 32 }}>
              <div className="dim" style={{ fontSize: 11, marginBottom: 4 }}>Revenue this month</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.022em" }} className="tabular">
                  AED 42,180
                </div>
                <span className="badge badge--success">+18%</span>
              </div>
            </div>
            <div className="card" style={{ padding: 14, boxShadow: "var(--shadow-lg)", marginLeft: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <Icon.CircleCheck size={18} style={{ color: "var(--success)" }} />
              <div style={{ flex: 1, fontSize: 13 }}>
                <strong>Hawthorn & Co</strong> <span className="muted">paid INV-2051</span>
              </div>
              <span className="tabular" style={{ fontSize: 13, fontWeight: 600 }}>+8,400</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onContinue, goto }) {
  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, letterSpacing: "-0.025em", marginBottom: 8 }}>
        Welcome back
      </h1>
      <p style={{ color: "var(--fg-2)", fontSize: 14, marginBottom: 28 }}>
        Sign in to Studio Marchetti. Or <a style={{ color: "var(--accent)", fontWeight: 500 }}>create an account</a>.
      </p>

      <div style={{ display: "grid", gap: 14, marginBottom: 18 }}>
        <button className="btn btn--secondary btn--lg" style={{ width: "100%", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" style={{ display: "inline-block" }}>
            <path d="M21.35 11.1H12v2.94h5.34c-.23 1.26-.94 2.33-2 3.05v2.53h3.24c1.9-1.74 3-4.31 3-7.36 0-.69-.06-1.36-.18-2z" fill="#4285F4"/>
            <path d="M12 22c2.7 0 4.96-.89 6.62-2.42l-3.24-2.53c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H3.07v2.6A10 10 0 0 0 12 22z" fill="#34A853"/>
            <path d="M6.42 13.89A6 6 0 0 1 6.08 12c0-.66.12-1.3.34-1.89V7.5H3.07A10 10 0 0 0 2 12c0 1.61.38 3.13 1.07 4.5l3.35-2.61z" fill="#FBBC05"/>
            <path d="M12 5.95c1.47 0 2.78.5 3.82 1.5l2.86-2.85C16.95 3.04 14.7 2 12 2 8.07 2 4.66 4.25 3.07 7.5l3.35 2.61C7.2 7.7 9.4 5.95 12 5.95z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--fg-3)", fontSize: 12 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span>or with email</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        <div className="field">
          <label className="field__label">Email</label>
          <input className="input input--lg" placeholder="you@studio.com" defaultValue="lena@studiomarchetti.com" />
        </div>
        <div className="field">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <label className="field__label">Password</label>
            <a className="field__label" style={{ color: "var(--accent)" }}>Forgot?</a>
          </div>
          <input className="input input--lg" type="password" defaultValue="••••••••" />
        </div>
        <button className="btn btn--primary btn--lg" onClick={() => goto("dashboard")} style={{ justifyContent: "center", marginTop: 4 }}>
          Sign in <Icon.ArrowRight size={14} />
        </button>
        <button className="btn btn--ghost btn--sm" onClick={onContinue} style={{ justifyContent: "center" }}>
          <Icon.Mail size={12} />Email me a magic link
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 24, fontSize: 12 }} className="dim">
        New here? <a style={{ color: "var(--accent)", fontWeight: 500 }} onClick={onContinue}>Create a free account</a>
      </div>
    </div>
  );
}

function OnboardForm({ onFinish }) {
  const [step, setStep] = useStateL(1);
  const steps = ["Your profile", "Brand kit", "First client"];

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{
              height: 3, borderRadius: 2,
              background: i + 1 <= step ? "var(--accent)" : "var(--bg-subtle)",
              transition: "background var(--dur-base)",
            }} />
            <div style={{ fontSize: 11, marginTop: 6, color: i + 1 === step ? "var(--fg)" : "var(--fg-3)", fontWeight: i + 1 === step ? 500 : 400 }}>
              {i + 1}. {s}
            </div>
          </div>
        ))}
      </div>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, letterSpacing: "-0.022em", marginBottom: 8 }}>
        {step === 1 && "Tell us about your studio"}
        {step === 2 && "Make it yours"}
        {step === 3 && "Add your first client"}
      </h1>
      <p style={{ color: "var(--fg-2)", fontSize: 13.5, marginBottom: 24, lineHeight: 1.55 }}>
        {step === 1 && "This is what clients will see on documents and your portal."}
        {step === 2 && "Drop a logo and pick a color. We'll use it on every PDF you send."}
        {step === 3 && "Add a real client — we'll pre-fill their info on your first invoice."}
      </p>

      {step === 1 && (
        <div style={{ display: "grid", gap: 14 }}>
          <div className="field"><label className="field__label">Studio name</label><input className="input input--lg" placeholder="Studio Marchetti" /></div>
          <div className="field"><label className="field__label">What do you do?</label>
            <div className="input input--lg" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Brand & web design</span><Icon.ChevronDown size={14} />
            </div>
          </div>
          <div className="field"><label className="field__label">Default currency</label>
            <div className="input input--lg" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>AED · UAE Dirham</span><Icon.ChevronDown size={14} />
            </div>
          </div>
        </div>
      )}
      {step === 2 && (
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ border: "1.5px dashed var(--border-strong)", padding: 24, borderRadius: 10, textAlign: "center" }}>
            <Icon.Upload size={20} />
            <div style={{ fontWeight: 500, marginTop: 8 }}>Drop a logo here</div>
            <div className="dim" style={{ fontSize: 12, marginTop: 4 }}>PNG or SVG · 512×512+</div>
          </div>
          <div className="field"><label className="field__label">Accent color</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["#3550E0", "#1F8A52", "#B36A12", "#C13838", "#7C4DBC", "#0F7A8F"].map((c, i) => (
                <div key={c} style={{
                  width: 32, height: 32, borderRadius: 8, background: c, cursor: "pointer",
                  border: i === 0 ? "2px solid var(--fg)" : "2px solid transparent",
                }} />
              ))}
            </div>
          </div>
        </div>
      )}
      {step === 3 && (
        <div style={{ display: "grid", gap: 14 }}>
          <div className="field"><label className="field__label">Client name</label><input className="input input--lg" placeholder="e.g. Onyx Ventures" /></div>
          <div className="field"><label className="field__label">Contact email</label><input className="input input--lg" placeholder="dana@onyx.vc" /></div>
          <div className="field"><label className="field__label">Currency</label>
            <div className="input input--lg" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Use default · AED</span><Icon.ChevronDown size={14} />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
        {step > 1 && <button className="btn btn--ghost btn--lg" onClick={() => setStep(s => s - 1)}>Back</button>}
        <div style={{ flex: 1 }} />
        <button className="btn btn--ghost btn--lg" onClick={onFinish}>Skip</button>
        <button
          className="btn btn--primary btn--lg"
          onClick={() => step < 3 ? setStep(s => s + 1) : onFinish()}
        >
          {step === 3 ? "Finish setup" : "Continue"} <Icon.ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

window.Screens = window.Screens || {};
window.Screens.Login = Login;
