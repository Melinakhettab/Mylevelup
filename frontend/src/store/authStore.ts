import { create } from 'zustand'

export interface AuthUser {
  id: number
  email: string
  createdAt: string
}

interface AuthStore {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  hasProfile: boolean

  setAuth: (token: string, user: AuthUser) => void
  setHasProfile: (v: boolean) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  hasProfile: false,

  setAuth: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  setHasProfile: (v) => set({ hasProfile: v }),

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null, isAuthenticated: false, hasProfile: false })
  },

  hydrate: () => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as AuthUser
        set({ token, user, isAuthenticated: true })
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  },
}))
