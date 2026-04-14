# MY-LEVELUP - Script creation arborescence
# Executer depuis la racine du repo : .\setup.levelup.ps1

Write-Host ""
Write-Host "Creation de l'arborescence MY-LEVELUP..." -ForegroundColor Cyan
Write-Host ""

# DOSSIERS
$folders = @(
    "shared/types",
    "shared/constants",
    "shared/validators",
    "frontend/src/components/ui",
    "frontend/src/components/features",
    "frontend/src/pages",
    "frontend/src/hooks",
    "frontend/src/services",
    "frontend/src/store",
    "frontend/src/utils",
    "frontend/tests",
    "backend/src/controllers",
    "backend/src/services",
    "backend/src/routes",
    "backend/src/middlewares",
    "backend/src/utils",
    "backend/src/config",
    "backend/prisma",
    "backend/tests"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    Write-Host "  OK $folder" -ForegroundColor Green
}

Write-Host ""
Write-Host "Creation des fichiers..." -ForegroundColor Cyan
Write-Host ""

# .gitignore
$content = "node_modules/`ndist/`nbuild/`n.env`n.env.local`n.env.production`nlogs/`n*.log`n.DS_Store`nThumbs.db`ncoverage/"
Set-Content -Path ".gitignore" -Value $content -Encoding UTF8
Write-Host "  OK .gitignore" -ForegroundColor Green

# README.md
$content = "# MY-LEVELUP`n`nApplication web d'accompagnement sportif et nutritionnel gamifiee.`n`n## Stack`n- Frontend : React + TypeScript + Tailwind CSS`n- Backend  : Node.js + Express + Prisma`n- Base de donnees : PostgreSQL (Supabase)`n- IA : OpenAI API`n`n## Branches`n- main    : production (MR obligatoire)`n- develop : integration`n- feature/xxx : nouvelles fonctionnalites"
Set-Content -Path "README.md" -Value $content -Encoding UTF8
Write-Host "  OK README.md" -ForegroundColor Green

# .gitlab-ci.yml
$lines = @(
    "stages:",
    "  - lint",
    "  - test",
    "  - build",
    "  - version",
    "",
    "lint:backend:",
    "  stage: lint",
    "  image: node:20",
    "  script:",
    "    - cd backend && npm ci && npm run lint",
    "",
    "lint:frontend:",
    "  stage: lint",
    "  image: node:20",
    "  script:",
    "    - cd frontend && npm ci && npm run lint",
    "",
    "test:backend:",
    "  stage: test",
    "  image: node:20",
    "  script:",
    "    - cd backend && npm ci && npm test -- --coverage",
    "  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'",
    "",
    "test:frontend:",
    "  stage: test",
    "  image: node:20",
    "  script:",
    "    - cd frontend && npm ci && npm test",
    "",
    "build:frontend:",
    "  stage: build",
    "  image: node:20",
    "  script:",
    "    - cd frontend && npm ci && npm run build",
    "  artifacts:",
    "    paths:",
    "      - frontend/dist/",
    "  only:",
    "    - main",
    "    - develop",
    "",
    "version:",
    "  stage: version",
    "  image: node:20",
    "  script:",
    "    - git config user.email 'ci@my-levelup.com'",
    "    - git config user.name 'GitLab CI'",
    "    - npx standard-version --no-verify",
    "    - git push --follow-tags origin main",
    "  only:",
    "    - main"
)
Set-Content -Path ".gitlab-ci.yml" -Value $lines -Encoding UTF8
Write-Host "  OK .gitlab-ci.yml" -ForegroundColor Green

# shared/types/user.types.ts
$lines = @(
    "export interface User {",
    "  id: number",
    "  email: string",
    "  createdAt: string",
    "}",
    "",
    "export interface Profile {",
    "  id: number",
    "  userId: number",
    "  age: number",
    "  weight: number",
    "  height: number",
    "  objective: Objective",
    "  level: Level",
    "  imc?: number",
    "  bmr?: number",
    "  tdee?: number",
    "}",
    "",
    "export type Objective = 'perte_poids' | 'prise_masse' | 'remise_en_forme' | 'maintien' | 'performance'",
    "export type Level = 'debutant' | 'intermediaire' | 'avance'",
    "",
    "export interface AuthResponse {",
    "  token: string",
    "  user: User",
    "}"
)
Set-Content -Path "shared/types/user.types.ts" -Value $lines -Encoding UTF8
Write-Host "  OK shared/types/user.types.ts" -ForegroundColor Green

