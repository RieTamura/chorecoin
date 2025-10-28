import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/')
    }
  }, [user, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="login-container">
        <div className="loading">
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  // Google OAuth の設定がない場合はデモモードで表示
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
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">🪙 Chore Coin</h1>
        <p className="login-subtitle">お手伝いコイン</p>
        <p className="login-description">
          お手伝いをしてポイントを貯めよう！<br />
          貯まったポイントでご褒美と交換できるよ✨
        </p>

        <div className="google-login-placeholder">
          <p>Google ログインボタンはここに表示されます。</p>
          <p>（@react-oauth/google の設定が必要です）</p>
        </div>
      </div>
    </div>
  )
}
