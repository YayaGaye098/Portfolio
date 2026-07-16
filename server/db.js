import { JSONFilePreset } from "lowdb/node";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || __dirname;
fs.mkdirSync(dataDir, { recursive: true });
const dbFile = path.join(dataDir, "data.json");

const defaultData = {
  projects: [
    {
      id: 1,
      title: "Projet de vote electronique",
      short: "Creation d'elections, vote securise et suivi des resultats en temps reel.",
      long: "Application full-stack permettant de creer des elections, gerer les votes de maniere securisee et suivre les resultats en temps reel.",
      tags: ["Laravel", "PHP", "MySQL", "JavaScript"],
      demo: "",
      repo: "",
      status: "published",
      featured: true,
      metrics: [
        { label: "role", value: "Full-stack" },
        { label: "module", value: "Vote" },
        { label: "temps reel", value: "Resultats" },
      ],
      updated: "2025-07-01",
    },
    {
      id: 2,
      title: "Outil de diagnostic du cancer du sein",
      short: "Web app de prediction de diagnostics a partir de donnees medicales.",
      long: "Application web Flask pour analyser des donnees medicales et aider a la prediction de diagnostics.",
      tags: ["Python", "Flask", "HTML", "CSS", "JavaScript"],
      demo: "",
      repo: "",
      status: "published",
      featured: false,
      metrics: [],
      updated: "2025-06-20",
    },
    {
      id: 3,
      title: "Recherche d'emploi avec JHipster",
      short: "Publication d'offres, consultation et postulation en ligne.",
      long: "Plateforme de recherche d'emploi construite avec JHipster, Spring Boot, Angular et MySQL.",
      tags: ["JHipster", "Spring Boot", "Angular", "MySQL"],
      demo: "",
      repo: "",
      status: "published",
      featured: false,
      metrics: [],
      updated: "2025-06-12",
    },
    {
      id: 4,
      title: "Clone de Facebook",
      short: "Reseau social avec creation de profils et publication de posts.",
      long: "",
      tags: ["Angular", "PHP", "MySQL"],
      demo: "",
      repo: "",
      status: "published",
      featured: false,
      metrics: [],
      updated: "2025-05-28",
    },
    {
      id: 5,
      title: "Application Job Students",
      short: "Gestion des candidatures et suivi des offres d'emploi etudiantes.",
      long: "",
      tags: ["Java", "MySQL"],
      demo: "",
      repo: "",
      status: "published",
      featured: false,
      metrics: [],
      updated: "2025-05-10",
    },
    {
      id: 6,
      title: "Page web de reservation medicale",
      short: "Plateforme de prise de rendez-vous medical en ligne.",
      long: "",
      tags: ["HTML", "CSS", "JavaScript", "MySQL"],
      demo: "",
      repo: "",
      status: "published",
      featured: false,
      metrics: [],
      updated: "2025-04-24",
    },
    {
      id: 7,
      title: "Table de hachage",
      short: "Logiciel de recherche rapide dans une grande base de donnees.",
      long: "Projet algorithmique autour des tables de hachage avec stockage et recherche dans MySQL.",
      tags: ["C++", "MySQL"],
      demo: "",
      repo: "",
      status: "published",
      featured: false,
      metrics: [],
      updated: "2025-04-02",
    },
    {
      id: 8,
      title: "Analyse et reporting de donnees aeriennes",
      short: "Etude des flux de vols et creation de visualisations interactives.",
      long: "",
      tags: ["Python", "Power BI"],
      demo: "",
      repo: "",
      status: "published",
      featured: false,
      metrics: [],
      updated: "2025-03-18",
    },
  ],
  cvEntries: [
    {
      id: 1,
      version: "M2",
      hash: "ugb-m2",
      role: "Master 2 Informatique - Gestion de Donnees et Ingenierie Logicielle",
      company: "Universite Gaston Berger de Saint-Louis",
      period: "2024 - 2025 (en cours)",
      description: "Formation avancee en gestion de donnees, ingenierie logicielle, developpement d'applications et conception de solutions informatiques.",
      tech: "Donnees / Genie logiciel",
    },
    {
      id: 2,
      version: "M1",
      hash: "ugb-m1",
      role: "Master 1 Informatique - Gestion de Donnees et Ingenierie Logicielle",
      company: "Universite Gaston Berger de Saint-Louis",
      period: "2023 - 2024",
      description: "Approfondissement des bases de donnees, du developpement logiciel et des architectures applicatives.",
      tech: "Java / Web / Bases de donnees",
    },
    {
      id: 3,
      version: "L3",
      hash: "mass-l3",
      role: "Licence MASS - Methodes Informatiques Appliquees a la Gestion",
      company: "Universite Gaston Berger de Saint-Louis",
      period: "2022 - 2023",
      description: "Parcours oriente informatique appliquee, gestion, modelisation et analyse de donnees.",
      tech: "Informatique / Gestion",
    },
    {
      id: 4,
      version: "BAC",
      hash: "bac-s",
      role: "Baccalaureat Scientifique",
      company: "Groupe scolaire Angela Davis",
      period: "2019",
      description: "Formation scientifique generale avec bases solides en mathematiques et sciences.",
      tech: "Sciences",
    },
  ],
  contacts: [],
  analytics: {
    totalVisits: 0,
    uniqueVisitors: 0,
    knownVisitors: [],
    dailyVisits: {},
    recentVisits: [],
  },
};

const db = await JSONFilePreset(dbFile, defaultData);

if (!Array.isArray(db.data.projects)) db.data.projects = [];
if (!Array.isArray(db.data.cvEntries)) db.data.cvEntries = [];
if (!Array.isArray(db.data.contacts)) db.data.contacts = [];
if (!db.data.analytics || typeof db.data.analytics !== "object") db.data.analytics = {};
if (typeof db.data.analytics.totalVisits !== "number") db.data.analytics.totalVisits = 0;
if (typeof db.data.analytics.uniqueVisitors !== "number") db.data.analytics.uniqueVisitors = 0;
if (!Array.isArray(db.data.analytics.knownVisitors)) db.data.analytics.knownVisitors = [];
if (!db.data.analytics.dailyVisits || typeof db.data.analytics.dailyVisits !== "object") db.data.analytics.dailyVisits = {};
if (!Array.isArray(db.data.analytics.recentVisits)) db.data.analytics.recentVisits = [];

await db.write();

export function nextId(collection) {
  const items = db.data[collection] || [];
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

export default db;
