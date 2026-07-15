import React, { useEffect, useMemo, useRef, useState } from "react";

const API = "";

const GLOBAL_CSS = `
.dm-root{
  --bg:#f7f8f4;
  --ink:#111111;
  --ink-soft:#4d5562;
  --line:#1f2937;
  --line-soft:#c9d2cf;
  --surface:#ffffff;
  --surface-2:#eef6f3;
  --surface-3:#e7edf8;
  --accent:#b81b39;
  --accent-2:#087f8c;
  --accent-3:#f5b700;
  min-height:100vh;
  color:var(--ink);
  background:
    radial-gradient(var(--line-soft) 1px, transparent 1px),
    linear-gradient(180deg, #fbfcf8 0%, #eef6f3 100%);
  background-size:22px 22px, 100% 100%;
  font-family:Consolas, "Courier New", monospace;
}
.dm-root *{box-sizing:border-box}
.dm-h-display{font-family:Impact, "Arial Narrow", sans-serif; font-weight:800; letter-spacing:0; text-transform:uppercase}
.dm-h-status{font-family:Consolas, "Courier New", monospace; letter-spacing:0}
.dm-shell{width:min(1120px, calc(100% - 48px)); margin:0 auto; padding:34px 0 48px}
.dm-rail{position:fixed; top:0; bottom:0; width:34px; display:flex; flex-direction:column; align-items:center; gap:26px; padding-top:24px; z-index:15; pointer-events:none}
.dm-rail.left{left:0; border-right:1px solid var(--line-soft)}
.dm-rail.right{right:0; border-left:1px solid var(--line-soft)}
.dm-hole{width:8px; height:8px; border-radius:50%; background:var(--ink)}
.dm-topnav{position:fixed; top:10px; right:10px; z-index:30; display:flex; flex-wrap:wrap; gap:6px; max-width:min(620px, calc(100% - 20px)); background:var(--ink); color:var(--bg); border:2px solid var(--accent); padding:8px}
.dm-topnav button{height:30px; border:1px solid #f7f8f4; background:transparent; color:#f7f8f4; padding:0 10px; font:14px Consolas, "Courier New", monospace; cursor:pointer}
.dm-topnav button.active{background:var(--accent); border-color:var(--accent)}
.dm-btn{min-height:38px; border:2px solid var(--ink); background:var(--surface); color:var(--ink); padding:8px 16px; font:700 14px Consolas, "Courier New", monospace; cursor:pointer; text-transform:uppercase}
.dm-btn:hover,.dm-btn:focus-visible{background:var(--ink); color:var(--bg)}
.dm-btn.solid{background:var(--ink); color:var(--bg)}
.dm-btn.solid:hover,.dm-btn.solid:focus-visible{background:var(--accent); border-color:var(--accent)}
.dm-btn:disabled{opacity:.55; cursor:not-allowed}
.dm-link{color:var(--accent); font-weight:700; text-decoration:none; border-bottom:1px solid var(--accent)}
.dm-card{background:var(--surface); border:2px solid var(--ink); box-shadow:4px 4px 0 var(--ink)}
.dm-panel{background:var(--surface); border:2px solid var(--ink)}
.dm-muted{color:var(--ink-soft)}
.dm-tear{display:flex; align-items:center; gap:10px; color:var(--ink-soft); margin:34px 0; font-size:13px; text-transform:uppercase}
.dm-tear:before,.dm-tear:after{content:""; flex:1; border-top:2px dashed var(--line-soft)}
.dm-field label{display:block; margin-bottom:6px; font-size:12px; font-weight:700; text-transform:uppercase}
.dm-field input,.dm-field textarea,.dm-field select{width:100%; border:0; border-bottom:2px solid var(--ink); background:transparent; color:var(--ink); padding:9px 2px; font:14px Consolas, "Courier New", monospace; outline:none}
.dm-field textarea{resize:vertical; min-height:100px}
.dm-field input:focus,.dm-field textarea:focus,.dm-field select:focus{border-bottom-color:var(--accent)}
.dm-badge{display:inline-flex; align-items:center; justify-content:center; min-height:24px; padding:2px 10px; border:1px solid var(--ink); font-size:12px; text-transform:uppercase}
.dm-badge.published{background:var(--ink); color:var(--bg)}
.dm-badge.draft{background:var(--surface-3); color:var(--ink)}
.dm-badge.new{background:var(--accent); color:var(--bg); border-color:var(--accent)}
.dm-badge.read{background:var(--surface-2); color:var(--ink)}
.dm-badge.archived{background:var(--line-soft); color:var(--ink)}
.dm-error,.dm-success{border:2px solid var(--accent); padding:12px 14px; margin-bottom:16px; font-size:13px; background:var(--surface)}
.dm-success{border-color:var(--accent-2); color:var(--accent-2)}
.dm-grid-2{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:22px}
.dm-grid-3{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px}
.dm-grid-4{display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px}
.dm-table-row{display:grid; gap:12px; align-items:center; border-bottom:1px dashed var(--line-soft); padding:12px 0; font-size:13px}
.dm-hero-title{font-size:76px; line-height:.92; margin:0}
.dm-section-title{font-size:28px; margin:0 0 4px}
.dm-admin-shell{display:grid; grid-template-columns:230px 1fr; min-height:100vh; gap:0}
.dm-sidebar{border-right:2px solid var(--ink); background:var(--surface-2); padding:24px 18px; display:flex; flex-direction:column}
.dm-sidebar button{width:100%; text-align:left; border:0; background:transparent; color:var(--ink); padding:10px; font:14px Consolas, "Courier New", monospace; cursor:pointer}
.dm-sidebar button.active{background:var(--ink); color:var(--bg)}
.dm-stat{min-height:116px; padding:15px}
.dm-stat-value{font-size:34px; color:var(--accent); overflow-wrap:anywhere}
.dm-contact-message{white-space:pre-wrap; overflow-wrap:anywhere; line-height:1.55}
.dm-chart{display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); gap:10px; align-items:end; min-height:120px; border-bottom:2px solid var(--ink); padding-top:12px}
.dm-chart-bar{background:var(--accent-2); min-height:4px; border:1px solid var(--ink)}
.dm-loading{min-height:100vh; display:grid; place-items:center; font-size:18px; color:var(--ink-soft)}
@media(max-width:900px){
  .dm-shell{width:min(100% - 28px, 760px); padding-top:74px}
  .dm-rail{display:none}
  .dm-hero-title{font-size:48px}
  .dm-grid-2,.dm-grid-3,.dm-grid-4{grid-template-columns:1fr}
  .dm-admin-shell{grid-template-columns:1fr}
  .dm-sidebar{border-right:0; border-bottom:2px solid var(--ink)}
  .dm-sidebar nav{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px}
  .dm-table-row{grid-template-columns:1fr !important}
}
`;

