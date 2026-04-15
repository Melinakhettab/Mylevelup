import api from './api'

export interface AuthUser {
  id: number
  email: string
  createdAt: string
}

interface RegisterResponse {
  success: boolean
  data: {
    token: string
    user: AuthUser
  }
}

interface LoginResponse {
  success: boolean
  data: {
    token: string
    user: AuthUser
    hasProfile: boolean
  }
}

interface MeResponse {
  success: boolean
  data: {
    id: number
    email: string
    createdAt: string
    profile: Record<string, unknown> | null
    points: { total: number; streak: number } | null
  }
}

export async function registerUser(email: string, password: string): Promise<RegisterResponse['data']> {
  const { data } = await api.post<RegisterResponse>('/auth/register', { email, password })
  return data.data
}

export async function loginUser(email: string, password: string): Promise<LoginResponse['data']> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
  return data.data
}

export async function getMe(): Promise<MeResponse['data']> {
  const { data } = await api.get<MeResponse>('/auth/me')
  return data.data
}
