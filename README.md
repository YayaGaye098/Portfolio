# Portfolio Admin

Portfolio public + dashboard admin avec backend Express et persistance lowdb.

## Fonctionnalites

- Site public avec projets publies, formulaire de contact et page CV publique.
- Dashboard admin pour gerer les projets, le CV, les messages de contact et les statistiques visiteurs.
- Auth admin par session opaque en cookie HTTP-only.
- Protection basique: headers securite, limite anti-bruteforce, validation/sanitation des champs publics, brouillons caches aux visiteurs non connectes.

## Installation

Depuis la racine du projet:

```bash
npm run install:all
```

## Lancer en developpement

```bash
npm run dev
```

- API: `http://localhost:4000`
- Client: `http://localhost:5173`

En developpement uniquement, si aucune variable admin n'est definie, le serveur accepte:

- identifiant: `admin`
- mot de passe: `admin123`

## Configuration securite

Avant une mise en ligne, configure au minimum:

```powershell
$env:NODE_ENV="production"
$env:ADMIN_USERNAME="ton-identifiant"
$env:ADMIN_PASSWORD="un-mot-de-passe-long-et-unique"
$env:CORS_ORIGINS="https://ton-domaine.com"
$env:VISITOR_HASH_SALT="une-valeur-secrete"
$env:CONTACT_HASH_SALT="une-autre-valeur-secrete"
npm run start --prefix server
```

Variables utiles:

- `ADMIN_USERNAME`: identifiant admin.
- `ADMIN_PASSWORD`: mot de passe lu depuis l'environnement.
- `ADMIN_PASSWORD_HASH`: alternative a `ADMIN_PASSWORD` si tu fournis deja un hash PBKDF2 compatible.
- `SESSION_TTL_MS`: duree de session, par defaut 8 heures.
- `CORS_ORIGINS`: origines autorisees, separees par virgules.
- `VISITOR_HASH_SALT` et `CONTACT_HASH_SALT`: sels pour anonymiser IP/user-agent dans les stats.

En `NODE_ENV=production`, le serveur refuse de demarrer sans `ADMIN_PASSWORD` ou `ADMIN_PASSWORD_HASH`.

## Donnees

`server/data.json` est cree automatiquement au premier lancement. Il contient les projets, entrees CV, contacts et statistiques. Le fichier est ignore par Git pour eviter de publier des messages ou statistiques privees.

## Verification

```bash
node --check server/index.js
node --check server/db.js
npm run build --prefix client
```

## Publier le site

L'app peut etre publiee comme un seul service Node: le serveur Express sert l'API et le dossier `client/dist`.

### Option simple: Render

1. Cree un repository GitHub avec ce dossier.
2. Sur Render, cree un nouveau **Web Service** depuis ce repository.
3. Commande de build:

```bash
npm run install:all && npm run build
```

4. Commande de demarrage:

```bash
npm start
```

5. Ajoute les variables d'environnement:

```txt
NODE_ENV=production
ADMIN_USERNAME=ton-identifiant
ADMIN_PASSWORD=ton-mot-de-passe-long
CORS_ORIGINS=https://ton-url-render.onrender.com
VISITOR_HASH_SALT=une-valeur-secrete
CONTACT_HASH_SALT=une-autre-valeur-secrete
```

Le fichier `render.yaml` peut aussi servir de blueprint si tu veux importer la configuration automatiquement.

### Important

`server/data.json` contient les messages et les statistiques. Pour une vraie mise en ligne durable, choisis un hebergeur avec disque persistant, ou remplace ensuite lowdb par une base externe.
"# Portfolio" 
