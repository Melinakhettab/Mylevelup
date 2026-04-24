import api from './api'

export interface LeaderboardEntry {
  rank: number
  userId: number
  firstName: string
  total: number
  streak: number
}

export interface LeaderboardData {
  top: LeaderboardEntry[]
  me: LeaderboardEntry
}

interface LeaderboardResponse {
  success: boolean
  data: LeaderboardData
}

export async function getLeaderboard(): Promise<LeaderboardData> {
  const { data } = await api.get<LeaderboardResponse>('/leaderboard')
  return data.data
}
