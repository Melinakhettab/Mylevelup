import api from './api'

export interface Exercise {
  name: string
  sets: number
  reps: number
  rest: number
  difficulty: 'facile' | 'moyen' | 'difficile'
}

export interface WorkoutDay {
  day: number
  dayName: string
  type: 'musculation' | 'cardio' | 'hiit' | 'mobilite' | 'repos'
  focus: string
  duration: number
  exercises: Exercise[]
}

export interface ProgramData {
  id: number
  weekStart: string
  isActive: boolean
  createdAt: string
  program: WorkoutDay[]
}

interface ProgramResponse {
  success: boolean
  data: ProgramData | null
}

export async function generateProgram(): Promise<ProgramData> {
  const { data } = await api.post<ProgramResponse>('/programs/generate')
  return data.data!
}

export async function getCurrentProgram(): Promise<ProgramData | null> {
  const { data } = await api.get<ProgramResponse>('/programs/current')
  return data.data
}