const ADMIN_VIEWS = ["dashboard", "projects", "edit", "cv", "contacts"];

const emptyProject = {
  id: null,
  title: "",
  short: "",
  long: "",
  tags: [],
  demo: "",
  repo: "",
  status: "draft",
  featured: false,
  metrics: [],
  updated: new Date().toISOString().slice(0, 10),
};

function Rails() {
  return (
    <>
      <div className="dm-rail left">{Array.from({ length: 18 }, (_, i) => <span className="dm-hole" key={i} />)}</div>
      <div className="dm-rail right">{Array.from({ length: 18 }, (_, i) => <span className="dm-hole" key={i} />)}</div>
    </>
  );
}

function Tear({ children = "section" }) {
  return <div className="dm-tear">{children}</div>;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function shortDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

function bar(pct) {
  const total = 14;
  const filled = Math.round((pct / 100) * total);
  return "#".repeat(filled) + ".".repeat(total - filled);
}

const skillGroups = [
  { name: "Langages", items: [["C", 72], ["C++", 78], ["Java", 82], ["Python", 80]] },
  { name: "Developpement web", items: [["HTML", 88], ["CSS", 84], ["JavaScript", 82], ["Angular", 78]] },
  { name: "Frameworks", items: [["Laravel", 76], ["JHipster", 70], ["Spring Boot", 74], ["Flask", 78]] },
  { name: "Donnees & BI", items: [["SQL", 84], ["MySQL", 86], ["PL/pgSQL", 70], ["Talend", 72], ["Tableau", 72], ["Power BI", 78]] },
];

const languages = ["Francais courant", "Anglais intermediaire"];
const interests = ["Technologie et innovation", "Football", "Musculation"];

function PortfolioSite({ projects, cv, onOpenCv }) {
  const featured = projects.find((project) => project.featured) || projects[0];
  const others = projects.filter((project) => project.id !== featured?.id);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [sending, setSending] = useState(false);

  const setField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submitContact = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus({ type: "", message: "" });
    try {
      const res = await fetch(`${API}/api/contact`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Le message n'a pas pu etre envoye.");
      setForm({ name: "", email: "", subject: "", message: "" });
      setStatus({ type: "success", message: data.message || "Message recu. Merci." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="dm-shell">
      <section className="dm-card" style={{ padding: "24px 28px", marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap", borderBottom: "1px dashed var(--line-soft)", paddingBottom: 12, marginBottom: 22, color: "var(--ink-soft)", fontSize: 13 }}>
          <span>portfolio.run</span>
          <span>developpeur full-stack</span>
          <span>Dakar / remote</span>
        </div>
        <div className="dm-grid-2" style={{ alignItems: "end" }}>
          <div>
            <h1 className="dm-h-display dm-hero-title">Yaya<br /><span style={{ color: "var(--accent)" }}>Gaye</span></h1>
            <p style={{ maxWidth: 620, fontWeight: 700, color: "var(--ink-soft)", lineHeight: 1.7 }}>
              Developpeur Full-Stack passionne par la conception d'applications web modernes,
              performantes et intuitives. Je cree des solutions efficaces avec Angular, PHP,
              Java, MySQL, Flask et Spring Boot.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
              <button className="dm-btn solid" onClick={onOpenCv}>Afficher le CV</button>
              <a className="dm-btn" href="#contact" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Contact</a>
            </div>
          </div>
          <div className="dm-panel" style={{ padding: 18, background: "var(--surface-3)" }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>profil actif</div>
            {[
              ["stack", "Angular / PHP / Java / MySQL"],
              ["focus", "applications web, donnees, BI"],
              ["formation", "Master 2 Informatique en cours"],
              ["projets", `${projects.length || 0} projets academiques`],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, padding: "8px 0", borderTop: "1px dashed var(--line-soft)", fontSize: 13 }}>
                <b>{label}</b>
                <span className="dm-muted">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Tear>competences</Tear>
      <section>
        <h2 className="dm-h-display dm-section-title">Diagnostic systeme</h2>
        <div className="dm-grid-2" style={{ marginTop: 20 }}>
          {skillGroups.map((group) => (
            <div key={group.name} className="dm-panel" style={{ padding: 18 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, textTransform: "uppercase" }}>{group.name}</h3>
              {group.items.map(([name, pct]) => (
                <div key={name} style={{ display: "grid", gridTemplateColumns: "120px 1fr 44px", gap: 10, alignItems: "center", marginBottom: 8, fontSize: 13 }}>
                  <span>{name}</span>
                  <span style={{ color: "var(--accent-2)", overflowWrap: "anywhere" }}>{bar(pct)}</span>
                  <b>{pct}%</b>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <Tear>projets</Tear>
      <section>
        <h2 className="dm-h-display dm-section-title">Projets publics</h2>
        {featured ? (
          <div className="dm-panel" style={{ padding: 22, marginTop: 18, background: "var(--surface-2)" }}>
            <div className="dm-grid-2" style={{ alignItems: "center" }}>
              <div>
                <span className={`dm-badge ${featured.status}`}>{featured.status === "published" ? "publie" : "brouillon"}</span>
                <h3 className="dm-h-display" style={{ fontSize: 26, margin: "12px 0 8px" }}>{featured.title}</h3>
                <p className="dm-muted" style={{ lineHeight: 1.7 }}>{featured.long || featured.short}</p>
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 14 }}>
                  {featured.metrics?.map((metric) => (
                    <div key={`${metric.label}-${metric.value}`}>
                      <b style={{ color: "var(--accent)", display: "block", fontSize: 20 }}>{metric.value}</b>
                      <span style={{ fontSize: 12 }}>{metric.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                  {featured.demo && <a className="dm-link" href={featured.demo} target="_blank" rel="noreferrer">Demo</a>}
                  {featured.repo && <a className="dm-link" href={featured.repo} target="_blank" rel="noreferrer">Code</a>}
                </div>
              </div>
              <svg viewBox="0 0 320 160" width="100%" height="160" role="img" aria-label="Courbe de progression du projet">
                <rect x="0" y="0" width="320" height="160" fill="#ffffff" stroke="#111111" strokeWidth="2" />
                <line x1="20" y1="130" x2="300" y2="130" stroke="#111111" strokeWidth="2" />
                <line x1="20" y1="20" x2="20" y2="130" stroke="#111111" strokeWidth="2" />
                <polyline points="20,112 62,98 104,104 146,70 188,64 230,42 272,28 300,22" fill="none" stroke="#b81b39" strokeWidth="5" />
                <circle cx="300" cy="22" r="7" fill="#087f8c" stroke="#111111" strokeWidth="2" />
              </svg>
            </div>
          </div>
        ) : (
          <p className="dm-muted">Aucun projet publie pour le moment.</p>
        )}

        <div className="dm-grid-2" style={{ marginTop: 20 }}>
          {others.map((project) => (
            <article key={project.id} className="dm-panel" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                <h3 className="dm-h-display" style={{ fontSize: 20, margin: 0 }}>{project.title}</h3>
                <span className={`dm-badge ${project.status}`}>{project.status === "published" ? "publie" : "brouillon"}</span>
              </div>
              <p className="dm-muted" style={{ lineHeight: 1.6 }}>{project.short}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12 }}>
                {project.tags.map((tag) => <span key={tag} className="dm-badge read">{tag}</span>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <Tear>cv</Tear>
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h2 className="dm-h-display dm-section-title">CV public</h2>
            <p className="dm-muted" style={{ margin: "4px 0 0" }}>Formation, projets academiques et technologies principales.</p>
          </div>
          <button className="dm-btn" onClick={onOpenCv}>Ouvrir le CV complet</button>
        </div>
        <div style={{ borderTop: "2px solid var(--ink)", marginTop: 18 }}>
          {cv.slice(0, 3).map((entry) => (
            <div key={entry.id} className="dm-table-row" style={{ gridTemplateColumns: "110px 1fr 190px" }}>
              <div>
                <b style={{ color: "var(--accent)" }}>{entry.version}</b>
                <div className="dm-muted" style={{ fontSize: 12 }}>{entry.period}</div>
              </div>
              <div>
                <b>{entry.role} - {entry.company}</b>
                <p className="dm-muted" style={{ margin: "5px 0 0", lineHeight: 1.55 }}>{entry.description}</p>
              </div>
              <span className="dm-muted" style={{ textAlign: "right" }}>{entry.tech}</span>
            </div>
          ))}
        </div>
      </section>

      <Tear>contact</Tear>
      <section id="contact" style={{ marginBottom: 40 }}>
        <h2 className="dm-h-display dm-section-title">Contact</h2>
        <form className="dm-card" style={{ padding: 22, maxWidth: 680, marginTop: 18 }} onSubmit={submitContact}>
          {status.message && <div className={status.type === "success" ? "dm-success" : "dm-error"}>{status.message}</div>}
          <div className="dm-grid-2">
            <div className="dm-field"><label>Nom</label><input value={form.name} onChange={setField("name")} required minLength={2} /></div>
            <div className="dm-field"><label>Email</label><input type="email" value={form.email} onChange={setField("email")} required /></div>
          </div>
          <div className="dm-field" style={{ marginTop: 16 }}><label>Sujet</label><input value={form.subject} onChange={setField("subject")} /></div>
          <div className="dm-field" style={{ marginTop: 16 }}><label>Message</label><textarea value={form.message} onChange={setField("message")} required minLength={10} /></div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginTop: 18 }}>
            <button className="dm-btn solid" type="submit" disabled={sending}>{sending ? "Envoi..." : "Envoyer"}</button>
            <a className="dm-link" href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
            <a className="dm-link" href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </form>
      </section>
    </div>
  );
}

function PublicCV({ cv, projects, onBack }) {
  return (
    <div className="dm-shell">
      <section className="dm-card" style={{ padding: "24px 28px", marginTop: 24 }}>
        <button className="dm-btn" onClick={onBack} style={{ marginBottom: 20 }}>Retour au portfolio</button>
        <div className="dm-grid-2" style={{ alignItems: "start" }}>
          <div>
            <h1 className="dm-h-display dm-hero-title">Curriculum<br /><span style={{ color: "var(--accent)" }}>vitae</span></h1>
            <p className="dm-muted" style={{ lineHeight: 1.7, maxWidth: 620 }}>
              Developpeur Full-Stack passionne par les applications web modernes,
              performantes et intuitives. Mon objectif est de creer des solutions
              innovantes en appliquant les bonnes pratiques du genie logiciel.
            </p>
          </div>
          <div className="dm-panel" style={{ padding: 18, background: "var(--surface-3)" }}>
            <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
              <div><b>Nom</b><br /><span className="dm-muted">Yaya Gaye</span></div>
              <div><b>Localisation</b><br /><span className="dm-muted">Dakar / remote</span></div>
              <div><b>Specialites</b><br /><span className="dm-muted">Angular, PHP, Java, MySQL, Flask, Spring Boot</span></div>
              <div><b>Langues</b><br /><span className="dm-muted">{languages.join(" / ")}</span></div>
              <div><b>Centres d'interet</b><br /><span className="dm-muted">{interests.join(" / ")}</span></div>
              <div><b>Projets publies</b><br /><span className="dm-muted">{projects.length}</span></div>
            </div>
          </div>
        </div>
      </section>

      <Tear>formation</Tear>
      <section className="dm-panel" style={{ padding: "6px 22px" }}>
        {cv.map((entry) => (
          <article key={entry.id} className="dm-table-row" style={{ gridTemplateColumns: "140px 1fr 220px" }}>
            <div>
              <b style={{ color: "var(--accent)" }}>{entry.period}</b>
              <div className="dm-muted" style={{ fontSize: 12 }}>#{entry.hash}</div>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: "0 0 6px" }}>{entry.role} - {entry.company}</h2>
              <p className="dm-muted" style={{ margin: 0, lineHeight: 1.65 }}>{entry.description}</p>
            </div>
            <div className="dm-muted" style={{ textAlign: "right" }}>{entry.tech}</div>
          </article>
        ))}
      </section>

      <Tear>projets selectionnes</Tear>
      <section className="dm-grid-2">
        {projects.slice(0, 4).map((project) => (
          <article className="dm-panel" style={{ padding: 18 }} key={project.id}>
            <h2 className="dm-h-display" style={{ fontSize: 20, margin: "0 0 8px" }}>{project.title}</h2>
            <p className="dm-muted" style={{ lineHeight: 1.6 }}>{project.short}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {project.tags.map((tag) => <span className="dm-badge read" key={tag}>{tag}</span>)}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Identifiants invalides.");
      await onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dm-shell" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <section className="dm-card" style={{ width: "min(480px, 100%)", padding: "32px 34px" }}>
        <h1 className="dm-h-display" style={{ fontSize: 28, margin: "0 0 8px" }}>Admin access</h1>
        <p className="dm-muted" style={{ margin: "0 0 22px" }}>Session protegee par cookie HTTP-only.</p>
        {error && <div className="dm-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="dm-field" style={{ marginBottom: 20 }}>
            <label>Identifiant</label>
            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
          </div>
          <div className="dm-field" style={{ marginBottom: 24 }}>
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          </div>
          <button className="dm-btn solid" type="submit" disabled={submitting}>{submitting ? "Verification..." : "Connexion"}</button>
        </form>
      </section>
    </div>
  );
}

function AdminLayout({ current, setView, path, children, onLogout }) {
  const nav = [
    ["dashboard", "Dashboard"],
    ["projects", "Projets"],
    ["cv", "CV"],
    ["contacts", "Contacts"],
  ];

  return (
    <div className="dm-shell dm-admin-shell">
      <aside className="dm-sidebar">
        <div className="dm-h-display" style={{ fontSize: 22, marginBottom: 28 }}>Portfolio<span style={{ color: "var(--accent)" }}>.</span>admin</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {nav.map(([key, label]) => (
            <button key={key} className={current === key ? "active" : ""} onClick={() => setView(key)}>{label}</button>
          ))}
        </nav>
        <button onClick={onLogout} style={{ border: "1px solid var(--line)", marginTop: 16 }}>Deconnexion</button>
      </aside>
      <main style={{ padding: "24px 28px", minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderBottom: "1px solid var(--line-soft)", paddingBottom: 12, marginBottom: 24, color: "var(--ink-soft)", fontSize: 13 }}>
          <span>{path}</span>
          <span style={{ color: "var(--accent-2)", fontWeight: 700 }}>session active</span>
        </div>
        {children}
      </main>
    </div>
  );
}

function AdminDashboard({ projects, cv, contacts, metrics, setView }) {
  const published = projects.filter((project) => project.status === "published").length;
  const drafts = projects.filter((project) => project.status === "draft").length;
  const unread = metrics?.contacts?.unread ?? contacts.filter((contact) => !contact.read).length;
  const visits = metrics?.analytics?.totalVisits ?? 0;
  const chartMax = Math.max(...(metrics?.analytics?.last7Days || []).map((day) => day.views), 1);

  return (
    <div>
      <h1 className="dm-h-display dm-section-title">Tableau de bord</h1>
      <div className="dm-grid-4" style={{ marginTop: 18 }}>
        {[
          ["projets publies", published],
          ["brouillons", drafts],
          ["visites", visits],
          ["messages non lus", unread],
        ].map(([label, value]) => (
          <div key={label} className="dm-panel dm-stat">
            <div className="dm-h-status dm-stat-value">{value}</div>
            <div style={{ fontSize: 12, textTransform: "uppercase" }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="dm-grid-2" style={{ marginTop: 28 }}>
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, textTransform: "uppercase", margin: 0 }}>Visiteurs 7 jours</h2>
            <span className="dm-muted" style={{ fontSize: 12 }}>uniques: {metrics?.analytics?.uniqueVisitors ?? 0}</span>
          </div>
          <div className="dm-panel" style={{ padding: 16 }}>
            <div className="dm-chart">
              {(metrics?.analytics?.last7Days || []).map((day) => (
                <div key={day.date} style={{ display: "grid", gap: 6, alignItems: "end" }}>
                  <div className="dm-chart-bar" style={{ height: `${Math.max(8, (day.views / chartMax) * 100)}px` }} title={`${day.views} visites`} />
                  <span style={{ fontSize: 11, textAlign: "center" }}>{shortDate(day.date)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, textTransform: "uppercase", margin: 0 }}>Messages recents</h2>
            <button className="dm-btn" onClick={() => setView("contacts")}>Ouvrir</button>
          </div>
          <div className="dm-panel" style={{ padding: "4px 16px" }}>
            {contacts.slice(0, 4).map((contact) => (
              <div key={contact.id} className="dm-table-row" style={{ gridTemplateColumns: "1fr 90px" }}>
                <div>
                  <b>{contact.name}</b>
                  <div className="dm-muted" style={{ fontSize: 12 }}>{contact.email}</div>
                </div>
                <span className={`dm-badge ${contact.status}`}>{contact.status}</span>
              </div>
            ))}
            {contacts.length === 0 && <p className="dm-muted">Aucun message pour le moment.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

function AdminProjectsList({ projects, onEdit, onNew, onDelete }) {
  const [query, setQuery] = useState("");
  const filtered = projects.filter((project) => project.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
        <h1 className="dm-h-display dm-section-title">Projets</h1>
        <button className="dm-btn solid" onClick={onNew}>Nouveau projet</button>
      </div>
      <div className="dm-field" style={{ maxWidth: 360, marginBottom: 18 }}>
        <label>Recherche</label>
        <input value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div style={{ borderTop: "2px solid var(--ink)" }}>
        <div className="dm-table-row" style={{ gridTemplateColumns: "1fr 120px 1fr 110px 80px", fontSize: 11, textTransform: "uppercase", color: "var(--ink-soft)" }}>
          <span>Titre</span><span>Statut</span><span>Tags</span><span>Maj</span><span></span>
        </div>
        {filtered.map((project) => (
          <div key={project.id} className="dm-table-row" style={{ gridTemplateColumns: "1fr 120px 1fr 110px 80px" }}>
            <button onClick={() => onEdit(project)} style={{ border: 0, background: "transparent", padding: 0, textAlign: "left", font: "700 13px Consolas, 'Courier New', monospace", cursor: "pointer" }}>{project.title}</button>
            <span className={`dm-badge ${project.status}`}>{project.status === "published" ? "publie" : "brouillon"}</span>
            <span className="dm-muted">{project.tags.join(" / ")}</span>
            <span className="dm-muted">{project.updated}</span>
            <button onClick={() => onDelete(project)} style={{ border: 0, background: "transparent", color: "var(--accent)", cursor: "pointer", fontWeight: 700 }}>Suppr.</button>
          </div>
        ))}
        {filtered.length === 0 && <p className="dm-muted">Aucun resultat.</p>}
      </div>
    </div>
  );
}

function AdminProjectEdit({ project, onSave, onCancel }) {
  const [form, setForm] = useState(project || emptyProject);
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  return (
    <div>
      <h1 className="dm-h-display dm-section-title">{form.id ? "Editer le projet" : "Nouveau projet"}</h1>
      <div className="dm-grid-2" style={{ marginTop: 20, alignItems: "start" }}>
        <section>
          <div className="dm-field" style={{ marginBottom: 16 }}><label>Titre</label><input value={form.title} onChange={set("title")} required /></div>
          <div className="dm-field" style={{ marginBottom: 16 }}><label>Description courte</label><input value={form.short} onChange={set("short")} /></div>
          <div className="dm-field" style={{ marginBottom: 16 }}><label>Description longue</label><textarea value={form.long} onChange={set("long")} /></div>
          <div className="dm-field" style={{ marginBottom: 16 }}><label>Stack</label><input value={form.tags.join(", ")} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) }))} /></div>
          <div className="dm-grid-2" style={{ marginBottom: 16 }}>
            <div className="dm-field"><label>Lien demo</label><input value={form.demo} onChange={set("demo")} /></div>
            <div className="dm-field"><label>Lien repo</label><input value={form.repo} onChange={set("repo")} /></div>
          </div>
          <div className="dm-grid-2" style={{ marginBottom: 22 }}>
            <div className="dm-field"><label>Statut</label><select value={form.status} onChange={set("status")}><option value="draft">Brouillon</option><option value="published">Publie</option></select></div>
            <label style={{ display: "flex", alignItems: "end", gap: 10, minHeight: 58, fontWeight: 700 }}>
              <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} />
              Projet mis en avant
            </label>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="dm-btn solid" onClick={() => onSave(form)}>Enregistrer</button>
            <button className="dm-btn" onClick={onCancel}>Annuler</button>
          </div>
        </section>
        <aside className="dm-panel" style={{ padding: 18, background: "var(--surface-2)" }}>
          <span className={`dm-badge ${form.status}`}>{form.status === "published" ? "publie" : "brouillon"}</span>
          <h2 className="dm-h-display" style={{ fontSize: 22, margin: "14px 0 8px" }}>{form.title || "Titre du projet"}</h2>
          <p className="dm-muted" style={{ lineHeight: 1.6 }}>{form.short || "Description courte du projet."}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(form.tags.length ? form.tags : ["React", "Node"]).map((tag) => <span className="dm-badge read" key={tag}>{tag}</span>)}
          </div>
        </aside>
      </div>
    </div>
  );
}

function AdminCV({ cv, setCv, onUnauthorized }) {
  const dragIndex = useRef(null);

  const persistOrder = async (list) => {
    const res = await fetch(`${API}/api/cv-reorder`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: list.map((entry) => entry.id) }),
    });
    if (res.status === 401) onUnauthorized();
  };

  const onDrop = (index) => () => {
    if (dragIndex.current === null) return;
    const list = [...cv];
    const [moved] = list.splice(dragIndex.current, 1);
    list.splice(index, 0, moved);
    dragIndex.current = null;
    setCv(list);
    persistOrder(list);
  };

  const updateField = (id, key, value) => {
    setCv((current) => current.map((entry) => (entry.id === id ? { ...entry, [key]: value } : entry)));
  };

  const saveEntry = async (entry) => {
    const res = await fetch(`${API}/api/cv/${entry.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (res.status === 401) onUnauthorized();
  };

  const handleBlur = (entry, key) => (event) => saveEntry({ ...entry, [key]: event.target.value });

  return (
    <div>
      <h1 className="dm-h-display dm-section-title">CV / experiences</h1>
      <div style={{ marginTop: 18 }}>
        {cv.map((entry, index) => (
          <section
            key={entry.id}
            draggable
            onDragStart={() => (dragIndex.current = index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop(index)}
            className="dm-panel"
            style={{ padding: 16, marginBottom: 14, cursor: "grab" }}
          >
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
              <b style={{ color: "var(--accent)" }}>{entry.version}</b>
              <span className="dm-muted">#{entry.hash}</span>
            </div>
            <div className="dm-grid-3" style={{ marginBottom: 12 }}>
              <div className="dm-field"><label>Poste</label><input value={entry.role} onChange={(event) => updateField(entry.id, "role", event.target.value)} onBlur={handleBlur(entry, "role")} /></div>
              <div className="dm-field"><label>Entreprise</label><input value={entry.company} onChange={(event) => updateField(entry.id, "company", event.target.value)} onBlur={handleBlur(entry, "company")} /></div>
              <div className="dm-field"><label>Periode</label><input value={entry.period} onChange={(event) => updateField(entry.id, "period", event.target.value)} onBlur={handleBlur(entry, "period")} /></div>
            </div>
            <div className="dm-field" style={{ marginBottom: 12 }}><label>Description</label><textarea value={entry.description} onChange={(event) => updateField(entry.id, "description", event.target.value)} onBlur={handleBlur(entry, "description")} /></div>
            <div className="dm-field"><label>Technologies</label><input value={entry.tech} onChange={(event) => updateField(entry.id, "tech", event.target.value)} onBlur={handleBlur(entry, "tech")} /></div>
          </section>
        ))}
      </div>
    </div>
  );
}

function AdminContacts({ contacts, onUpdate, onDelete }) {
  const [filter, setFilter] = useState("all");
  const visible = contacts.filter((contact) => {
    if (filter === "unread") return !contact.read;
    if (filter === "archived") return contact.status === "archived";
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
        <h1 className="dm-h-display dm-section-title">Contacts</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            ["all", "Tous"],
            ["unread", "Non lus"],
            ["archived", "Archives"],
          ].map(([key, label]) => (
            <button key={key} className={`dm-btn ${filter === key ? "solid" : ""}`} onClick={() => setFilter(key)}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {visible.map((contact) => (
          <article key={contact.id} className="dm-panel" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <div>
                <h2 style={{ fontSize: 18, margin: "0 0 4px" }}>{contact.name}</h2>
                <a className="dm-link" href={`mailto:${contact.email}`}>{contact.email}</a>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={`dm-badge ${contact.status}`}>{contact.status}</span>
                <div className="dm-muted" style={{ fontSize: 12, marginTop: 6 }}>{formatDate(contact.createdAt)}</div>
              </div>
            </div>
            {contact.subject && <b style={{ display: "block", marginBottom: 8 }}>{contact.subject}</b>}
            <p className="dm-contact-message dm-muted">{contact.message}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              {!contact.read && <button className="dm-btn" onClick={() => onUpdate(contact.id, { read: true, status: "read" })}>Marquer lu</button>}
              {contact.read && contact.status !== "archived" && <button className="dm-btn" onClick={() => onUpdate(contact.id, { read: false, status: "new" })}>Marquer non lu</button>}
              {contact.status !== "archived" && <button className="dm-btn" onClick={() => onUpdate(contact.id, { read: true, status: "archived" })}>Archiver</button>}
              <button className="dm-btn" onClick={() => onDelete(contact)}>Supprimer</button>
            </div>
          </article>
        ))}
        {visible.length === 0 && <p className="dm-muted">Aucun message dans cette vue.</p>}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("portfolio");
  const [projects, setProjects] = useState([]);
  const [cv, setCv] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const effectiveView = ADMIN_VIEWS.includes(view) && !isAuthenticated ? "login" : view;

  const paths = {
    dashboard: "~/admin/dashboard",
    projects: "~/admin/projets",
    edit: "~/admin/projets/edit",
    cv: "~/admin/cv",
    contacts: "~/admin/contacts",
  };

  const handleUnauthorized = () => {
    setIsAuthenticated(false);
    setContacts([]);
    setMetrics(null);
    if (ADMIN_VIEWS.includes(view)) setView("login");
  };

  const fetchJson = async (path, options = {}) => {
    const res = await fetch(`${API}${path}`, { credentials: "include", ...options });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (res.status === 401) handleUnauthorized();
      throw new Error(data?.message || "Requete impossible.");
    }
    return data;
  };

  const loadPublicData = async () => {
    const [projectsData, cvData] = await Promise.all([fetchJson("/api/projects"), fetchJson("/api/cv")]);
    setProjects(projectsData);
    setCv(cvData);
  };

  const refreshAdminData = async () => {
    const [contactsData, metricsData] = await Promise.all([fetchJson("/api/contacts"), fetchJson("/api/admin/metrics")]);
    setContacts(contactsData);
    setMetrics(metricsData);
  };

  useEffect(() => {
    let alive = true;
    const boot = async () => {
      setLoading(true);
      setApiError("");
      try {
        const meRes = await fetch(`${API}/api/auth/me`, { credentials: "include" });
        const authed = meRes.ok;
        if (!alive) return;
        setIsAuthenticated(authed);
        await loadPublicData();
        if (authed) await refreshAdminData();
      } catch (error) {
        if (alive) setApiError("Impossible de joindre l'API. Lancez le serveur sur le port 4000.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    boot();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("dm_visit_tracked")) return;
      sessionStorage.setItem("dm_visit_tracked", "1");
    } catch {
      // Ignore private browsing/session storage failures.
    }

    fetch(`${API}/api/analytics/visit`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: "portfolio" }),
    }).catch(() => {});
  }, []);

  const handleLogin = async () => {
    setIsAuthenticated(true);
    setView("dashboard");
    await loadPublicData();
    await refreshAdminData();
  };

  const handleLogout = async () => {
    await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    setIsAuthenticated(false);
    setContacts([]);
    setMetrics(null);
    setView("login");
    await loadPublicData().catch(() => {});
  };

  const openEdit = (project) => {
    setEditing(project);
    setView("edit");
  };

  const openNew = () => {
    setEditing(emptyProject);
    setView("edit");
  };

  const saveProject = async (form) => {
    setApiError("");
    try {
      const method = form.id ? "PUT" : "POST";
      const url = form.id ? `/api/projects/${form.id}` : "/api/projects";
      const saved = await fetchJson(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setProjects((current) => (form.id ? current.map((project) => (project.id === saved.id ? saved : project)) : [saved, ...current]));
      setView("projects");
      await refreshAdminData();
    } catch (error) {
      setApiError(error.message);
    }
  };

  const deleteProject = async (project) => {
    if (!confirm(`Supprimer "${project.title}" ?`)) return;
    setApiError("");
    try {
      await fetch(`${API}/api/projects/${project.id}`, { method: "DELETE", credentials: "include" }).then((res) => {
        if (res.status === 401) handleUnauthorized();
        if (!res.ok) throw new Error("Suppression impossible.");
      });
      setProjects((current) => current.filter((item) => item.id !== project.id));
    } catch (error) {
      setApiError(error.message);
    }
  };

  const updateContact = async (id, patch) => {
    setApiError("");
    try {
      const updated = await fetchJson(`/api/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      setContacts((current) => current.map((contact) => (contact.id === updated.id ? updated : contact)));
      await refreshAdminData();
    } catch (error) {
      setApiError(error.message);
    }
  };

  const deleteContact = async (contact) => {
    if (!confirm(`Supprimer le message de ${contact.name} ?`)) return;
    setApiError("");
    try {
      await fetch(`${API}/api/contacts/${contact.id}`, { method: "DELETE", credentials: "include" }).then((res) => {
        if (res.status === 401) handleUnauthorized();
        if (!res.ok) throw new Error("Suppression impossible.");
      });
      setContacts((current) => current.filter((item) => item.id !== contact.id));
      await refreshAdminData();
    } catch (error) {
      setApiError(error.message);
    }
  };

  const navView = effectiveView === "cv-public" ? "cv-public" : effectiveView;

  if (loading) {
    return (
      <div className="dm-root">
        <style>{GLOBAL_CSS}</style>
        <div className="dm-loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="dm-root">
      <style>{GLOBAL_CSS}</style>
      <Rails />
      <div className="dm-topnav">
        <button className={navView === "portfolio" ? "active" : ""} onClick={() => setView("portfolio")}>Site public</button>
        <button className={navView === "cv-public" ? "active" : ""} onClick={() => setView("cv-public")}>CV public</button>
        {isAuthenticated ? (
          <>
            <button className={navView === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>Dashboard</button>
            <button className={navView === "projects" || navView === "edit" ? "active" : ""} onClick={() => setView("projects")}>Projets</button>
            <button className={navView === "contacts" ? "active" : ""} onClick={() => setView("contacts")}>Contacts</button>
            <button onClick={handleLogout}>Deconnexion</button>
          </>
        ) : (
          <button className={navView === "login" ? "active" : ""} onClick={() => setView("login")}>Connexion admin</button>
        )}
      </div>

      {apiError && <div className="dm-shell" style={{ paddingBottom: 0 }}><div className="dm-error">{apiError}</div></div>}

      {effectiveView === "portfolio" && <PortfolioSite projects={projects} cv={cv} onOpenCv={() => setView("cv-public")} />}
      {effectiveView === "cv-public" && <PublicCV projects={projects} cv={cv} onBack={() => setView("portfolio")} />}
      {effectiveView === "login" && <AdminLogin onLogin={handleLogin} />}

      {ADMIN_VIEWS.includes(effectiveView) && (
        <AdminLayout current={effectiveView === "edit" ? "projects" : effectiveView} setView={setView} path={paths[effectiveView] || paths.dashboard} onLogout={handleLogout}>
          {effectiveView === "dashboard" && <AdminDashboard projects={projects} cv={cv} contacts={contacts} metrics={metrics} setView={setView} />}
          {effectiveView === "projects" && <AdminProjectsList projects={projects} onEdit={openEdit} onNew={openNew} onDelete={deleteProject} />}
          {effectiveView === "edit" && <AdminProjectEdit project={editing || emptyProject} onSave={saveProject} onCancel={() => setView("projects")} />}
          {effectiveView === "cv" && <AdminCV cv={cv} setCv={setCv} onUnauthorized={handleUnauthorized} />}
          {effectiveView === "contacts" && <AdminContacts contacts={contacts} onUpdate={updateContact} onDelete={deleteContact} />}
        </AdminLayout>
      )}
    </div>
  );
}
