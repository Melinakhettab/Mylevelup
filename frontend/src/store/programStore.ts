import { create } from 'zustand'
import type { ProgramData, WorkoutDay } from '../services/program.service'

interface ProgramStore {
  program: ProgramData | null
  selectedDay: number
  loading: boolean
  error: string

  setProgram: (program: ProgramData | null) => void
  setSelectedDay: (day: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string) => void
  getCurrentDayWorkout: () => WorkoutDay | null
}

export const useProgramStore = create<ProgramStore>((set, get) => ({
  program: null,
  selectedDay: new Date().getDay() === 0 ? 7 : new Date().getDay(), // 1=Mon, 7=Sun
  loading: false,
  error: '',

  setProgram: (program) => set({ program }),
  setSelectedDay: (day) => set({ selectedDay: day }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  getCurrentDayWorkout: () => {
    const { program, selectedDay } = get()
    if (!program) return null
    return program.program.find((d) => d.day === selectedDay) ?? null
  },
}))
