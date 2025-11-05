// Web アプリケーション用の型定義

export interface User {
  id: string
  email: string
  name: string
  userType: 'parent' | 'child'
  createdAt: string
  updatedAt: string
  hasPasscode: boolean
}

export interface Chore {
  id: string
  userId: string
  name: string
  points: number
  recurring: boolean
  createdAt: string
  updatedAt: string
}

export interface Reward {
  id: string
  userId: string
  name: string
  points: number
  createdAt: string
  updatedAt: string
}

export interface HistoryEntry {
  id: string
  userId: string
  type: 'earn' | 'claim'
  name: string
  points: number
  createdAt: string
}

export interface PointsData {
  totalPoints: number
  lastUpdated: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ApiError {
  error: string
  message?: string
  statusCode?: number
}
