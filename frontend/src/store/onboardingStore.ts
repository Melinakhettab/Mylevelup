import { create } from 'zustand'

export type Objective = 'perte_poids' | 'prise_masse' | 'remise_en_forme' | 'maintien' | 'performance'
export type Level = 'debutant' | 'intermediaire' | 'avance'
export type Equipment = 'domicile' | 'salle'
export type Dietary = 'aucun' | 'vegetarien' | 'vegan' | 'halal' | 'sans_gluten' | 'sans_lactose'

export interface RegisterData {
  email: string
  password: string
}

export interface ProfileData {
  firstName: string
  age: number | ''
  weight: number | ''
  height: number | ''
  objective: Objective | ''
  level: Level | ''
  equipment: Equipment | ''
  dietary: Dietary[]
  hoursPerWeek: number | ''
}

interface OnboardingStore {
  step: number
  registerData: RegisterData
  profileData: ProfileData
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setRegisterData: (data: Partial<RegisterData>) => void
  setProfileData: (data: Partial<ProfileData>) => void
  toggleDietary: (item: Dietary) => void
  reset: () => void
}

const initialProfile: ProfileData = {
  firstName: '',
  age: '',
  weight: '',
  height: '',
  objective: '',
  level: '',
  equipment: '',
  dietary: [],
  hoursPerWeek: '',
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  step: 0,
  registerData: { email: '', password: '' },
  profileData: initialProfile,

  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: s.step + 1 })),
  prevStep: () => set((s) => ({ step: Math.max(0, s.step - 1) })),

  setRegisterData: (data) =>
    set((s) => ({ registerData: { ...s.registerData, ...data } })),

  setProfileData: (data) =>
    set((s) => ({ profileData: { ...s.profileData, ...data } })),

  toggleDietary: (item) =>
    set((s) => {
      const current = s.profileData.dietary
      const updated = current.includes(item)
        ? current.filter((d) => d !== item)
        : [...current, item]
      return { profileData: { ...s.profileData, dietary: updated } }
    }),

  reset: () => set({ step: 0, registerData: { email: '', password: '' }, profileData: initialProfile }),
}))
