export interface User {
  id: number
  email: string
  createdAt: string
}

export interface Profile {
  id: number
  userId: number
  age: number
  weight: number
  height: number
  objective: Objective
  level: Level
  imc?: number
  bmr?: number
  tdee?: number
}

export type Objective = 'perte_poids' | 'prise_masse' | 'remise_en_forme' | 'maintien' | 'performance'
export type Level = 'debutant' | 'intermediaire' | 'avance'

export interface AuthResponse {
  token: string
  user: User
}
