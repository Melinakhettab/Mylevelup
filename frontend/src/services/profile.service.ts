import api from './api'

export interface ProfilePayload {
  firstName: string
  age: number
  weight: number
  height: number
  objective: string
  level: string
  equipment: string
  dietary: string[]
  hoursPerWeek: number
}

export interface Profile {
  id: number
  userId: number
  firstName: string | null
  age: number
  gender: string
  heightCm: number
  weightKg: number
  goal: string
  fitnessLevel: string
  weeklyAvailability: number
  equipment: string
  dietaryRestrictions: string[]
  bmi: number | null
  bmr: number | null
  tdee: number | null
  updatedAt: string
}

interface ProfileResponse {
  success: boolean
  data: Profile
}

export async function createProfile(payload: ProfilePayload): Promise<Profile> {
  const { data } = await api.post<ProfileResponse>('/profile', payload)
  return data.data
}

export async function getProfile(): Promise<Profile> {
  const { data } = await api.get<ProfileResponse>('/profile')
  return data.data
}

export async function updateProfile(payload: Partial<ProfilePayload>): Promise<Profile> {
  const { data } = await api.patch<ProfileResponse>('/profile', payload)
  return data.data
}
