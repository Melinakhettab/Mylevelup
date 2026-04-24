import OpenAI from 'openai'
import { env } from '../../config/env.js'
import { buildProgramPrompt, type ProfileContext } from './prompts.js'
import { validateProgramResponse, type ValidatedProgram } from './program.validator.js'
import { AppError } from '../../utils/errors.js'

let openRouterClient: OpenAI | null = null

function getClient(): OpenAI {
  if (!openRouterClient) {
    if (!env.OPENROUTER_API_KEY) {
      throw new AppError('Clé API OpenRouter non configurée', 503)
    }
    openRouterClient = new OpenAI({
      apiKey: env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://my-levelup.app',
        'X-Title': 'MY-LEVELUP FitQuest',
      },
    })
  }
  return openRouterClient
}

/**
 * Generates a personalized weekly sports program via OpenRouter.
 * Uses the OpenAI-compatible API. Includes retry logic (up to 2 attempts).
 */
export async function generateSportsProgram(profile: ProfileContext): Promise<ValidatedProgram> {
  const client = getClient()
  const prompt = buildProgramPrompt(profile)

  const maxAttempts = 2

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (env.NODE_ENV === 'development') {
        console.log(`🤖 Generating program via OpenRouter (${env.OPENROUTER_MODEL}) — attempt ${attempt}/${maxAttempts}...`)
      }

      const completion = await client.chat.completions.create({
        model: env.OPENROUTER_MODEL,
        temperature: 0.7,
        max_tokens: 4000,
        messages: [
          {
            role: 'system',
            content: 'Tu es un coach sportif expert. Tu réponds UNIQUEMENT en JSON valide, sans texte avant ni après.',
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
        console.log('📥 OpenRouter raw response (first 500 chars):', content.slice(0, 500))
      }

      let validated: ValidatedProgram
      try {
        validated = validateProgramResponse(content)
      } catch (validationErr) {
        if (env.NODE_ENV === 'development') {
          console.error('❌ Zod validation failed. Full raw content:')
          console.error(content)
        }
        throw validationErr
      }

      if (env.NODE_ENV === 'development') {
        const trainingDays = validated.program.filter(d => d.type !== 'repos').length
        console.log(`✅ Program generated: ${trainingDays} training days, ${7 - trainingDays} rest days`)
      }

      return validated

    } catch (err) {
      if (attempt === maxAttempts) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue'
        throw new AppError(`Échec de génération du programme: ${message}`, 502)
      }
      if (env.NODE_ENV === 'development') {
        console.warn(`⚠️ Attempt ${attempt} failed, retrying...`, (err as Error).message)
      }
    }
  }

  throw new AppError('Échec de génération du programme après plusieurs tentatives', 502)
}
