# MY-LEVELUP — FitQuest POC

A gamified fitness and nutrition coaching web application that generates AI-powered weekly training programs tailored to each user's profile.

---

## POC Description

MY-LEVELUP lets a user:

1. **Register / Log in** — JWT-secured authentication.
2. **Complete a 6-step onboarding questionnaire** — age, weight, height, goal, fitness level, available equipment, and weekly time budget. BMI, BMR, and TDEE are computed automatically.
3. **Generate a personalised 7-day training program** — a Large Language Model (OpenRouter / LLaMA 3.3-70b) produces a structured JSON plan that is validated with Zod and persisted in PostgreSQL.
4. **Track sessions** — mark training days as completed, earn points and maintain a streak.
5. **View a nutrition plan** — AI-generated meal plan and shopping list.
6. **Compete on a leaderboard** — weekly ranking by points.

The project is split into two independent services that communicate over HTTP:

```
Browser  →  Frontend SPA (React 19 + Vite, port 5173)
                 ↓  /api/*  (Vite proxy)
             Backend API (Express 4 + Prisma 7, port 3000)
                 ↓
             Supabase PostgreSQL  (cloud, eu-west-2)
                 ↓
             OpenRouter LLM API   (cloud)
```

---

## Technical Prerequisites

| Requirement | Minimum version | Notes |
|---|---|---|
| Node.js | 20.x LTS | 22.x also works |
| npm | 10.x | bundled with Node 20 |
| Git | any recent | for cloning |
| PostgreSQL | hosted on Supabase | no local install required |

> **No Docker, Python, or local database required.** The database runs on Supabase (already provisioned). You only need Node 20 and two API keys.

Check your Node version:

```bash
node -v   # must be >= 20
npm -v    # must be >= 10
```

---

## Required API Keys

You need two credentials before starting:

| Key | Where to get it | Used for |
|---|---|---|
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string (Transaction pooler) | PostgreSQL via Prisma |
| `OPENROUTER_API_KEY` | https://openrouter.ai → Keys | AI program generation |

The Supabase database is already migrated — you do **not** need to run `prisma migrate dev`.

---

## Installation Steps

### 1. Clone the repository

```bash
git clone <repository-url>
cd my-levelup
```

### 2. Configure the backend environment

Create the file `backend/.env` with the following content (replace the placeholder values):

```env
# Database — Supabase PostgreSQL via Transaction Pooler
# ⚠️  Encode @ in the password as %40
# ⚠️  Use aws-1-eu-west-2 (not aws-0)
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-1-eu-west-2.pooler.supabase.com:5432/postgres"

# JWT
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=24h

# OpenRouter — LLM provider (OpenAI-compatible API)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free

# Server
PORT=3000
NODE_ENV=development
```

> **Common pitfalls:**
> - The `@` character inside the password must be percent-encoded as `%40` in the URL.
> - Use the **transaction pooler** host (`aws-1-eu-west-2.pooler.supabase.com:5432`), not the direct host (`db.*.supabase.co`) — the direct host does not resolve from local machines.

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Generate the Prisma client

```bash
# Still inside backend/
npx prisma generate
```

> The database schema is already applied on Supabase. This command only regenerates the TypeScript client from `prisma/schema.prisma`.

### 5. Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

## Run Instructions

Open **two terminal windows** and run each service in its own terminal.

### Terminal 1 — Backend API (port 3000)

```bash
cd backend
npm run dev
```

Expected output:

```
⚡ MY-LEVELUP API
─────────────────────────────
🌐 http://localhost:3000
📡 Health: http://localhost:3000/api/health
🔑 Auth:   POST /api/auth/register
           POST /api/auth/login
─────────────────────────────
🏗️  Mode: development
```

Verify the backend is up:

```bash
curl http://localhost:3000/api/health
# → {"status":"ok","timestamp":"..."}
```

### Terminal 2 — Frontend SPA (port 5173)

```bash
cd frontend
npm run dev
```

Expected output:

```
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

## Full API Reference

Base URL: `http://localhost:3000/api`

All authenticated endpoints require the header:
```
Authorization: Bearer <token>
```

All responses follow the envelope: `{ "success": true, "data": ... }` or `{ "success": false, "error": "..." }`.

