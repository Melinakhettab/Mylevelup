import api from './api'

export interface Meal {
  name: string
  foods: string[]
  calories: number
  proteins: number
  carbs: number
  fats: number
}

export interface NutritionDay {
  day: number
  dayName: string
  calories: number
  meals: Meal[]
}

export interface ShoppingItem {
  category: string
  items: string[]
}

export interface NutritionData {
  id: number
  weekStart: string
  isActive: boolean
  plan: NutritionDay[]
  shoppingList: ShoppingItem[]
  weeklyCalories: number
  weeklyProteins: number
}

interface NutritionResponse {
  success: boolean
  data: NutritionData | null
}

export async function generateNutrition(): Promise<NutritionData> {
  const { data } = await api.post<NutritionResponse>('/nutrition/generate')
  return data.data!
}

export async function getCurrentNutrition(): Promise<NutritionData | null> {
  const { data } = await api.get<NutritionResponse>('/nutrition/current')
  return data.data
}
