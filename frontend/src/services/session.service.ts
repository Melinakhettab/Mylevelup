import api from './api'

export interface SessionResult {
  points: number
  streak: number
  transaction: {
    id: number
    amount: number
    reason: string
    createdAt: string
  }
}

interface CompleteSessionPayload {
  programId: number
  dayNumber: number
  durationMin?: number
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

export async function completeSession(payload: CompleteSessionPayload): Promise<SessionResult> {
  const { data } = await api.post<ApiResponse<SessionResult>>('/sessions/complete', payload)
  return data.data
}

export async function getPoints(): Promise<{ total: number; streak: number }> {
  const { data } = await api.get<ApiResponse<{ total: number; streak: number }>>('/sessions/points')
  return data.data
}