# shared/types/program.types.ts
$lines = @(
    "export interface Exercise {",
    "  name: string",
    "  sets: number",
    "  reps: number",
    "  rest: number",
    "  difficulty: 'facile' | 'moyen' | 'difficile'",
    "}",
    "",
    "export interface Workout {",
    "  day: number",
    "  type: 'cardio' | 'musculation' | 'hiit' | 'mobilite' | 'repos'",
    "  duration: number",
    "  exercises: Exercise[]",
    "}",
    "",
    "export interface Program {",
    "  id: number",
    "  userId: number",
    "  type: 'sport' | 'nutrition'",
    "  content: Workout[]",
    "  createdAt: string",
    "}"
)
Set-Content -Path "shared/types/program.types.ts" -Value $lines -Encoding UTF8
Write-Host "  OK shared/types/program.types.ts" -ForegroundColor Green

# shared/types/nutrition.types.ts
$lines = @(
    "export interface Meal {",
    "  name: string",
    "  calories: number",
    "  proteins: number",
    "  carbs: number",
    "  fats: number",
    "  ingredients: string[]",
    "}",
    "",
    "export interface DayMeals {",
    "  day: number",
    "  breakfast: Meal",
    "  lunch: Meal",
    "  snack?: Meal",
    "  dinner: Meal",
    "  totalCalories: number",
    "}",
    "",
    "export interface MealPlan {",
    "  days: DayMeals[]",
    "}",
    "",
    "export interface GroceryItem {",
    "  name: string",
    "  quantity: string",
    "  category: string",
    "}",
    "",
    "export interface GroceryList {",
    "  items: GroceryItem[]",
    "}"
)
Set-Content -Path "shared/types/nutrition.types.ts" -Value $lines -Encoding UTF8
Write-Host "  OK shared/types/nutrition.types.ts" -ForegroundColor Green

# shared/types/gamification.types.ts
$lines = @(
    "export interface Points {",
    "  id: number",
    "  userId: number",
    "  total: number",
    "  streak: number",
    "}",
    "",
    "export interface ApiResponse<T> {",
    "  success: boolean",
    "  data?: T",
    "  message?: string",
    "  error?: string",
    "}"
)
Set-Content -Path "shared/types/gamification.types.ts" -Value $lines -Encoding UTF8
Write-Host "  OK shared/types/gamification.types.ts" -ForegroundColor Green

# shared/constants/rules.ts
$lines = @(
    "export const IA_RULES = {",
    "  MIN_CALORIES: 1200,",
    "  MAX_CALORIES: 4500,",
    "  MIN_REPS: 1,",
    "  MAX_REPS: 50,",
    "  MIN_SESSIONS_PER_WEEK: 1,",
    "  MAX_SESSIONS_PER_WEEK: 7,",
    "  POINTS_PER_SESSION: 10,",
    "  STREAK_BONUS: 5,",
    "}"
)
Set-Content -Path "shared/constants/rules.ts" -Value $lines -Encoding UTF8
Write-Host "  OK shared/constants/rules.ts" -ForegroundColor Green

# shared/constants/objectives.ts
$lines = @(
    "export const OBJECTIVES = ['perte_poids', 'prise_masse', 'remise_en_forme', 'maintien', 'performance'] as const",
    "export const LEVELS = ['debutant', 'intermediaire', 'avance'] as const",
    "export const EQUIPMENT = ['domicile', 'salle'] as const",
    "export const DIETARY = ['aucun', 'vegetarien', 'vegan', 'halal', 'sans_gluten', 'sans_lactose'] as const"
)
Set-Content -Path "shared/constants/objectives.ts" -Value $lines -Encoding UTF8
Write-Host "  OK shared/constants/objectives.ts" -ForegroundColor Green

