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

  const handleAppleLogin = async () => {
    try {
      setIsLoggingIn(true)
      setLoginError(null)
      
      // TODO: Apple Sign In の実装
      // 1. AppleJSライブラリを読み込む
      // 2. Apple ID認証フローを実行
      // 3. IDトークンを取得
      // 4. バックエンドに送信してログイン処理
      
      // 暫定実装: Apple認証はまだ未実装
      setLoginError('Apple認証は現在開発中です。Googleでログインしてください。')
    } catch (error) {
      console.error('Apple login failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Apple認証に失敗しました。'
      setLoginError(errorMessage)
    } finally {
      setIsLoggingIn(false)
    }
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
          <p className="login-subtitle">お手伝いコイン</p>
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
          <h1 className="login-title">ログイン</h1>

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
                <>
                  <div className="google-login-wrapper">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      size="large"
                      text="signin"
                      auto_select={false}
                    />
                  </div>
                  <button className="social-button apple-button" disabled={isLoggingIn} onClick={handleAppleLogin}>
                    <span>🍎 Apple</span>
                  </button>
                </>
              )}
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
