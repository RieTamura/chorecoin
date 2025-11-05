import axios, { AxiosInstance } from 'axios'
import { User, AuthResponse, Chore, Reward, HistoryEntry, PointsData } from '../types'

export const DEMO_TOKEN_PREFIX = 'demo-token'
const DEMO_STORAGE_KEY = 'chorecoin-demo-state'

interface DemoState {
  user: User
  chores: Chore[]
  rewards: Reward[]
  history: HistoryEntry[]
  points: PointsData
  parentPasscode?: string | null
}

const createId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`)

const createDefaultDemoState = (): DemoState => {
  const now = new Date()
  const nowIso = now.toISOString()
  const minusHours = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString()

  const user: User = {
    id: 'demo-user',
    email: 'demo@example.com',
    name: 'デモユーザー',
    userType: 'parent',
    createdAt: nowIso,
    updatedAt: nowIso,
    hasPasscode: true,
  }

  const chores: Chore[] = [
    {
      id: 'demo-chore-1',
      userId: user.id,
      name: '食器を洗う',
      points: 20,
      recurring: true,
      createdAt: minusHours(72),
      updatedAt: minusHours(6),
    },
    {
      id: 'demo-chore-2',
      userId: user.id,
      name: '部屋を掃除する',
      points: 15,
      recurring: true,
      createdAt: minusHours(48),
      updatedAt: minusHours(4),
    },
    {
      id: 'demo-chore-3',
      userId: user.id,
      name: 'ゴミ出し',
      points: 10,
      recurring: false,
      createdAt: minusHours(24),
      updatedAt: minusHours(2),
    },
  ]

  const rewards: Reward[] = [
    {
      id: 'demo-reward-1',
      userId: user.id,
      name: '30分ゲームタイム',
      points: 40,
      createdAt: minusHours(96),
      updatedAt: minusHours(12),
    },
    {
      id: 'demo-reward-2',
      userId: user.id,
      name: 'お菓子タイム',
      points: 25,
      createdAt: minusHours(90),
      updatedAt: minusHours(10),
    },
  ]

  const history: HistoryEntry[] = [
    {
      id: 'demo-history-1',
      userId: user.id,
      type: 'earn',
      name: '食器を洗う',
      points: 20,
      createdAt: minusHours(18),
    },
    {
      id: 'demo-history-2',
      userId: user.id,
      type: 'earn',
      name: '部屋を掃除する',
      points: 15,
      createdAt: minusHours(12),
    },
    {
      id: 'demo-history-3',
      userId: user.id,
      type: 'claim',
      name: '30分ゲームタイム',
      points: 40,
      createdAt: minusHours(6),
    },
  ]

  const points: PointsData = {
    totalPoints: 85,
    lastUpdated: nowIso,
  }

  return { user, chores, rewards, history, points, parentPasscode: '1234' }
}

let cachedDemoState: DemoState | null = null

const saveDemoState = (state: DemoState) => {
  cachedDemoState = state
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state))
}

const ensureDemoState = (): DemoState => {
  if (cachedDemoState) {
    cachedDemoState.user.hasPasscode = Boolean(cachedDemoState.parentPasscode)
    return cachedDemoState
  }

  const stored = localStorage.getItem(DEMO_STORAGE_KEY)
  if (stored) {
    try {
      cachedDemoState = JSON.parse(stored) as DemoState
      cachedDemoState.user.hasPasscode = Boolean(cachedDemoState.parentPasscode)
      return cachedDemoState
    } catch (error) {
      console.warn('Demo state parse failed. Resetting demo data.', error)
    }
  }

  const defaultState = createDefaultDemoState()
  saveDemoState(defaultState)
  return defaultState
}

const updateDemoState = (mutator: (draft: DemoState) => void): DemoState => {
  const draft = JSON.parse(JSON.stringify(ensureDemoState())) as DemoState
  mutator(draft)
  draft.user.hasPasscode = Boolean(draft.parentPasscode)
  saveDemoState(draft)
  return draft
}

const resetDemoState = () => {
  cachedDemoState = null
  localStorage.removeItem(DEMO_STORAGE_KEY)
}

const isDemoAuthToken = () => {
  const token = localStorage.getItem('authToken')
  return !!token && token.startsWith(DEMO_TOKEN_PREFIX)
}

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
      // トークン期限切れ時はログアウト（デモモードは除外）
      if (!isDemoAuthToken()) {
        localStorage.removeItem('authToken')
        window.location.href = '/login'
      }
    }

    // エラーメッセージを整形
    const errorData = error.response?.data
    if (errorData && errorData.message) {
      // バックエンドからのエラーメッセージを使用
      const customError = new Error(errorData.message)
      ;(customError as any).code = errorData.code
      ;(customError as any).statusCode = error.response?.status
      ;(customError as any).details = errorData.details
      return Promise.reject(customError)
    }

    // ステータスコードに基づくデフォルトメッセージ
    let message = 'エラーが発生しました。'
    const statusCode = error.response?.status || 500
    switch (statusCode) {
      case 400:
        message = 'リクエストが無効です。入力内容を確認してください。'
        break
      case 401:
        message = 'ログインが必要です。'
        break
      case 403:
        message = 'この操作を実行する権限がありません。'
        break
      case 404:
        message = 'リソースが見つかりません。'
        break
      case 409:
        message = 'リソースが既に存在します。'
        break
      case 422:
        message = '入力値が正しくありません。'
        break
      case 500:
        message = 'サーバーエラーが発生しました。時間をおいて再度お試しください。'
        break
      case 503:
        message = 'サーバーが利用できません。時間をおいて再度お試しください。'
        break
    }

    // ネットワークエラーの場合
    if (!error.response) {
      if (error.message === 'Network Error') {
        message = 'ネットワーク接続に問題があります。インターネット接続を確認してください。'
      } else if (error.code === 'ECONNABORTED') {
        message = 'リクエストがタイムアウトしました。ネットワーク接続を確認してください。'
      }
    }

    const defaultError = new Error(message)
    ;(defaultError as any).statusCode = statusCode
    ;(defaultError as any).originalError = error
    return Promise.reject(defaultError)
  }
)

const apiService = {
  initializeDemoData(): User {
    const state = ensureDemoState()
    return JSON.parse(JSON.stringify(state.user))
  },

  getDemoUser(): User {
    const state = ensureDemoState()
    return JSON.parse(JSON.stringify(state.user))
  },

  isDemoMode(): boolean {
    return isDemoAuthToken()
  },

  // 認証関連
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/google', {
      idToken,
    })
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      resetDemoState()
    }
    return response.data
  },

  async logout(): Promise<void> {
    localStorage.removeItem('authToken')
    resetDemoState()
  },

  async getMe(): Promise<User> {
    if (isDemoAuthToken()) {
      return JSON.parse(JSON.stringify(ensureDemoState().user))
    }
    const response = await apiClient.get<User>('/api/users/me')
    return response.data
  },

  async updateUserType(userType: 'parent' | 'child', passcode?: string): Promise<User> {
    if (isDemoAuthToken()) {
      let updatedUser: User | null = null
      const now = new Date().toISOString()
      updateDemoState((draft) => {
        if (userType === 'parent' && draft.parentPasscode) {
          if (!passcode) {
            throw new Error('親パスコードを入力してください。')
          }
          if (passcode !== draft.parentPasscode) {
            throw new Error('親パスコードが正しくありません。')
          }
        }
        draft.user.userType = userType
        draft.user.updatedAt = now
        updatedUser = { ...draft.user }
      })
      if (!updatedUser) {
        throw new Error('ユーザー情報の更新に失敗しました。')
      }
      return updatedUser
    }

    const payload: Record<string, unknown> = { userType }
    if (passcode) {
      payload.passcode = passcode
    }

    const response = await apiClient.patch<User>('/api/users/me', payload)
    return response.data
  },

  async setParentPasscode(passcode: string, currentPasscode?: string): Promise<User> {
    if (isDemoAuthToken()) {
      let updatedUser: User | null = null
      const now = new Date().toISOString()
      updateDemoState((draft) => {
        draft.parentPasscode = passcode
        draft.user.hasPasscode = true
        draft.user.updatedAt = now
        updatedUser = { ...draft.user }
      })
      if (!updatedUser) {
        throw new Error('親パスコードの更新に失敗しました。')
      }
      return updatedUser
    }

    const payload: Record<string, unknown> = { passcode }
    if (currentPasscode) {
      payload.currentPasscode = currentPasscode
    }

    const response = await apiClient.post<User>('/api/users/passcode', payload)
    return response.data
  },

  // お手伝い関連
  async getChores(): Promise<Chore[]> {
    if (isDemoAuthToken()) {
      return ensureDemoState().chores.map((chore) => ({ ...chore }))
    }
    const response = await apiClient.get<Chore[]>('/api/chores')
    return response.data
  },

  async createChore(
    name: string,
    points: number,
    recurring: boolean
  ): Promise<Chore> {
    if (isDemoAuthToken()) {
      const now = new Date().toISOString()
      const userId = ensureDemoState().user.id
      const newChore: Chore = {
        id: createId(),
        userId,
        name,
        points,
        recurring,
        createdAt: now,
        updatedAt: now,
      }
      updateDemoState((draft) => {
        draft.chores = [newChore, ...draft.chores]
      })
      return { ...newChore }
    }

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
    if (isDemoAuthToken()) {
      let updatedChore: Chore | null = null
      const now = new Date().toISOString()
      updateDemoState((draft) => {
        const index = draft.chores.findIndex((chore) => chore.id === id)
        if (index === -1) {
          throw new Error('お手伝いが見つかりません。')
        }
        const chore = {
          ...draft.chores[index],
          name,
          points,
          recurring,
          updatedAt: now,
        }
        draft.chores[index] = chore
        updatedChore = chore
      })
      if (!updatedChore) {
        throw new Error('お手伝いが見つかりません。')
      }
      return updatedChore
    }

    const response = await apiClient.put<Chore>(`/api/chores/${id}`, {
      name,
      points,
      recurring,
    })
    return response.data
  },

  async deleteChore(id: string): Promise<void> {
    if (isDemoAuthToken()) {
      updateDemoState((draft) => {
        draft.chores = draft.chores.filter((chore) => chore.id !== id)
      })
      return
    }
    await apiClient.delete(`/api/chores/${id}`)
  },

  async completeChore(id: string): Promise<{ pointsEarned: number }> {
    if (isDemoAuthToken()) {
  const state = ensureDemoState()
  const target = state.chores.find((chore) => chore.id === id)
      if (!target) {
        throw new Error('お手伝いが見つかりません。')
      }
      const now = new Date().toISOString()
      updateDemoState((draft) => {
        draft.points.totalPoints += target.points
        draft.points.lastUpdated = now
        draft.history = [
          {
            id: createId(),
            userId: draft.user.id,
            type: 'earn',
            name: target.name,
            points: target.points,
            createdAt: now,
          },
          ...draft.history,
        ]
      })
      return { pointsEarned: target.points }
    }

    const response = await apiClient.post<{ pointsEarned: number }>(
      `/api/chores/${id}/complete`,
      {}
    )
    return response.data
  },

  // ご褒美関連
  async getRewards(): Promise<Reward[]> {
    if (isDemoAuthToken()) {
      return ensureDemoState().rewards.map((reward) => ({ ...reward }))
    }
    const response = await apiClient.get<Reward[]>('/api/rewards')
    return response.data
  },

  async createReward(name: string, points: number): Promise<Reward> {
    if (isDemoAuthToken()) {
      const now = new Date().toISOString()
      const userId = ensureDemoState().user.id
      const newReward: Reward = {
        id: createId(),
        userId,
        name,
        points,
        createdAt: now,
        updatedAt: now,
      }
      updateDemoState((draft) => {
        draft.rewards = [newReward, ...draft.rewards]
      })
      return { ...newReward }
    }

    const response = await apiClient.post<Reward>('/api/rewards', {
      name,
      points,
    })
    return response.data
  },

  async updateReward(id: string, name: string, points: number): Promise<Reward> {
    if (isDemoAuthToken()) {
      let updatedReward: Reward | null = null
      const now = new Date().toISOString()
      updateDemoState((draft) => {
        const index = draft.rewards.findIndex((reward) => reward.id === id)
        if (index === -1) {
          throw new Error('ご褒美が見つかりません。')
        }
        const reward = {
          ...draft.rewards[index],
          name,
          points,
          updatedAt: now,
        }
        draft.rewards[index] = reward
        updatedReward = reward
      })
      if (!updatedReward) {
        throw new Error('ご褒美が見つかりません。')
      }
      return updatedReward
    }

    const response = await apiClient.put<Reward>(`/api/rewards/${id}`, {
      name,
      points,
    })
    return response.data
  },

  async deleteReward(id: string): Promise<void> {
    if (isDemoAuthToken()) {
      updateDemoState((draft) => {
        draft.rewards = draft.rewards.filter((reward) => reward.id !== id)
      })
      return
    }
    await apiClient.delete(`/api/rewards/${id}`)
  },

  async claimReward(id: string): Promise<{ pointsUsed: number }> {
    if (isDemoAuthToken()) {
      const state = ensureDemoState()
      const reward = state.rewards.find((item) => item.id === id)
      if (!reward) {
        throw new Error('ご褒美が見つかりません。')
      }
      if (state.points.totalPoints < reward.points) {
        throw new Error('ポイントが不足しています。')
      }
      const now = new Date().toISOString()
      updateDemoState((draft) => {
        draft.points.totalPoints -= reward.points
        draft.points.lastUpdated = now
        draft.history = [
          {
            id: createId(),
            userId: draft.user.id,
            type: 'claim',
            name: reward.name,
            points: reward.points,
            createdAt: now,
          },
          ...draft.history,
        ]
      })
      return { pointsUsed: reward.points }
    }

    const response = await apiClient.post<{ pointsUsed: number }>(
      `/api/rewards/${id}/claim`,
      {}
    )
    return response.data
  },

  // 履歴関連
  async getHistory(startDate?: string, endDate?: string): Promise<HistoryEntry[]> {
    if (isDemoAuthToken()) {
      const state = ensureDemoState()
      let history = [...state.history]

      if (startDate) {
        const startTime = new Date(startDate).getTime()
        if (!Number.isNaN(startTime)) {
          history = history.filter((entry) => new Date(entry.createdAt).getTime() >= startTime)
        }
      }
      if (endDate) {
        const endTime = new Date(endDate).getTime()
        if (!Number.isNaN(endTime)) {
          history = history.filter((entry) => new Date(entry.createdAt).getTime() <= endTime)
        }
      }

      return history.map((entry) => ({ ...entry }))
    }

    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await apiClient.get<unknown>(
      `/api/history?${params.toString()}`
    )

    const results = Array.isArray(response.data)
      ? response.data
      : (response.data as { history?: unknown[] }).history ?? []

    return (results as any[]).map((entry) => ({
      id: entry.id,
      userId: entry.userId ?? entry.user_id,
      type: entry.type,
      name: entry.name,
      points: typeof entry.points === 'number' ? entry.points : Number(entry.points ?? 0),
      createdAt: entry.createdAt ?? entry.created_at ?? new Date().toISOString(),
    }))
  },

  async getPoints(): Promise<PointsData> {
    if (isDemoAuthToken()) {
      const points = ensureDemoState().points
      return { ...points }
    }
    const response = await apiClient.get<PointsData>('/api/history/points')
    return response.data
  },
}

export default apiService
