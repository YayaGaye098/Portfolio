import crypto from "crypto";
import fs from "fs";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import db, { nextId } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(rootDir, ".env"));
loadEnvFile(path.join(__dirname, ".env"));

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const sessionCookieName = "dm_admin_session";
const sessionTtlMs = Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60 * 8);
const sessions = new Map();
const rateBuckets = new Map();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origine CORS non autorisee"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "64kb" }));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  if (req.path.startsWith("/api")) {
    res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  }
  next();
});

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const iterations = 120000;
  const digest = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");
  return `pbkdf2$${iterations}$${salt}$${digest}`;
}

function verifyPassword(password, storedHash) {
  const [scheme, iterations, salt, digest] = String(storedHash || "").split("$");
  if (scheme !== "pbkdf2" || !iterations || !salt || !digest) return false;

  const actual = crypto.pbkdf2Sync(password, salt, Number(iterations), 32, "sha256");
  const expected = Buffer.from(digest, "hex");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPasswordHash =
  process.env.ADMIN_PASSWORD_HASH ||
  (process.env.ADMIN_PASSWORD ? hashPassword(process.env.ADMIN_PASSWORD) : null);

if (!adminPasswordHash && isProduction) {
  throw new Error("Configurez ADMIN_PASSWORD_HASH ou ADMIN_PASSWORD avant de lancer le serveur en production.");
}

if (!adminPasswordHash) {
  console.warn("[security] Mot de passe admin de developpement actif: admin / admin123");
}

function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const idx = part.indexOf("=");
        const key = idx === -1 ? part : part.slice(0, idx);
        const value = idx === -1 ? "" : part.slice(idx + 1);
        return [key, decodeURIComponent(value)];
      })
  );
}

function createSession(username) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + sessionTtlMs;
  sessions.set(token, { username, createdAt: Date.now(), expiresAt });
  return { token, expiresAt };
}

function getSession(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  const token = cookies[sessionCookieName];
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return { token, ...session };
}

function setSessionCookie(res, token) {
  const parts = [
    `${sessionCookieName}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${Math.floor(sessionTtlMs / 1000)}`,
  ];
  if (isProduction) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

function clearSessionCookie(res) {
  const parts = [
    `${sessionCookieName}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    "Max-Age=0",
  ];
  if (isProduction) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

function requireAuth(req, res, next) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ message: "Non autorise. Connectez-vous pour continuer." });
  req.session = session;
  return next();
}

function rateLimit({ windowMs, max, name }) {
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${name}:${ip}`;
    const now = Date.now();
    const bucket = rateBuckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    rateBuckets.set(key, bucket);

    if (bucket.count > max) {
      return res.status(429).json({ message: "Trop de requetes. Reessayez dans quelques minutes." });
    }
    return next();
  };
}

function text(value, max = 500) {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function longText(value, max = 5000) {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);
}

function list(value, maxItems = 12, maxLength = 48) {
  const raw = Array.isArray(value) ? value : String(value ?? "").split(",");
  return raw.map((item) => text(item, maxLength)).filter(Boolean).slice(0, maxItems);
}

function safeUrl(value) {
  const raw = text(value, 300);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function normalizeProject(input = {}, previous = {}) {
  return {
    ...previous,
    title: text(input.title, 120),
    short: text(input.short, 220),
    long: longText(input.long, 3000),
    tags: list(input.tags),
    demo: safeUrl(input.demo),
    repo: safeUrl(input.repo),
    status: input.status === "published" ? "published" : "draft",
    featured: Boolean(input.featured),
    metrics: Array.isArray(input.metrics)
      ? input.metrics
          .map((metric) => ({ label: text(metric.label, 40), value: text(metric.value, 40) }))
          .filter((metric) => metric.label && metric.value)
          .slice(0, 4)
      : [],
    updated: new Date().toISOString().slice(0, 10),
  };
}

function normalizeCvEntry(input = {}, previous = {}) {
  return {
    ...previous,
    version: text(input.version ?? previous.version, 24),
    hash: text(input.hash ?? previous.hash, 24),
    role: text(input.role, 120),
    company: text(input.company, 120),
    period: text(input.period, 80),
    description: longText(input.description, 1200),
    tech: text(input.tech, 240),
  };
}

function validateContact(input = {}) {
  const name = text(input.name, 90);
  const email = text(input.email, 160).toLowerCase();
  const subject = text(input.subject, 140);
  const message = longText(input.message, 2200);

  if (name.length < 2) return { error: "Le nom doit contenir au moins 2 caracteres." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Adresse email invalide." };
  if (message.length < 10) return { error: "Le message doit contenir au moins 10 caracteres." };

  return { value: { name, email, subject, message } };
}

function hashVisitor(req, perDay = false) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  const salt = process.env.VISITOR_HASH_SALT || "portfolio-local-salt";
  const day = new Date().toISOString().slice(0, 10);
  const source = perDay ? `${ip}|${ua}|${day}|${salt}` : `${ip}|${ua}|${salt}`;
  return crypto.createHash("sha256").update(source).digest("hex");
}

function lastSevenDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - index));
    return d.toISOString().slice(0, 10);
  });
}

