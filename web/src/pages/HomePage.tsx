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
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'home' | 'rewards' | 'history' | 'manage'>('home')
  const [isCompletingId, setIsCompletingId] = useState<string | null>(null)
  const [isClaimingId, setIsClaimingId] = useState<string | null>(null)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  
  // 管理画面関連
  const [showAddChoreForm, setShowAddChoreForm] = useState(false)
  const [showAddRewardForm, setShowAddRewardForm] = useState(false)
  const [editingChoreId, setEditingChoreId] = useState<string | null>(null)
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null)
  const [newChore, setNewChore] = useState({ name: '', points: 10, recurring: false })
  const [newReward, setNewReward] = useState({ name: '', points: 100 })
  const [isAddingChore, setIsAddingChore] = useState(false)
  const [isAddingReward, setIsAddingReward] = useState(false)
  const [isSwitchingUserType, setIsSwitchingUserType] = useState(false)
  
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

  // 成功メッセージの自動消去
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // エラーメッセージの自動消去（ユーザーが手動で消去できるように留意）
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

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
      setError(null)
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

      // 成功メッセージを表示
      setSuccess(`「${chore?.name}」を完了しました！${result.pointsEarned || 0}ポイント獲得！`)
    } catch (err) {
      console.error('Failed to complete chore:', err)
      setError(err instanceof Error ? err.message : 'お手伝い完了に失敗しました。')
    } finally {
      setIsCompletingId(null)
    }
  }

  const handleClaimReward = async (rewardId: string) => {
    try {
      setIsClaimingId(rewardId)
      setError(null)
      const result = await apiService.claimReward(rewardId)

      // ご褒美情報を取得
      const reward = rewards.find((r) => r.id === rewardId)

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
      setSuccess(`「${reward?.name}」を交換しました！`)
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

  const handleAddChore = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsAddingChore(true)
      const createdChore = await apiService.createChore(
        newChore.name,
        newChore.points,
        newChore.recurring
      )
      setChores([...chores, createdChore])
      setNewChore({ name: '', points: 10, recurring: false })
      setShowAddChoreForm(false)
      setError(null)
      setSuccess(`「${newChore.name}」を追加しました！`)
    } catch (err) {
      console.error('Failed to add chore:', err)
      setError(err instanceof Error ? err.message : 'お手伝いの追加に失敗しました。')
    } finally {
      setIsAddingChore(false)
    }
  }

  const handleDeleteChore = async (choreId: string) => {
    try {
      setIsDeletingId(choreId)
      const chore = chores.find((c) => c.id === choreId)
      await apiService.deleteChore(choreId)
      setChores(chores.filter((c) => c.id !== choreId))
      setError(null)
      setSuccess(`「${chore?.name}」を削除しました。`)
    } catch (err) {
      console.error('Failed to delete chore:', err)
      setError(err instanceof Error ? err.message : 'お手伝いの削除に失敗しました。')
    } finally {
      setIsDeletingId(null)
    }
  }

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsAddingReward(true)
      const createdReward = await apiService.createReward(
        newReward.name,
        newReward.points
      )
      setRewards([...rewards, createdReward])
      setNewReward({ name: '', points: 100 })
      setShowAddRewardForm(false)
      setError(null)
      setSuccess(`「${newReward.name}」を追加しました！`)
    } catch (err) {
      console.error('Failed to add reward:', err)
      setError(err instanceof Error ? err.message : 'ご褒美の追加に失敗しました。')
    } finally {
      setIsAddingReward(false)
    }
  }

  const handleDeleteReward = async (rewardId: string) => {
    try {
      setIsDeletingId(rewardId)
      const reward = rewards.find((r) => r.id === rewardId)
      await apiService.deleteReward(rewardId)
      setRewards(rewards.filter((r) => r.id !== rewardId))
      setError(null)
      setSuccess(`「${reward?.name}」を削除しました。`)
    } catch (err) {
      console.error('Failed to delete reward:', err)
      setError(err instanceof Error ? err.message : 'ご褒美の削除に失敗しました。')
    } finally {
      setIsDeletingId(null)
    }
  }

  const handleEditChore = (chore: Chore) => {
    setEditingChoreId(chore.id)
    setNewChore({ name: chore.name, points: chore.points, recurring: chore.recurring })
    setShowAddChoreForm(true)
  }

  const handleSaveChore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingChoreId) return

    try {
      setIsAddingChore(true)
      const updatedChore = await apiService.updateChore(
        editingChoreId,
        newChore.name,
        newChore.points,
        newChore.recurring
      )
      setChores(chores.map((c) => (c.id === editingChoreId ? updatedChore : c)))
      setNewChore({ name: '', points: 10, recurring: false })
      setShowAddChoreForm(false)
      setEditingChoreId(null)
      setError(null)
      setSuccess('お手伝いを更新しました！')
    } catch (err) {
      console.error('Failed to update chore:', err)
      setError(err instanceof Error ? err.message : 'お手伝いの更新に失敗しました。')
    } finally {
      setIsAddingChore(false)
    }
  }

  const handleEditReward = (reward: Reward) => {
    setEditingRewardId(reward.id)
    setNewReward({ name: reward.name, points: reward.points })
    setShowAddRewardForm(true)
  }

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRewardId) return

    try {
      setIsAddingReward(true)
      const updatedReward = await apiService.updateReward(
        editingRewardId,
        newReward.name,
        newReward.points
      )
      setRewards(rewards.map((r) => (r.id === editingRewardId ? updatedReward : r)))
      setNewReward({ name: '', points: 100 })
      setShowAddRewardForm(false)
      setEditingRewardId(null)
      setError(null)
      setSuccess('ご褒美を更新しました！')
    } catch (err) {
      console.error('Failed to update reward:', err)
      setError(err instanceof Error ? err.message : 'ご褒美の更新に失敗しました。')
    } finally {
      setIsAddingReward(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingChoreId(null)
    setEditingRewardId(null)
    setNewChore({ name: '', points: 10, recurring: false })
    setNewReward({ name: '', points: 100 })
    setShowAddChoreForm(false)
    setShowAddRewardForm(false)
  }

  const handleSwitchToChild = async () => {
    try {
      setIsSwitchingUserType(true)
      await apiService.updateUserType('child')
      setSuccess('子のアカウントに切り替えました。ページをリロードしています...')
      // ページをリロードして、ユーザータイプの変更を反映
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      console.error('Failed to switch user type:', err)
      setError(err instanceof Error ? err.message : 'ユーザータイプの切り替えに失敗しました。')
    } finally {
      setIsSwitchingUserType(false)
    }
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

        {/* メッセージ表示エリア */}
        {error && (
          <div className="message-wrapper">
            <div className="error-message">
              <span className="message-icon">⚠️</span>
              <span className="message-text">{error}</span>
              <button className="message-close" onClick={() => setError(null)}>✕</button>
            </div>
          </div>
        )}
        {success && (
          <div className="message-wrapper">
            <div className="success-message">
              <span className="message-icon">✨</span>
              <span className="message-text">{success}</span>
              <button className="message-close" onClick={() => setSuccess(null)}>✕</button>
            </div>
          </div>
        )}

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
              <div className="manage-container">
                {/* ユーザータイプ切り替え */}
                <div className="manage-section">
                  <div className="section-header">
                    <h3>👥 ユーザータイプ</h3>
                  </div>
                  <div className="user-type-info">
                    <p className="current-type">現在のユーザータイプ: <strong>親</strong></p>
                    <p className="user-type-description">親として管理画面にアクセスしています。お手伝いとご褒美を管理できます。</p>
                    <button 
                      className="switch-button"
                      onClick={handleSwitchToChild}
                      disabled={isSwitchingUserType}
                    >
                      {isSwitchingUserType ? '切り替え中...' : '子のアカウントに切り替え'}
                    </button>
                  </div>
                </div>
                {/* お手伝い管理セクション */}
                <div className="manage-section">
                  <div className="section-header">
                    <h3>📋 お手伝いを管理</h3>
                    <button 
                      className="add-button"
                      onClick={() => setShowAddChoreForm(!showAddChoreForm)}
                    >
                      {showAddChoreForm ? '✕ キャンセル' : '+ 新しいお手伝いを追加'}
                    </button>
                  </div>

                  {/* お手伝い追加フォーム */}
                  {showAddChoreForm && (
                    <div className="form-container">
                      <form onSubmit={editingChoreId ? handleSaveChore : handleAddChore}>
                        <div className="form-group">
                          <label htmlFor="chore-name">お手伝いの名前</label>
                          <input
                            id="chore-name"
                            type="text"
                            placeholder="例：お皿洗い"
                            value={newChore.name}
                            onChange={(e) => setNewChore({ ...newChore, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="chore-points">ポイント</label>
                          <input
                            id="chore-points"
                            type="number"
                            placeholder="10"
                            min="1"
                            value={newChore.points}
                            onChange={(e) => setNewChore({ ...newChore, points: parseInt(e.target.value) || 0 })}
                            required
                          />
                        </div>
                        <div className="form-group checkbox">
                          <label htmlFor="chore-recurring">
                            <input
                              id="chore-recurring"
                              type="checkbox"
                              checked={newChore.recurring}
                              onChange={(e) => setNewChore({ ...newChore, recurring: e.target.checked })}
                            />
                            毎日のお手伝い（リカーリング）
                          </label>
                        </div>
                        <div className="form-actions">
                          <button 
                            type="submit" 
                            className="submit-button"
                            disabled={isAddingChore}
                          >
                            {isAddingChore ? '処理中...' : editingChoreId ? '更新' : '追加'}
                          </button>
                          <button 
                            type="button" 
                            className="cancel-button"
                            onClick={handleCancelEdit}
                          >
                            キャンセル
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* お手伝いリスト */}
                  {chores.length === 0 ? (
                    <div className="empty-state">
                      <p>お手伝いがまだ登録されていません。</p>
                    </div>
                  ) : (
                    <div className="manage-items-list">
                      {chores.map((chore) => (
                        <div key={chore.id} className="manage-item">
                          <div className="item-info">
                            <h4>{chore.name}</h4>
                            <div className="item-meta">
                              <span className="badge">{chore.points} ポイント</span>
                              {chore.recurring && <span className="badge recurring">毎日</span>}
                            </div>
                          </div>
                          <div className="item-actions">
                            <button 
                              className="edit-button"
                              onClick={() => handleEditChore(chore)}
                            >
                              編集
                            </button>
                            <button 
                              className="delete-button"
                              onClick={() => handleDeleteChore(chore.id)}
                              disabled={isDeletingId === chore.id}
                            >
                              {isDeletingId === chore.id ? '削除中...' : '削除'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ご褒美管理セクション */}
                <div className="manage-section">
                  <div className="section-header">
                    <h3>🎁 ご褒美を管理</h3>
                    <button 
                      className="add-button"
                      onClick={() => setShowAddRewardForm(!showAddRewardForm)}
                    >
                      {showAddRewardForm ? '✕ キャンセル' : '+ 新しいご褒美を追加'}
                    </button>
                  </div>

                  {/* ご褒美追加フォーム */}
                  {showAddRewardForm && (
                    <div className="form-container">
                      <form onSubmit={editingRewardId ? handleSaveReward : handleAddReward}>
                        <div className="form-group">
                          <label htmlFor="reward-name">ご褒美の名前</label>
                          <input
                            id="reward-name"
                            type="text"
                            placeholder="例：ゲーム 30分"
                            value={newReward.name}
                            onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="reward-points">必要ポイント</label>
                          <input
                            id="reward-points"
                            type="number"
                            placeholder="100"
                            min="1"
                            value={newReward.points}
                            onChange={(e) => setNewReward({ ...newReward, points: parseInt(e.target.value) || 0 })}
                            required
                          />
                        </div>
                        <div className="form-actions">
                          <button 
                            type="submit" 
                            className="submit-button"
                            disabled={isAddingReward}
                          >
                            {isAddingReward ? '処理中...' : editingRewardId ? '更新' : '追加'}
                          </button>
                          <button 
                            type="button" 
                            className="cancel-button"
                            onClick={handleCancelEdit}
                          >
                            キャンセル
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* ご褒美リスト */}
                  {rewards.length === 0 ? (
                    <div className="empty-state">
                      <p>ご褒美がまだ登録されていません。</p>
                    </div>
                  ) : (
                    <div className="manage-items-list">
                      {rewards.map((reward) => (
                        <div key={reward.id} className="manage-item">
                          <div className="item-info">
                            <h4>{reward.name}</h4>
                            <span className="badge">{reward.points} ポイント必要</span>
                          </div>
                          <div className="item-actions">
                            <button 
                              className="edit-button"
                              onClick={() => handleEditReward(reward)}
                            >
                              編集
                            </button>
                            <button 
                              className="delete-button"
                              onClick={() => handleDeleteReward(reward.id)}
                              disabled={isDeletingId === reward.id}
                            >
                              {isDeletingId === reward.id ? '削除中...' : '削除'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
