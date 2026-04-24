import { create } from 'zustand'
import type { NutritionData } from '../services/nutrition.service'

type ActiveTab = 'plan' | 'shopping'

interface NutritionStore {
  nutrition: NutritionData | null
  selectedDay: number
  activeTab: ActiveTab
  loading: boolean
  error: string

  setNutrition: (nutrition: NutritionData | null) => void
  setSelectedDay: (day: number) => void
  setActiveTab: (tab: ActiveTab) => void
  setLoading: (loading: boolean) => void
  setError: (error: string) => void
}

export const useNutritionStore = create<NutritionStore>((set) => ({
  nutrition: null,
  selectedDay: new Date().getDay() === 0 ? 7 : new Date().getDay(),
  activeTab: 'plan',
  loading: false,
  error: '',

  setNutrition: (nutrition) => set({ nutrition }),
  setSelectedDay: (day) => set({ selectedDay: day }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