function analyticsSummary() {
  const analytics = db.data.analytics;
  const today = new Date().toISOString().slice(0, 10);
  const todayData = analytics.dailyVisits[today] || { views: 0, unique: 0 };
  return {
    totalVisits: analytics.totalVisits,
    uniqueVisitors: analytics.uniqueVisitors,
    todayVisits: todayData.views || 0,
    todayUnique: todayData.unique || 0,
    last7Days: lastSevenDays().map((date) => ({
      date,
      views: analytics.dailyVisits[date]?.views || 0,
      unique: analytics.dailyVisits[date]?.unique || 0,
    })),
  };
}

/* ---------- PUBLIC DATA ---------- */

app.get("/api/projects", (req, res) => {
  const canSeeDrafts = Boolean(getSession(req));
  const source = canSeeDrafts ? db.data.projects : db.data.projects.filter((project) => project.status === "published");
  const sorted = [...source].sort((a, b) => (a.updated < b.updated ? 1 : -1));
  res.json(sorted);
});

app.get("/api/cv", (req, res) => {
  res.json(db.data.cvEntries);
});

app.post("/api/contact", rateLimit({ windowMs: 10 * 60 * 1000, max: 5, name: "contact" }), async (req, res) => {
  const result = validateContact(req.body);
  if (result.error) return res.status(400).json({ message: result.error });

  const contact = {
    id: nextId("contacts"),
    ...result.value,
    read: false,
    status: "new",
    createdAt: new Date().toISOString(),
    userAgent: text(req.headers["user-agent"], 220),
    ipHash: crypto
      .createHash("sha256")
      .update(`${req.ip || req.socket.remoteAddress || "unknown"}|${process.env.CONTACT_HASH_SALT || "portfolio-contact"}`)
      .digest("hex"),
  };

  db.data.contacts.push(contact);
  await db.write();
  res.status(201).json({ ok: true, message: "Message recu. Merci pour votre contact." });
});

app.post("/api/analytics/visit", rateLimit({ windowMs: 60 * 1000, max: 30, name: "visit" }), async (req, res) => {
  const analytics = db.data.analytics;
  const day = new Date().toISOString().slice(0, 10);
  const page = text(req.body?.page || "portfolio", 120);
  const visitorHash = hashVisitor(req);
  const dailyHash = hashVisitor(req, true);

  analytics.totalVisits += 1;
  analytics.knownVisitors = Array.isArray(analytics.knownVisitors) ? analytics.knownVisitors : [];
  if (!analytics.knownVisitors.includes(visitorHash)) {
    analytics.knownVisitors.push(visitorHash);
    analytics.uniqueVisitors += 1;
  }

  analytics.dailyVisits[day] ||= { views: 0, unique: 0, visitors: [] };
  analytics.dailyVisits[day].views += 1;
  analytics.dailyVisits[day].visitors ||= [];
  if (!analytics.dailyVisits[day].visitors.includes(dailyHash)) {
    analytics.dailyVisits[day].visitors.push(dailyHash);
    analytics.dailyVisits[day].unique += 1;
  }

  analytics.recentVisits = [
    { at: new Date().toISOString(), page, userAgent: text(req.headers["user-agent"], 160) },
    ...(analytics.recentVisits || []),
  ].slice(0, 25);

  await db.write();
  res.status(204).end();
});

/* ---------- AUTH ---------- */

