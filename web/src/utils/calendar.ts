/**
 * カレンダー関連のユーティリティ関数
 */

export interface CalendarDay {
  date: number
  currentMonth: boolean
}

export type CalendarMonth = CalendarDay[]

/**
 * 指定された月のカレンダー日付配列を生成（6週間分）
 */
export function generateCalendarMonth(year: number, month: number): CalendarMonth {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // 開始曜日を計算（0=日曜日）
  const startingDayOfWeek = firstDay.getDay()

  // 前月の日付を取得
  const previousMonthLastDay = new Date(year, month, 0).getDate()
  const previousMonthDays: CalendarDay[] = []
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = previousMonthLastDay - i
    previousMonthDays.push({
      date: day,
      currentMonth: false,
    })
  }

  // 現在の月の日付を取得
  const currentMonthDays: CalendarDay[] = []
  for (let day = 1; day <= lastDay.getDate(); day++) {
    currentMonthDays.push({
      date: day,
      currentMonth: true,
    })
  }

  // 次月の日付を取得（グリッドを埋めるため）
  const totalCells = previousMonthDays.length + currentMonthDays.length
  const remainingCells = 42 - totalCells // 6週 * 7日 = 42セル
  const nextMonthDays: CalendarDay[] = []
  for (let day = 1; day <= remainingCells; day++) {
    nextMonthDays.push({
      date: day,
      currentMonth: false,
    })
  }

  // すべての日付を結合して返す（平坦な配列）
  return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays]
}

/**
 * 日付を YYYY-MM-DD 形式にフォーマット
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 日付から月の最初と最後の日付を取得
 */
export function getMonthRange(year: number, month: number): [string, string] {
  const firstDay = formatDate(new Date(year, month, 1))
  const lastDay = formatDate(new Date(year, month + 1, 0))
  return [firstDay, lastDay]
}

/**
 * 前月を取得
 */
export function getPreviousMonth(year: number, month: number): [number, number] {
  if (month === 0) {
    return [year - 1, 11]
  }
  return [year, month - 1]
}

/**
 * 翌月を取得
 */
export function getNextMonth(year: number, month: number): [number, number] {
  if (month === 11) {
    return [year + 1, 0]
  }
  return [year, month + 1]
}
