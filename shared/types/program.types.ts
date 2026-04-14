export interface Exercise {
  name: string
  sets: number
  reps: number
  rest: number
  difficulty: 'facile' | 'moyen' | 'difficile'
}

export interface Workout {
  day: number
  type: 'cardio' | 'musculation' | 'hiit' | 'mobilite' | 'repos'
  duration: number
  exercises: Exercise[]
}

export interface Program {
  id: number
  userId: number
  type: 'sport' | 'nutrition'
  content: Workout[]
  createdAt: string
}