# shared/validators/profile.schema.ts
$lines = @(
    "import { z } from 'zod'",
    "",
    "export const profileSchema = z.object({",
    "  age:          z.number().min(10).max(120),",
    "  weight:       z.number().min(20).max(300),",
    "  height:       z.number().min(100).max(250),",
    "  objective:    z.enum(['perte_poids', 'prise_masse', 'remise_en_forme', 'maintien', 'performance']),",
    "  level:        z.enum(['debutant', 'intermediaire', 'avance']),",
    "  equipment:    z.enum(['domicile', 'salle']),",
    "  dietary:      z.array(z.string()).optional(),",
    "  hoursPerWeek: z.number().min(1).max(20),",
    "})",
    "",
    "export type ProfileInput = z.infer<typeof profileSchema>"
)
Set-Content -Path "shared/validators/profile.schema.ts" -Value $lines -Encoding UTF8
Write-Host "  OK shared/validators/profile.schema.ts" -ForegroundColor Green

# backend/.env.example
$lines = @(
    "# Base de donnees (Supabase PostgreSQL)",
    "DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE",
    "",
    "# JWT",
    "JWT_SECRET=your-super-secret-key-change-this",
    "JWT_EXPIRES_IN=24h",
    "",
    "# OpenAI",
    "OPENAI_API_KEY=sk-...",
    "OPENAI_MODEL=gpt-4o-mini",
    "",
    "# Serveur",
    "PORT=3000",
    "NODE_ENV=development"
)
Set-Content -Path "backend/.env.example" -Value $lines -Encoding UTF8
Write-Host "  OK backend/.env.example" -ForegroundColor Green

# backend/prisma/schema.prisma
$lines = @(
    "generator client {",
    "  provider = `"prisma-client-js`"",
    "}",
    "",
    "datasource db {",
    "  provider = `"postgresql`"",
    "  url      = env(`"DATABASE_URL`")",
    "}",
    "",
    "model User {",
    "  id        Int       @id @default(autoincrement())",
    "  email     String    @unique",
    "  password  String",
    "  profile   Profile?",
    "  programs  Program[]",
    "  points    Points?",
    "  createdAt DateTime  @default(now())",
    "  updatedAt DateTime  @updatedAt",
    "}",
    "",
    "model Profile {",
    "  id           Int      @id @default(autoincrement())",
    "  userId       Int      @unique",
    "  age          Int",
    "  weight       Float",
    "  height       Float",
    "  objective    String",
    "  level        String",
    "  equipment    String",
    "  dietary      String[]",
    "  hoursPerWeek Int",
    "  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)",
    "}",
    "",
    "model Program {",
    "  id        Int      @id @default(autoincrement())",
    "  userId    Int",
    "  type      String",
    "  content   Json",
    "  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)",
    "  createdAt DateTime @default(now())",
    "}",
    "",
    "model Points {",
    "  id     Int  @id @default(autoincrement())",
    "  userId Int  @unique",
    "  total  Int  @default(0)",
    "  streak Int  @default(0)",
    "  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)",
    "}"
)
Set-Content -Path "backend/prisma/schema.prisma" -Value $lines -Encoding UTF8
Write-Host "  OK backend/prisma/schema.prisma" -ForegroundColor Green

# .gitkeep pour dossiers vides
$gitkeeps = @(
    "frontend/src/components/ui/.gitkeep",
    "frontend/src/components/features/.gitkeep",
    "frontend/src/pages/.gitkeep",
    "frontend/src/hooks/.gitkeep",
    "frontend/src/services/.gitkeep",
    "frontend/src/store/.gitkeep",
    "frontend/src/utils/.gitkeep",
    "frontend/tests/.gitkeep",
    "backend/src/controllers/.gitkeep",
    "backend/src/services/.gitkeep",
    "backend/src/routes/.gitkeep",
    "backend/src/middlewares/.gitkeep",
    "backend/src/utils/.gitkeep",
    "backend/src/config/.gitkeep",
    "backend/tests/.gitkeep"
)
foreach ($f in $gitkeeps) {
    New-Item -ItemType File -Path $f -Force | Out-Null
}
Write-Host "  OK .gitkeep dans tous les dossiers vides" -ForegroundColor Green

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Arborescence MY-LEVELUP creee avec succes !" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines etapes :" -ForegroundColor Yellow
Write-Host "  1. cd backend  -> npm init -y" -ForegroundColor White
Write-Host "  2. cd frontend -> npm create vite@latest . -- --template react-ts" -ForegroundColor White
Write-Host "  3. Copier backend/.env.example -> backend/.env et remplir les valeurs" -ForegroundColor White
Write-Host "  4. git add . -> git commit -m 'feat: initial project structure' -> git push origin develop" -ForegroundColor White
Write-Host ""
