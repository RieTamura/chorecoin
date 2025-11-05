import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useAuth } from '../contexts/AuthContext'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, isLoading, login, demoLogin } = useAuth()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/')
    }
  }, [user, isLoading, navigate])

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
      <LoginContent
        isLoggingIn={isLoggingIn}
        loginError={loginError}
        onStartLogin={() => {
          setLoginError(null)
          setIsLoggingIn(true)
        }}
        onLoginError={(message) => setLoginError(message)}
        onLoginComplete={() => setIsLoggingIn(false)}
        onDemoLogin={handleDemoLogin}
        loginWithGoogle={login}
        onNavigateHome={() => navigate('/')}
      />
    </GoogleOAuthProvider>
  )
}

interface LoginContentProps {
  isLoggingIn: boolean
  loginError: string | null
  onStartLogin: () => void
  onLoginError: (message: string) => void
  onLoginComplete: () => void
  onDemoLogin: () => void
  loginWithGoogle: (idToken: string) => Promise<void>
  onNavigateHome: () => void
}

function LoginContent({
  isLoggingIn,
  loginError,
  onStartLogin,
  onLoginError,
  onLoginComplete,
  onDemoLogin,
  loginWithGoogle,
  onNavigateHome,
}: LoginContentProps) {
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!isLoggingIn) {
        onStartLogin()
      }

      if (!credentialResponse.credential) {
        throw new Error('Google認証に失敗しました。もう一度お試しください。')
      }

      console.log('[Google Login] Credential received, sending to backend...')
      await loginWithGoogle(credentialResponse.credential)
      console.log('[Google Login] Backend authentication successful')
      onNavigateHome()
    } catch (error) {
      console.error('[Google Login] Authentication failed:', error)
      // Log more details if it's an error object
      if (error instanceof Error) {
        console.error('[Google Login] Error message:', error.message)
        console.error('[Google Login] Error stack:', error.stack)
      }
      const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました。もう一度お試しください。'
      onLoginError(errorMessage)
    } finally {
      onLoginComplete()
    }
  }

  const handleGoogleError = () => {
    onLoginError('Google認証に失敗しました。もう一度お試しください。')
    onLoginComplete()
  }

  return (
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
            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                type="icon"
                shape="circle"
                theme="outline"
                size="large"
                click_listener={() => onStartLogin()}
              />
              {isLoggingIn && (
                <div className="google-login-overlay">
                  <div className="loading-spinner">
                    <p>ログイン中...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* デモモードボタン */}
        <div className="demo-mode-section">
          <button 
            className="demo-button"
            onClick={onDemoLogin}
            disabled={isLoggingIn}
          >
            🧪 デモモードでテスト
          </button>
        </div>
      </div>
    </div>
  )
}
