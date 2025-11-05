import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useAuth } from '../contexts/AuthContext'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, isLoading, login, demoLogin } = useAuth()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const googleButtonRef = useRef<HTMLButtonElement | null>(null)
  const hiddenGoogleButtonWrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/')
    }
  }, [user, isLoading, navigate])

  useEffect(() => {
    const wrapper = hiddenGoogleButtonWrapperRef.current
    if (!wrapper) {
      return
    }

    const assignButtonRef = () => {
      const button = wrapper.querySelector('button')
      if (button instanceof HTMLButtonElement) {
        googleButtonRef.current = button
        return true
      }
      return false
    }

    if (assignButtonRef()) {
      return () => {
        googleButtonRef.current = null
      }
    }

    const observer = new MutationObserver(() => {
      if (assignButtonRef()) {
        observer.disconnect()
      }
    })

    observer.observe(wrapper, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      googleButtonRef.current = null
    }
  }, [])

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setIsLoggingIn(true)
      setLoginError(null)
      
      if (!credentialResponse.credential) {
        throw new Error('Google認証に失敗しました。もう一度お試しください。')
      }

      // バックエンドに Google ID トークンを送信
      await login(credentialResponse.credential)
      
      // ホームページにリダイレクト
      navigate('/')
    } catch (error) {
      console.error('Login failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました。もう一度お試しください。'
      setLoginError(errorMessage)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleGoogleError = () => {
    setLoginError('Google認証に失敗しました。もう一度お試しください。')
  }

  // デモテスト用: ダミーユーザーでログイン
  const handleDemoLogin = () => {
    try {
      setIsLoggingIn(true)
      setLoginError(null)

      demoLogin()
      navigate('/')
    } catch (error) {
      console.error('Demo login failed:', error)
      setLoginError('デモログインに失敗しました。')
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (isLoading) {
    return (
      <div className="login-container">
        <div className="loading">
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">🪙 Chore Coin</h1>
          <p className="login-subtitle">やることコイン</p>
          <p className="login-description">
            お手伝いをしてポイントを貯めよう！<br />
            貯まったポイントでご褒美と交換できるよ✨
          </p>
          <div className="demo-notice">
            <p>⚠️ Google OAuth クライアントID が設定されていません。</p>
            <p>.env.local ファイルに <code>VITE_GOOGLE_CLIENT_ID</code> を設定してください。</p>
            <details>
              <summary>設定方法を表示</summary>
              <pre>{`.env.local ファイルの例:

VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
VITE_API_URL=http://localhost:8787`}</pre>
            </details>
          </div>
        </div>
      </div>
    )
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="login-container">
        <div className="login-card">
          <h1 className="app-title">🪙 Chore Coin</h1>
          <p className="app-subtitle">やることコイン</p>
          <p className="app-description">
            お手伝いをしてポイントを貯めよう！<br />
            貯まったポイントでご褒美と交換できるよ✨
          </p>

          <h2 className="login-title">ログイン</h2>

          {loginError && (
            <div className="error-message">
              {loginError}
            </div>
          )}

          {/* ソーシャルログイン */}
          <div className="social-login-section">
            <div className="social-buttons">
              {isLoggingIn ? (
                <div className="loading-spinner">
                  <p>ログイン中...</p>
                </div>
              ) : (
                <button 
                  className="logo-button google-button" 
                  disabled={isLoggingIn} 
                  onClick={() => {
                    googleButtonRef.current?.click()
                  }}
                  title="Google でログイン"
                  aria-label="Google でログイン"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </button>
              )}
            </div>
            <div
              className="hidden-google-wrapper"
              style={{ display: 'none' }}
              ref={hiddenGoogleButtonWrapperRef}
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="large"
                text="signin"
                auto_select={false}
              />
            </div>
          </div>

          {/* デモモードボタン */}
          <div className="demo-mode-section">
            <button 
              className="demo-button"
              onClick={handleDemoLogin}
              disabled={isLoggingIn}
            >
              🧪 デモモードでテスト
            </button>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}
