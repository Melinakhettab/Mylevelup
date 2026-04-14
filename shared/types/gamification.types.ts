export interface Points {
  id: number
  userId: number
  total: number
  streak: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
