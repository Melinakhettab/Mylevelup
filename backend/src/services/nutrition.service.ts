import { z } from 'zod'
import OpenAI from 'openai'
import type { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { NotFoundError, AppError } from '../utils/errors.js'
import { env } from '../config/env.js'
import { buildNutritionPrompt, type NutritionContext } from './ai/nutrition.prompts.js'

const client = new OpenAI({
  apiKey: env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://my-levelup.app',
    'X-Title': 'MY-LEVELUP FitQuest',
  },
})

const MealSchema = z.object({
  name: z.string(),
  foods: z.array(z.string()).min(1),
  calories: z.number(),
  proteins: z.number(),
  carbs: z.number(),
  fats: z.number(),
})

const NutritionDaySchema = z.object({
  day: z.number().min(1).max(7),
  dayName: z.string(),
  calories: z.number(),
  meals: z.array(MealSchema).min(1),
})

const ShoppingItemSchema = z.object({
  category: z.string(),
  items: z.array(z.string()).min(1),
})

const NutritionResponseSchema = z.object({
  plan: z.array(NutritionDaySchema).min(1).max(7),
  shoppingList: z.array(ShoppingItemSchema).min(1),
  weeklyCalories: z.number(),
  weeklyProteins: z.number(),
})

type ValidatedNutrition = z.infer<typeof NutritionResponseSchema>

function validateNutritionResponse(raw: string): ValidatedNutrition {
  let parsed: unknown
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    parsed = JSON.parse(cleaned)
  } catch {
    throw new AppError('Réponse IA non valide (JSON malformé)', 502)
  }
  return NutritionResponseSchema.parse(parsed)
}

async function generateNutritionAI(context: NutritionContext): Promise<ValidatedNutrition> {
  const prompt = buildNutritionPrompt(context)
  const maxAttempts = 2

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (env.NODE_ENV === 'development') {
        console.log(`Generating nutrition plan via OpenRouter (${env.OPENROUTER_MODEL}) — attempt ${attempt}/${maxAttempts}...`)
      }

      const completion = await client.chat.completions.create({
        model: env.OPENROUTER_MODEL,
        temperature: 0.7,
        max_tokens: 6000,
        messages: [
          {
            role: 'system',
            content: 'Tu es un nutritionniste sportif expert. Tu réponds UNIQUEMENT en JSON valide, sans texte avant ni après.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('Réponse vide de l\'IA')
      }

      if (env.NODE_ENV === 'development') {
        console.log('OpenRouter nutrition raw response (first 500 chars):', content.slice(0, 500))
      }

      let validated: ValidatedNutrition
      try {
        validated = validateNutritionResponse(content)
      } catch (validationErr) {
        if (env.NODE_ENV === 'development') {
          console.error('Zod validation failed. Full raw content:')
          console.error(content)
        }
        throw validationErr
      }

      if (env.NODE_ENV === 'development') {
        console.log(`Nutrition plan generated: ${validated.plan.length} days`)
      }

      return validated
    } catch (err) {
      if (attempt === maxAttempts) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue'
        throw new AppError(`Échec de génération du plan nutritionnel: ${message}`, 502)
      }
      if (env.NODE_ENV === 'development') {
        console.warn(`Attempt ${attempt} failed, retrying...`, (err as Error).message)
      }
    }
  }

  throw new AppError('Échec de génération du plan nutritionnel après plusieurs tentatives', 502)
}

function getWeekStart(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

export async function generateNutritionForUser(userId: number) {
  const profile = await prisma.profile.findUnique({ where: { userId } })
  if (!profile) {
    throw new NotFoundError('Profil introuvable — complète d\'abord le questionnaire')
  }

  const context: NutritionContext = {
    firstName: profile.firstName || 'Utilisateur',
    goal: profile.goal,
    weightKg: Number(profile.weightKg),
    heightCm: profile.heightCm,
    tdee: profile.tdee,
    bmr: profile.bmr,
    dietaryRestrictions: profile.dietaryRestrictions ?? [],
    equipment: profile.equipment,
  }

  await prisma.nutritionPlan.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  })

  const result = await generateNutritionAI(context)

  const plan = await prisma.nutritionPlan.create({
    data: {
      userId,
      weekStart: getWeekStart(),
      content: result.plan as unknown as Prisma.InputJsonValue,
      shoppingList: result.shoppingList as unknown as Prisma.InputJsonValue,
      isActive: true,
    },
  })

  return {
    id: plan.id,
    weekStart: plan.weekStart,
    isActive: plan.isActive,
    plan: result.plan,
    shoppingList: result.shoppingList,
    weeklyCalories: result.weeklyCalories,
    weeklyProteins: result.weeklyProteins,
  }
}

export async function getCurrentNutrition(userId: number) {
  const plan = await prisma.nutritionPlan.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'desc' },
  })

  if (!plan) {
    return null
  }

  const content = plan.content as unknown as ValidatedNutrition['plan']
  const shopping = plan.shoppingList as unknown as ValidatedNutrition['shoppingList']

  const weeklyCalories = Array.isArray(content)
    ? content.reduce((sum: number, d: { calories?: number }) => sum + (d.calories ?? 0), 0)
    : 0
  const weeklyProteins = Array.isArray(content)
    ? content.reduce((sum: number, d: { meals?: Array<{ proteins?: number }> }) =>
        sum + (d.meals ?? []).reduce((ms, m) => ms + (m.proteins ?? 0), 0), 0)
    : 0

  return {
    id: plan.id,
    weekStart: plan.weekStart,
    isActive: plan.isActive,
    plan: content,
    shoppingList: shopping,
    weeklyCalories,
    weeklyProteins,
  }
}
