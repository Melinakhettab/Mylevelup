# CLAUDE.md — MY-LEVELUP (FitQuest)

> Lu automatiquement par Claude Code à chaque session.
> **Snapshot vivant** du projet : état réel, pas les plans initiaux.
> Dernière mise à jour : **2026-04-16** (session Phase 2 — génération IA)

---

## 🧭 RÉSUMÉ EXÉCUTIF — REPRISE RAPIDE

| Phase | Description                                               | Statut |
|-------|-----------------------------------------------------------|--------|
| 1     | Auth JWT + Onboarding 6 étapes + calculs BMI/BMR/TDEE     | ✅ Commité sur `develop` (`652e3d5`) |
| 2     | Génération programme IA (Gemini 2.5-flash) + Program view | 🔴 Code écrit mais **BUG actif** + non commité |
| 3     | Vue détaillée programme (tabs, exercices dépliables)      | 🟡 Déjà partiellement fait dans Phase 2 |
| 4     | Tracking séances + gamification (points, streak)          | ⏳ À faire |
| 5     | Plan nutritionnel + liste de courses                      | ⏳ À faire |
| 6     | Leaderboard + polish                                      | ⏳ À faire |

**🚨 BUG EN COURS** : `Erreur lors de la génération` sur la page `/program` lors du clic "Générer mon programme".
→ Voir section **[🔥 BUG ACTIF](#-bug-actif--erreur-lors-de-la-génération)** tout en bas.

**🆕 Nouveau bug TypeScript détecté (tsc)** :
```
src/services/program.service.ts(63,7): error TS2322:
  Type 'Record<string, unknown>[]' is not assignable to type 'JsonNull | InputJsonValue'.
```
Prisma refuse le type retourné par `JSON.parse(JSON.stringify(result.program))` à la ligne 63.
→ Fix : caster en `Prisma.InputJsonValue` ou `as unknown as Prisma.JsonArray`.

---

## 🎯 Présentation

**MY-LEVELUP** (nom interne repo : `my-levelup`, nom produit : FitQuest) est une webapp de coaching sportif + nutritionnel **gamifiée**.

Flow utilisateur cible :
1. S'inscrit → JWT
2. Remplit un questionnaire en 6 étapes → profil créé, BMI/BMR/TDEE calculés
3. Dashboard → bouton "Générer mon programme" → appel Gemini → programme 7j affiché
4. Valide ses séances → points, streak, avatar, leaderboard

---

## 🏗️ Architecture actuelle

```
Navigateur
    ↓
Frontend SPA  (React 19 + Vite 8 + Zustand + React Router v7)        → localhost:5173
    ↓ HTTP /api/*  (proxy Vite → backend)  +  JWT header
Backend API   (Express + tsx + ES modules + Prisma v7)               → localhost:3000
    ↓
Base de données  Supabase PostgreSQL (pooler aws-1-eu-west-2)        → :5432
    ↓
Google Gemini API  (`@google/generative-ai`, model `gemini-2.5-flash`)
```

⚠️ **Port backend = 3000** (pas 5000 comme dans les anciens docs).
⚠️ **Pas de Tailwind** : CSS Modules uniquement. Thème néon jaune `#FFD600` sur fond `#0d0d0d`.
⚠️ **Zustand** (pas Context API). Stores dans `frontend/src/store/`.

---

## 📦 Stack technique réelle

### Frontend (`frontend/`)
- **React 19** + **TypeScript 5**
- **Vite 8** (dev server port **5173**, proxy `/api` → `localhost:3000`)
- **Zustand** (stores : `authStore`, `profileStore`, `programStore`)
- **React Router v7** (`BrowserRouter`, `ProtectedRoute`, `GuestRoute`)
- **Axios** (instance `/api`, intercepteur JWT + 401 auto-redirect, **timeout 15s** ⚠️)
- **CSS Modules** (thème néon — pas de lib UI)

### Backend (`backend/`)
- **Node 20 + Express 4 + TypeScript 5** (ES modules — tous les imports en `.js`)
- **tsx** pour hot-reload dev (`npm run dev`)
- **Prisma v7** ⚠️ nouvelle config `prisma.config.ts` (voir section dédiée)
- **`@prisma/adapter-pg`** + **`pg`** (obligatoire en Prisma v7)
- **Zod** pour validation (middleware `validate`)
- **jsonwebtoken** (secret dans `.env`, 24h), **bcrypt** (saltRounds = 12)
- **helmet**, **cors**
- **`openai`** SDK v4 avec `baseURL: https://api.x.ai/v1` (Grok xAI)

### DB + IA
- **Supabase PostgreSQL** (projet ref `kzuwknupqxrekvjxtbyy`, région `eu-west-2`)
  - Accès via **pooler** (port 5432), pas via le host direct `db.*.supabase.co` (DNS ne résout pas en local)
  - URL host : `aws-1-eu-west-2.pooler.supabase.com` (⚠️ `aws-1` pas `aws-0`)
  - User pooler : `postgres.kzuwknupqxrekvjxtbyy`
  - Password : `69@MiraiOne667` → **URL-encodé** en `69%40MiraiOne667`
- **OpenRouter** : `meta-llama/llama-3.3-70b-instruct:free` via API OpenAI-compatible (`https://openrouter.ai/api/v1`)

---

## 📁 Structure réelle du projet

```
fitquest/my-levelup/
├── CLAUDE.md                               ← ce fichier
├── README.md
│
├── backend/
│   ├── .env                                ← credentials (voir section dédiée)
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma.config.ts                    ⚠️ Prisma v7, remplace datasource dans schema
│   ├── prisma/
│   │   ├── schema.prisma                   ← 8 tables, migration appliquée
│   │   └── migrations/
│   │       └── 20250416_init/migration.sql
│   └── src/
│       ├── index.ts                        ← point d'entrée (app.listen 3000)
│       ├── app.ts                          ← Express + middlewares + routes
│       ├── config/
│       │   ├── env.ts                      ← typed env (DATABASE_URL, JWT_SECRET, …)
│       │   └── prisma.ts                   ← PrismaClient + PrismaPg adapter
│       ├── middleware/
│       │   ├── auth.middleware.ts          ← vérifie JWT, injecte req.user
│       │   ├── validate.middleware.ts      ← wrap Zod
│       │   └── error.middleware.ts
│       ├── schemas/
│       │   ├── auth.schema.ts
│       │   └── profile.schema.ts
│       ├── utils/
│       │   ├── errors.ts                   ← AppError, NotFoundError, …
│       │   └── calculations.ts             ← BMI/BMR/TDEE
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── profile.controller.ts
│       │   └── program.controller.ts       🆕
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── profile.service.ts
│       │   ├── program.service.ts          🆕 ⚠️ bug TS ligne 63
│       │   └── ai/
│       │       ├── openai.service.ts       🆕 (nom legacy — utilise Gemini)
│       │       ├── prompts.ts              🆕 (buildProgramPrompt, ProfileContext)
│       │       └── program.validator.ts    🆕 (Zod, attend 7 jours exactement)
│       └── routes/
│           ├── index.ts                    ← router principal, monte /auth /profile /programs
│           ├── auth.routes.ts
│           ├── profile.routes.ts
│           └── program.routes.ts           🆕
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts                      ← proxy /api → localhost:3000
    └── src/
        ├── main.tsx
        ├── App.tsx                         ← routes /, /register, /login, /onboarding, /dashboard, /program
        ├── services/
        │   ├── api.ts                      ⚠️ axios timeout: 15000 (potentiellement trop court)
        │   ├── auth.service.ts
        │   ├── profile.service.ts
        │   └── program.service.ts          🆕
        ├── store/
        │   ├── authStore.ts                ← persiste token + user + hasProfile
        │   ├── profileStore.ts
        │   └── programStore.ts             🆕
        ├── components/
        │   ├── ProtectedRoute.tsx
        │   └── GuestRoute.tsx
        └── pages/
            ├── Home.tsx
            ├── Register.tsx / Register.module.css
            ├── Login.tsx / Login.module.css
            ├── Onboarding.tsx / Onboarding.module.css  ← 6 étapes
            ├── Dashboard.tsx / Dashboard.module.css    🆕 réécrit
            └── Program.tsx / Program.module.css        🆕
```

---

## 🔐 Fichier `.env` backend — **CRITIQUE**

```env
# Base de données (Supabase PostgreSQL via pooler — aws-1 obligatoire)
DATABASE_URL="postgresql://postgres.kzuwknupqxrekvjxtbyy:69%40MiraiOne667@aws-1-eu-west-2.pooler.supabase.com:5432/postgres"

# JWT
JWT_SECRET=mylevelup-jwt-secret-f8k2p9x1q7w3
JWT_EXPIRES_IN=24h

# OpenRouter (OpenAI-compatible, baseURL: https://openrouter.ai/api/v1)
OPENROUTER_API_KEY=sk-or-v1-...  # clé dans .env local
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free

# Serveur
PORT=3000
NODE_ENV=development
```

**Pièges credentials** :
- `@` dans le mot de passe → doit être encodé **`%40`** dans l'URL
- Host pooler : **`aws-1-eu-west-2`** (pas `aws-0` — erreur "Tenant or user not found")
- **Ne pas** utiliser `db.kzuwknupqxrekvjxtbyy.supabase.co` → DNS ENOTFOUND en local
- Port **5432** sur le pooler (transaction mode)

---

## ⚡ Prisma v7 — config particulière

Prisma v7 a changé la config. **Ne plus mettre `url` dans `schema.prisma`**, le mettre dans `prisma.config.ts`.

**`backend/prisma.config.ts`** (obligatoire, sinon migrate échoue) :
```typescript
import path from 'node:path'
import { defineConfig } from 'prisma/config'
import 'dotenv/config'

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  datasource: { url: process.env.DATABASE_URL! },
  migrate: {
    adapter: async () => {
      const { PrismaPg } = await import('@prisma/adapter-pg')
      const pg = await import('pg')
      const pool = new pg.default.Pool({ connectionString: process.env.DATABASE_URL })
      return new PrismaPg(pool)
    },
  },
})
```

**`backend/src/config/prisma.ts`** :
```typescript
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { env } from './env.js'

const pool = new pg.Pool({ connectionString: env.DATABASE_URL })
const adapter = new PrismaPg(pool)
export const prisma = new PrismaClient({ adapter })
```

**`schema.prisma`** — datasource sans url :
```prisma
datasource db {
  provider = "postgresql"
  // PAS de url = env("DATABASE_URL") — Prisma v7 refuse
}
```

---

## 🗃️ Modèle de données (8 tables, migration appliquée)

`users`, `profiles`, `programs`, `nutrition_plans`, `points`, `point_transactions`, `session_logs`, `weight_history`.

Points clés :
- `profiles.goal` ∈ `perte_poids | prise_masse | maintien | performance | forme` (**en français**)
- `profiles.fitnessLevel` ∈ `debutant | intermediaire | avance`
- `profiles.equipment` ∈ `maison | salle | mixte`
- `programs.content` = `Json` — stocke directement le tableau de 7 jours retourné par Gemini

---

## 🔌 API — endpoints actuels

| Méthode | Route                        | Auth | Notes                                |
|---------|------------------------------|------|--------------------------------------|
| POST    | `/api/auth/register`         | ❌   | retourne `{ token, user }`           |
| POST    | `/api/auth/login`            | ❌   |                                      |
| GET     | `/api/profile`               | ✅   |                                      |
| POST    | `/api/profile`               | ✅   | upsert, calcule BMI/BMR/TDEE         |
| POST    | `/api/programs/generate`     | ✅   | 🔴 appelle Gemini, **ça casse**      |
| GET     | `/api/programs/current`      | ✅   | programme actif                      |
| GET     | `/api/programs/history`      | ✅   | 10 derniers programmes               |

Réponse uniforme : `{ success, data }` ou `{ success: false, error: { code, message } }`.

---

## 🤖 Service IA Gemini

**Fichier `backend/src/services/ai/openai.service.ts`** (nom legacy, utilise Gemini) :
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const model = client.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 4000,
    responseMimeType: 'application/json',
  },
})
const result = await model.generateContent([systemMsg, prompt])
const content = result.response.text()
const validated = validateProgramResponse(content)  // Zod
```

- Retry : 2 tentatives max
- Validation Zod : **7 jours exactement**, sinon throw
- En cas d'erreur → `AppError(..., 502)`

---

## 🧪 Données de test en base

Deux users réels créés en dev :

| Email                          | Profile                                                          |
|--------------------------------|------------------------------------------------------------------|
| hmidahadjlazib@gmail.com       | prise_masse, intermediaire, salle, 8h/sem, BMI 25.38, BMR 1801   |
| rassimhadjla3zib@gmail.com     | profil similaire                                                 |

Les profils sont valides → le bug n'est **pas** un profil manquant.

---

## 🔁 État Git

- Branche courante : **`develop`**
- Dernier commit : `652e3d5` — Phase 1 (auth + onboarding)
- **Non commité** (Phase 2 entière) :
  - `CLAUDE.md`
  - `backend/package.json` (ajout `@google/generative-ai`)
  - `backend/prisma.config.ts` (nouveau)
  - `backend/prisma/migrations/` (migration init)
  - `backend/src/routes/index.ts` (ajout `programs`)
  - `backend/src/controllers/program.controller.ts` (nouveau)
  - `backend/src/routes/program.routes.ts` (nouveau)
  - `backend/src/services/program.service.ts` (nouveau)
  - `backend/src/services/ai/*.ts` (3 fichiers nouveaux)
  - `frontend/src/App.tsx` (route `/program`)
  - `frontend/src/pages/Dashboard.tsx` + CSS (réécrit)
  - `frontend/src/pages/Program.tsx` + CSS (nouveau)
  - `frontend/src/services/program.service.ts` (nouveau)
  - `frontend/src/store/programStore.ts` (nouveau)
  - `frontend/src/store/authStore.ts` (persiste `hasProfile`)

**Push GitLab** : l'utilisateur push à la main, `gh` n'est pas configuré pour GitLab.

---

## 🚀 Commandes dev

```bash
# Backend (port 3000)
cd backend && npm run dev

# Frontend (port 5173)
cd frontend && npm run dev

# Prisma (après modif schema.prisma)
cd backend && npx prisma migrate dev --name <description>
cd backend && npx prisma generate
cd backend && npx prisma studio
```

---

## 🐛 Gotchas rencontrés (historique)

1. **Worktree vs projet principal** : première implémentation faite dans `.claude/worktrees/priceless-kilby/`, le dev server tournait depuis `my-levelup/`. → Toujours éditer `my-levelup/frontend/src/*` directement.
2. **Prisma v7 `url` dans schema** → interdit. Migrer vers `prisma.config.ts`.
3. **Prisma v7 migrate sans `datasource.url` en config** → erreur explicite. Bien l'ajouter au `defineConfig`.
4. **Supabase `aws-0` vs `aws-1`** : `aws-1-eu-west-2.pooler.supabase.com` uniquement.
5. **Supabase host direct** : `db.*.supabase.co` ne résout pas en local (DNS). Pooler obligatoire.
6. **`@` dans password** → encoder `%40`.
7. **Gemini `gemini-2.0-flash` free tier = quota 0** → utiliser `gemini-2.5-flash`.
8. **Auth redirect bug** : `GuestRoute` renvoyait vers `/onboarding` pour un user connecté sans profil. Fix : persister `hasProfile` dans localStorage via `authStore.hydrate()`.
9. **Prisma JSON type strict** : `content: result.program` refusé par Prisma. `JSON.parse(JSON.stringify(...))` marche à l'exécution mais TS se plaint encore (voir bug TS actuel).

---

## 🔥 BUG ACTIF — "Erreur lors de la génération"

**Symptôme** : page `/program`, clic "Générer mon programme" → UI affiche "Erreur lors de la génération". En isolation, l'API Gemini répond correctement (testé).

**Bug TS bloquant détecté maintenant** :
```
src/services/program.service.ts(63,7): error TS2322:
  Type 'Record<string, unknown>[]' is not assignable to type 'JsonNull | InputJsonValue'.
```
Ligne 63 actuelle :
```typescript
content: JSON.parse(JSON.stringify(result.program)),
```
→ Même avec le `JSON.parse(JSON.stringify(...))`, Prisma v7 + `content: Json` typé attend `InputJsonValue`. Fix possible :
```typescript
import type { Prisma } from '@prisma/client'
// ...
content: result.program as unknown as Prisma.InputJsonValue,
```

Si `tsx` (dev) laissait passer malgré l'erreur TS, le build échoue. Vérifier si `tsx` force-run ou si le process crash.

**Autres hypothèses à investiguer** :

1. **Axios timeout 15s trop court** (`frontend/src/services/api.ts`) — Gemini peut prendre 10-30s.
   → Monter à 60s :
   ```typescript
   const api = axios.create({ baseURL: '/api', timeout: 60000 })
   ```

2. **Zod trop strict** (`program.validator.ts`) — le schema exige 7 jours exactement (`.length(7)`). Si Gemini retourne 5 ou 6 jours (fréquent), validation échoue.
   → Logger le contenu brut Gemini avant validation, ou assouplir : `.min(1).max(7)`.

3. **Prisma JSON save** — cf bug TS ci-dessus. Si à l'exécution Prisma rejette aussi, le `throw` remonte comme 500.

**Plan debug recommandé (dans l'ordre)** :
1. Fix TS ligne 63 avec cast `Prisma.InputJsonValue`.
2. Relancer backend, déclencher depuis l'UI, lire **les logs backend** (console.error dans le catch du controller).
3. Si timeout frontend → pousser axios timeout à 60s.
4. Si Zod fail → logger `content` brut avant `validateProgramResponse(content)` dans `openai.service.ts`.
5. Si Prisma fail → logger `result.program` avant `prisma.program.create`.

---

## 📋 Prochaines étapes (ordre de priorité)

1. **Fix TS error ligne 63** (`program.service.ts`) avec cast Prisma
2. **Debug génération** jusqu'à succès end-to-end
3. **Commit Phase 2** sur `develop` avec message propre
4. **Phase 4** : tracking séances + points (bouton "valider séance" sur chaque jour)
5. **Phase 5** : génération plan nutritionnel Gemini
6. **Phase 6** : leaderboard + polish UI

---

## 🎨 Design system

- Fond : `#0d0d0d`
- Accent néon : `#FFD600` (jaune)
- Texte principal : `#FFFFFF`
- Texte secondaire : `#9CA3AF`
- Typo : Inter (system fallback)
- CSS Modules partout — pas de Tailwind

---

## ⚠️ Règles d'or

1. Ne jamais modifier la BDD à la main — toujours `prisma migrate dev`.
2. Les appels Gemini uniquement dans `backend/src/services/ai/openai.service.ts`. Jamais côté frontend.
3. Toujours valider la réponse IA avec Zod avant insertion.
4. Les programmes ne sont pas modifiés en place : nouveau record + `isActive=false` sur l'ancien.
5. Backend port **3000**, frontend **5173**. Proxy Vite gère le `/api`.
6. Tous les imports backend en `.js` (ES modules + TS).
7. Les imports Prisma types : `import type { Prisma } from '@prisma/client'`.
