import { create } from 'zustand'

interface SessionStore {
  points: number
  streak: number
  completedDays: number[]
  setPoints: (points: number, streak: number) => void
  markDayCompleted: (day: number) => void
  reset: () => void
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  points: 0,
  streak: 0,
  completedDays: [],

  setPoints: (points, streak) => set({ points, streak }),

  markDayCompleted: (day) => {
    const { completedDays } = get()
    if (!completedDays.includes(day)) {
      set({ completedDays: [...completedDays, day] })
    }
  },

  reset: () => set({ points: 0, streak: 0, completedDays: [] }),
}))
