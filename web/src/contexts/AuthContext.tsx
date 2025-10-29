import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types'
import apiService, { DEMO_TOKEN_PREFIX } from '../services/api'

const AUTH_CHECK_TIMEOUT_MS = 5000

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (idToken: string) => Promise<void>
  demoLogin: () => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (token?.startsWith(DEMO_TOKEN_PREFIX)) {
        const demoUser = apiService.initializeDemoData()
        setUser(demoUser)
        return
      }

      if (token) {
        try {
          // タイムアウト処理を追加（5秒で中止）
          let timeoutId: ReturnType<typeof setTimeout> | null = null
          const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('Request timeout')), AUTH_CHECK_TIMEOUT_MS)
          })

          let userData: User
          try {
            userData = await Promise.race([apiService.getMe(), timeoutPromise])
          } finally {
            if (timeoutId) {
              clearTimeout(timeoutId)
            }
          }

          setUser(userData)
        } catch (apiError) {
          console.error('API call failed:', apiError)
          localStorage.removeItem('authToken')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('authToken')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (idToken: string) => {
    try {
      const response = await apiService.loginWithGoogle(idToken)
      setUser(response.user)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const demoLogin = () => {
    try {
      const demoUser = apiService.initializeDemoData()
      const demoToken = `${DEMO_TOKEN_PREFIX}-${Date.now()}`
      localStorage.setItem('authToken', demoToken)
      setUser(demoUser)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const refreshUser = async () => {
    try {
      if (apiService.isDemoMode()) {
        setUser(apiService.getDemoUser())
        return
      }

      // タイムアウト処理を追加（5秒で中止）
      let timeoutId: ReturnType<typeof setTimeout> | null = null
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Request timeout')), AUTH_CHECK_TIMEOUT_MS)
      })

      let userData: User
      try {
        userData = await Promise.race([apiService.getMe(), timeoutPromise])
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }

      setUser(userData)
    } catch (error) {
      console.error('Refresh user failed:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, demoLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
