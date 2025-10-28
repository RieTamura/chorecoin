import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Chore, Reward, PointsData, HistoryEntry } from '../types'
import apiService from '../services/api'
import { generateCalendarMonth, getMonthRange, getPreviousMonth, getNextMonth, CalendarMonth } from '../utils/calendar'
import './HomePage.css'

export default function HomePage() {
  const { user, logout } = useAuth()
  const [chores, setChores] = useState<Chore[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [pointsData, setPointsData] = useState<PointsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'home' | 'rewards' | 'history' | 'manage'>('home')
  const [isCompletingId, setIsCompletingId] = useState<string | null>(null)
  const [isClaimingId, setIsClaimingId] = useState<string | null>(null)
  
  // カレンダー関連
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarMonth, setCalendarMonth] = useState<CalendarMonth | null>(null)

  // 初期データ読み込み
  useEffect(() => {
    loadData()
  }, [])

  // カレンダー生成
  useEffect(() => {
    const calendar = generateCalendarMonth(currentDate.getFullYear(), currentDate.getMonth())
    setCalendarMonth(calendar)
    
    // 履歴データを取得
    loadHistoryData(currentDate.getFullYear(), currentDate.getMonth())
  }, [currentDate])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // お手伝い一覧を取得
      const choresResponse = await apiService.getChores()
      setChores(choresResponse)

      // ご褒美一覧を取得
      const rewardsResponse = await apiService.getRewards()
      setRewards(rewardsResponse)

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

  const loadHistoryData = async (year: number, month: number) => {
    try {
      const [startDate, endDate] = getMonthRange(year, month)
      const historyResponse = await apiService.getHistory(startDate, endDate)
      setHistory(historyResponse)
    } catch (err) {
      console.error('Failed to load history:', err)
    }
  }

  const handlePreviousMonth = () => {
    const [prevYear, prevMonth] = getPreviousMonth(currentDate.getFullYear(), currentDate.getMonth())
    setCurrentDate(new Date(prevYear, prevMonth))
  }

  const handleNextMonth = () => {
    const [nextYear, nextMonth] = getNextMonth(currentDate.getFullYear(), currentDate.getMonth())
    setCurrentDate(new Date(nextYear, nextMonth))
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

  const handleClaimReward = async (rewardId: string) => {
    try {
      setIsClaimingId(rewardId)
      const result = await apiService.claimReward(rewardId)

      // ポイント情報を更新
      setPointsData((prev) => {
        if (!prev) return null
        return {
          ...prev,
          totalPoints: (result as any).totalPoints,
          lastUpdated: new Date().toISOString(),
        }
      })

      // 成功メッセージを表示
      setError(null)
      // 成功メッセージの表示（別途実装可能）
    } catch (err: unknown) {
      console.error('Failed to claim reward:', err)
      if (err instanceof Error) {
        setError(err.message || 'ご褒美の交換に失敗しました。')
      } else {
        setError('ご褒美の交換に失敗しました。')
      }
    } finally {
      setIsClaimingId(null)
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
              <h2>🎁 ご褒美</h2>
              {rewards.length === 0 ? (
                <div className="empty-state">
                  <p>ご褒美がまだ登録されていません。</p>
                  {user?.userType === 'parent' && (
                    <p>親の管理画面からご褒美を追加してください。</p>
                  )}
                </div>
              ) : (
                <div className="rewards-list">
                  {rewards.map((reward) => {
                    const canClaim = (pointsData?.totalPoints || 0) >= reward.points
                    return (
                      <div key={reward.id} className="reward-card">
                        <div className="reward-info">
                          <h3 className="reward-name">{reward.name}</h3>
                          <div className="reward-points-required">
                            <span className={`reward-points ${canClaim ? 'available' : 'unavailable'}`}>
                              {reward.points} ポイント必要
                            </span>
                          </div>
                          {!canClaim && (
                            <p className="reward-insufficient">
                              あと {reward.points - (pointsData?.totalPoints || 0)} ポイント必要です
                            </p>
                          )}
                        </div>
                        <button
                          className={`claim-button ${canClaim ? 'available' : 'disabled'}`}
                          onClick={() => handleClaimReward(reward.id)}
                          disabled={!canClaim || isClaimingId === reward.id}
                        >
                          {isClaimingId === reward.id ? '処理中...' : '交換'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === 'history' && (
            <section className="history-tab">
              <h2>📅 履歴</h2>
              
              {/* 月の選択 */}
              <div className="history-header">
                <button 
                  className="month-nav-button" 
                  onClick={handlePreviousMonth}
                  aria-label="前の月"
                >
                  ← 前月
                </button>
                <h3 className="current-month">
                  {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
                </h3>
                <button 
                  className="month-nav-button" 
                  onClick={handleNextMonth}
                  aria-label="次の月"
                >
                  翌月 →
                </button>
              </div>

              {/* カレンダー */}
              {calendarMonth && (
                <div className="calendar-container">
                  {/* 曜日ヘッダー */}
                  <div className="calendar-header">
                    {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                      <div key={day} className="calendar-day-header">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* カレンダーグリッド */}
                  <div className="calendar-grid">
                    {calendarMonth.map((day, index) => {
                      if (!day.currentMonth) {
                        return (
                          <div key={index} className="calendar-day other-month">
                            <div className="calendar-day-number">{day.date}</div>
                          </div>
                        )
                      }

                      const dayHistory = history.filter((h) => {
                        const historyDate = new Date(h.createdAt)
                        return (
                          historyDate.getFullYear() === currentDate.getFullYear() &&
                          historyDate.getMonth() === currentDate.getMonth() &&
                          historyDate.getDate() === day.date
                        )
                      })

                      const earnedPoints = dayHistory
                        .filter((h) => h.type === 'earn')
                        .reduce((sum, h) => sum + (h.points || 0), 0)

                      const usedPoints = dayHistory
                        .filter((h) => h.type === 'claim')
                        .reduce((sum, h) => sum + (h.points || 0), 0)

                      return (
                        <div
                          key={index}
                          className={`calendar-day current-month ${dayHistory.length > 0 ? 'has-history' : ''}`}
                        >
                          <div className="calendar-day-number">{day.date}</div>
                          {dayHistory.length > 0 && (
                            <div className="calendar-day-summary">
                              {earnedPoints > 0 && (
                                <div className="day-earned">+{earnedPoints}</div>
                              )}
                              {usedPoints > 0 && (
                                <div className="day-used">-{usedPoints}</div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 当月の取引履歴 */}
              <div className="history-details">
                <h3>当月の取引</h3>
                {history.length === 0 ? (
                  <div className="empty-state">
                    <p>この月の取引履歴はありません。</p>
                  </div>
                ) : (
                  <div className="history-list">
                    {history
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((entry, index) => (
                        <div key={index} className="history-entry">
                          <div className="entry-info">
                            <div className="entry-title">{entry.name}</div>
                            <div className="entry-date">
                              {new Date(entry.createdAt).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                          <div
                            className={`entry-points ${
                              entry.type === 'earn' ? 'earned' : 'used'
                            }`}
                          >
                            {entry.type === 'earn' ? '+' : '-'}
                            {entry.points}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
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
