import axios, { AxiosInstance } from 'axios'
import { User, AuthResponse, Chore, Reward, HistoryEntry, PointsData } from '../types'

// API インスタンスを作成
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// リクエストインターセプタ：JWT トークンを自動付与
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// レスポンスインターセプタ：エラーハンドリング
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // トークン期限切れ時はログアウト
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }

    // エラーメッセージを整形
    const errorData = error.response?.data
    if (errorData && errorData.message) {
      // バックエンドからのエラーメッセージを使用
      const customError = new Error(errorData.message)
      ;(customError as any).code = errorData.code
      ;(customError as any).statusCode = error.response?.status
      return Promise.reject(customError)
    }

    // ステータスコードに基づくデフォルトメッセージ
    let message = 'エラーが発生しました。'
    const statusCode = error.response?.status || 500
    switch (statusCode) {
      case 400:
        message = '不正なリクエストです。'
        break
      case 404:
        message = 'リソースが見つかりません。'
        break
      case 500:
        message = 'サーバーエラーが発生しました。'
        break
      case 503:
        message = 'サーバーが利用できません。'
        break
    }

    const defaultError = new Error(message)
    ;(defaultError as any).statusCode = statusCode
    return Promise.reject(defaultError)
  }
)

const apiService = {
  // 認証関連
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/google', {
      idToken,
    })
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
    }
    return response.data
  },

  async logout(): Promise<void> {
    localStorage.removeItem('authToken')
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/api/users/me')
    return response.data
  },

  async updateUserType(userType: 'parent' | 'child'): Promise<User> {
    const response = await apiClient.patch<User>('/api/users/me', {
      userType,
    })
    return response.data
  },

  // お手伝い関連
  async getChores(): Promise<Chore[]> {
    const response = await apiClient.get<Chore[]>('/api/chores')
    return response.data
  },

  async createChore(
    name: string,
    points: number,
    recurring: boolean
  ): Promise<Chore> {
    const response = await apiClient.post<Chore>('/api/chores', {
      name,
      points,
      recurring,
    })
    return response.data
  },

  async updateChore(
    id: string,
    name: string,
    points: number,
    recurring: boolean
  ): Promise<Chore> {
    const response = await apiClient.put<Chore>(`/api/chores/${id}`, {
      name,
      points,
      recurring,
    })
    return response.data
  },

  async deleteChore(id: string): Promise<void> {
    await apiClient.delete(`/api/chores/${id}`)
  },

  async completeChore(id: string): Promise<{ pointsEarned: number }> {
    const response = await apiClient.post<{ pointsEarned: number }>(
      `/api/chores/${id}/complete`,
      {}
    )
    return response.data
  },

  // ご褒美関連
  async getRewards(): Promise<Reward[]> {
    const response = await apiClient.get<Reward[]>('/api/rewards')
    return response.data
  },

  async createReward(name: string, points: number): Promise<Reward> {
    const response = await apiClient.post<Reward>('/api/rewards', {
      name,
      points,
    })
    return response.data
  },

  async updateReward(id: string, name: string, points: number): Promise<Reward> {
    const response = await apiClient.put<Reward>(`/api/rewards/${id}`, {
      name,
      points,
    })
    return response.data
  },

  async deleteReward(id: string): Promise<void> {
    await apiClient.delete(`/api/rewards/${id}`)
  },

  async claimReward(id: string): Promise<{ pointsUsed: number }> {
    const response = await apiClient.post<{ pointsUsed: number }>(
      `/api/rewards/${id}/claim`,
      {}
    )
    return response.data
  },

  // 履歴関連
  async getHistory(startDate?: string, endDate?: string): Promise<HistoryEntry[]> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await apiClient.get<{ history: HistoryEntry[] }>(
      `/api/history?${params.toString()}`
    )
    return response.data.history
  },

  async getPoints(): Promise<PointsData> {
    const response = await apiClient.get<PointsData>('/api/history/points')
    return response.data
  },
}

export default apiService