### Authentication

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/auth/register` | No | `{ email, password }` | Create account, returns `{ token, user }` |
| POST | `/auth/login` | No | `{ email, password }` | Returns `{ token, user }` |
| GET | `/auth/me` | Yes | — | Returns current user |

### Profile

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/profile` | Yes | Get user profile (includes BMI/BMR/TDEE) |
| POST | `/profile` | Yes | Create or update profile (upsert) |
| PATCH | `/profile` | Yes | Partial update |

### Training Programs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/programs/generate` | Yes | Trigger AI generation (LLM call, ~10-30 s) |
| GET | `/programs/current` | Yes | Get the active program |
| GET | `/programs/history` | Yes | Get last 10 programs |

### Session Tracking

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/sessions` | Yes | Log a completed session |
| GET | `/sessions` | Yes | List session history |

### Nutrition

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/nutrition/generate` | Yes | Generate a weekly nutrition plan |
| GET | `/nutrition/current` | Yes | Get the active nutrition plan |

### Leaderboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/leaderboard` | Yes | Weekly ranking by points |

---

## Project Structure

```
my-levelup/
├── backend/
│   ├── server.ts                   # Entry point (listens on PORT)
│   ├── prisma.config.ts            # Prisma v7 datasource config
│   ├── prisma/
│   │   └── schema.prisma           # 8 models: User, Profile, Program, …
│   └── src/
│       ├── app.ts                  # Express app + middlewares
│       ├── config/                 # env.ts, prisma.ts
│       ├── controllers/            # auth, profile, program, session, nutrition, leaderboard
│       ├── services/
│       │   └── ai/                 # LLM call (openai.service.ts), prompt builder, Zod validator
│       ├── routes/                 # one file per domain
│       ├── middleware/             # JWT auth, Zod validate, error handler
│       ├── schemas/                # Zod input schemas
│       └── utils/                  # AppError, BMI/BMR/TDEE calculations
│
└── frontend/
    ├── vite.config.ts              # Proxy /api → localhost:3000
    └── src/
        ├── App.tsx                 # Routes: /, /register, /login, /onboarding, /dashboard, /program, …
        ├── pages/                  # Welcome, Register, Login, Onboarding, Dashboard, Program,
        │                           #   Nutrition, Leaderboard, Profile
        ├── store/                  # Zustand: authStore, profileStore, programStore
        ├── services/               # axios wrappers per domain
        └── components/             # ProtectedRoute, GuestRoute
```

---

## Database Schema (summary)

| Table | Key columns |
|---|---|
| `users` | id, email, password, created_at |
| `profiles` | user_id, goal, fitness_level, equipment, bmi, bmr, tdee |
| `programs` | user_id, week_start, content (JSON 7 days), is_active |
| `nutrition_plans` | user_id, week_start, content (JSON), shopping_list (JSON), is_active |
| `points` | user_id, total, streak |
| `point_transactions` | user_id, amount, reason |
| `session_logs` | user_id, program_id, session_date, completed |
| `weight_history` | user_id, weight_kg, recorded_at |

---

## Design System

- Background: `#0d0d0d`
- Accent (neon yellow): `#FFD600`
- Primary text: `#FFFFFF`
- Secondary text: `#9CA3AF`
- Font: Inter (system fallback)
- Styling: CSS Modules only (no Tailwind, no UI library)

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `ENOTFOUND db.*.supabase.co` | Using direct host instead of pooler | Use `aws-1-eu-west-2.pooler.supabase.com` |
| `Tenant or user not found` | Wrong pooler region (`aws-0` vs `aws-1`) | Use `aws-1-eu-west-2` |
| `P1001: Can't reach database` | `@` not encoded in password | Replace `@` with `%40` in `DATABASE_URL` |
| `Erreur lors de la génération` | Axios timeout (15 s) shorter than LLM call | LLM may take 20-30 s; wait or increase timeout in `frontend/src/services/api.ts` |
| `PrismaClientInitializationError` | `prisma generate` not run | Run `cd backend && npx prisma generate` |
| Port 3000 already in use | Another process is running | Kill it: `npx kill-port 3000` |