app.post("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 8, name: "login" }), (req, res) => {
  const username = text(req.body?.username, 80);
  const password = String(req.body?.password || "");
  const expectedHash = adminPasswordHash || hashPassword("admin123", "development-only-salt");

  if (username === adminUsername && verifyPassword(password, expectedHash)) {
    const session = createSession(username);
    setSessionCookie(res, session.token);
    return res.json({ ok: true, user: { username } });
  }

  return res.status(401).json({ ok: false, message: "Identifiants invalides." });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ ok: true, user: { username: req.session.username } });
});

app.post("/api/auth/logout", (req, res) => {
  const session = getSession(req);
  if (session) sessions.delete(session.token);
  clearSessionCookie(res);
  res.json({ ok: true });
});

/* ---------- ADMIN: PROJECTS ---------- */

app.post("/api/projects", requireAuth, async (req, res) => {
  const project = {
    id: nextId("projects"),
    ...normalizeProject(req.body),
  };

  if (!project.title) return res.status(400).json({ message: "Le titre est obligatoire." });
  db.data.projects.push(project);
  await db.write();
  res.status(201).json(project);
});

app.put("/api/projects/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const idx = db.data.projects.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ message: "Projet introuvable." });

  const updated = { id, ...normalizeProject(req.body, db.data.projects[idx]) };
  if (!updated.title) return res.status(400).json({ message: "Le titre est obligatoire." });

  db.data.projects[idx] = updated;
  await db.write();
  res.json(updated);
});

app.delete("/api/projects/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  db.data.projects = db.data.projects.filter((p) => p.id !== id);
  await db.write();
  res.status(204).end();
});

/* ---------- ADMIN: CV ---------- */

app.put("/api/cv/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const idx = db.data.cvEntries.findIndex((entry) => entry.id === id);
  if (idx === -1) return res.status(404).json({ message: "Entree introuvable." });

  db.data.cvEntries[idx] = { id, ...normalizeCvEntry(req.body, db.data.cvEntries[idx]) };
  await db.write();
  res.json(db.data.cvEntries[idx]);
});

app.put("/api/cv-reorder", requireAuth, async (req, res) => {
  const order = Array.isArray(req.body?.order) ? req.body.order.map(Number) : [];
  const byId = Object.fromEntries(db.data.cvEntries.map((entry) => [entry.id, entry]));
  db.data.cvEntries = order.map((id) => byId[id]).filter(Boolean);
  await db.write();
  res.json({ ok: true });
});

/* ---------- ADMIN: CONTACTS AND METRICS ---------- */

app.get("/api/contacts", requireAuth, (req, res) => {
  const contacts = [...db.data.contacts]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map(({ ipHash, userAgent, ...contact }) => contact);
  res.json(contacts);
});

app.patch("/api/contacts/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const idx = db.data.contacts.findIndex((contact) => contact.id === id);
  if (idx === -1) return res.status(404).json({ message: "Message introuvable." });

  const status = ["new", "read", "archived"].includes(req.body?.status) ? req.body.status : db.data.contacts[idx].status;
  db.data.contacts[idx] = {
    ...db.data.contacts[idx],
    read: typeof req.body?.read === "boolean" ? req.body.read : status !== "new",
    status,
    updatedAt: new Date().toISOString(),
  };
  await db.write();

  const { ipHash, userAgent, ...contact } = db.data.contacts[idx];
  res.json(contact);
});

app.delete("/api/contacts/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  db.data.contacts = db.data.contacts.filter((contact) => contact.id !== id);
  await db.write();
  res.status(204).end();
});

app.get("/api/admin/metrics", requireAuth, (req, res) => {
  const unreadMessages = db.data.contacts.filter((contact) => !contact.read).length;
  res.json({
    analytics: analyticsSummary(),
    contacts: {
      total: db.data.contacts.length,
      unread: unreadMessages,
    },
  });
});

if (isProduction) {
  const clientDist = path.resolve(__dirname, "../client/dist");
  app.use(express.static(clientDist, { maxAge: "1h", index: false }));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    return res.sendFile(path.join(clientDist, "index.html"));
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API en ecoute sur http://localhost:${PORT}`);
  console.log(`[auth] Identifiant admin actif: ${adminUsername}`);
  console.log(`[auth] Mot de passe de demonstration admin/admin123: ${adminPasswordHash ? "desactive" : "actif"}`);
});
