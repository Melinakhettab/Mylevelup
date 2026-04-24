import { z } from 'zod'

const exerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().min(1).max(10),
  reps: z.number().int().min(1).max(100),
  rest: z.number().int().min(0).max(300),
  difficulty: z.enum(['facile', 'moyen', 'difficile']),
})

const workoutDaySchema = z.object({
  day: z.number().int().min(1).max(7),
  dayName: z.string().min(1),
  type: z.enum(['musculation', 'cardio', 'hiit', 'mobilite', 'repos']),
  focus: z.string().min(1),
  duration: z.number().int().min(0).max(180),
  exercises: z.array(exerciseSchema),
})

const programResponseSchema = z.object({
  program: z.array(workoutDaySchema).length(7),
})

export type ValidatedProgram = z.infer<typeof programResponseSchema>
export type WorkoutDay = z.infer<typeof workoutDaySchema>

/**
 * Parses and validates the AI-generated program JSON.
 * Throws if the response is malformed.
 */
export function validateProgramResponse(raw: string): ValidatedProgram {
  // Try to extract JSON from the response (in case the AI wraps it in markdown)
  let jsonStr = raw.trim()

  // Remove markdown code blocks if present
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim()
  }

  const parsed = JSON.parse(jsonStr)
  return programResponseSchema.parse(parsed)
}
