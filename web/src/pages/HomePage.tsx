import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Chore, PointsData } from '../types'
import apiService from '../services/api'
import './HomePage.css'

export default function HomePage() {
  const { user, logout } = useAuth()
  const [chores, setChores] = useState<Chore[]>([])
  const [pointsData, setPointsData] = useState<PointsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'home' | 'rewards' | 'history' | 'manage'>('home')
  const [isCompletingId, setIsCompletingId] = useState<string | null>(null)

  // 初期データ読み込み
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // お手伝い一覧を取得
      const choresResponse = await apiService.getChores()
      setChores(choresResponse)

      // 現在のポイントを取得
      const pointsResponse = await apiService.getPoints()
      setPointsData(pointsResponse)
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('データの読み込みに失敗しました。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteChore = async (choreId: string) => {
    try {
      setIsCompletingId(choreId)
      const result = await apiService.completeChore(choreId)

      // ポイント情報を更新
      setPointsData((prev) => {
        if (!prev) return null
        return {
          ...prev,
          totalPoints: result.pointsEarned || 0,
          lastUpdated: new Date().toISOString(),
        }
      })

      // お手伝いを削除（非リカーリングの場合）
      const chore = chores.find((c) => c.id === choreId)
      if (chore && !chore.recurring) {
        setChores(chores.filter((c) => c.id !== choreId))
      }
    } catch (err) {
      console.error('Failed to complete chore:', err)
      setError('お手伝い完了に失敗しました。')
    } finally {
      setIsCompletingId(null)
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  if (isLoading) {
    return (
      <div className="home-container">
        <div className="loading">
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1 className="header-title">🪙 Chore Coin</h1>
          <button className="logout-button" onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      </header>

      <div className="home-wrapper">
        {/* ポイント表示カード */}
        <div className="points-card">
          <h2>現在のポイント</h2>
          <div className="points-display">
            <div className="points-value">{pointsData?.totalPoints || 0}</div>
            <div className="points-label">ポイント</div>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && <div className="error-message">{error}</div>}

        {/* タブナビゲーション */}
        <nav className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            🏠 ホーム
          </button>
          <button
            className={`tab-button ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            🎁 ご褒美
          </button>
          <button
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📅 履歴
          </button>
          {user?.userType === 'parent' && (
            <button
              className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage')}
            >
              ⚙️ 管理
            </button>
          )}
        </nav>

        {/* コンテンツエリア */}
        <main className="tab-content">
          {activeTab === 'home' && (
            <section className="home-tab">
              <h2>📋 やることリスト</h2>
              {chores.length === 0 ? (
                <div className="empty-state">
                  <p>やることがありません。</p>
                  {user?.userType === 'parent' && (
                    <p>親の管理画面からお手伝いを追加してください。</p>
                  )}
                </div>
              ) : (
                <div className="chores-list">
                  {chores.map((chore) => (
                    <div key={chore.id} className="chore-card">
                      <div className="chore-info">
                        <h3 className="chore-name">{chore.name}</h3>
                        <div className="chore-meta">
                          <span className="chore-points">+{chore.points}ポイント</span>
                          {chore.recurring && <span className="chore-recurring">毎日</span>}
                        </div>
                      </div>
                      <button
                        className="complete-button"
                        onClick={() => handleCompleteChore(chore.id)}
                        disabled={isCompletingId === chore.id}
                      >
                        {isCompletingId === chore.id ? '処理中...' : '完了'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'rewards' && (
            <section className="rewards-tab">
              <p>ご褒美画面は現在工事中です。</p>
            </section>
          )}

          {activeTab === 'history' && (
            <section className="history-tab">
              <p>履歴画面は現在工事中です。</p>
            </section>
          )}

          {activeTab === 'manage' && user?.userType === 'parent' && (
            <section className="manage-tab">
              <p>管理画面は現在工事中です。</p>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
