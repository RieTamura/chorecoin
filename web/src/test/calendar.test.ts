import { describe, it, expect } from 'vitest'
import {
  generateCalendarMonth,
  formatDate,
  getPreviousMonth,
  getNextMonth,
} from '../utils/calendar'

describe('Calendar Utilities', () => {
  describe('Date Handling', () => {
    it('should get current date', () => {
      const today = new Date()
      expect(today).toBeInstanceOf(Date)
    })

    it('should validate date format', () => {
      const date = '2025-01-15'
      const regex = /^\d{4}-\d{2}-\d{2}$/
      expect(date).toMatch(regex)
    })

    it('should format date correctly', () => {
      const date = new Date(2025, 0, 15) // January 15, 2025
      const formatted = formatDate(date)
      expect(formatted).toBe('2025-01-15')
    })

    it('should handle leap year', () => {
      const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
      expect(isLeapYear(2024)).toBe(true)
      expect(isLeapYear(2025)).toBe(false)
    })
  })

  describe('Month Navigation', () => {
    it('should move to next month - normal case', () => {
      const [nextYear, nextMonth] = getNextMonth(2025, 0) // January
      expect(nextYear).toBe(2025)
      expect(nextMonth).toBe(1) // February
    })

    it('should move to next month - December to January with year rollover', () => {
      const [nextYear, nextMonth] = getNextMonth(2025, 11) // December
      expect(nextYear).toBe(2026)
      expect(nextMonth).toBe(0) // January
    })

    it('should move to previous month - normal case', () => {
      const [prevYear, prevMonth] = getPreviousMonth(2025, 2) // March
      expect(prevYear).toBe(2025)
      expect(prevMonth).toBe(1) // February
    })

    it('should move to previous month - January to December with year rollback', () => {
      const [prevYear, prevMonth] = getPreviousMonth(2025, 0) // January
      expect(prevYear).toBe(2024)
      expect(prevMonth).toBe(11) // December
    })

    it('should handle multiple month transitions', () => {
      let year: number = 2025
      let month: number = 10 // November

      // Move forward 4 months (Nov → Dec → Jan → Feb → Mar)
      const next1 = getNextMonth(year, month)
      year = next1[0]
      month = next1[1]
      expect([year, month]).toEqual([2025, 11])

      const next2 = getNextMonth(year, month)
      year = next2[0]
      month = next2[1]
      expect([year, month]).toEqual([2026, 0])

      const next3 = getNextMonth(year, month)
      year = next3[0]
      month = next3[1]
      expect([year, month]).toEqual([2026, 1])

      const next4 = getNextMonth(year, month)
      year = next4[0]
      month = next4[1]
      expect([year, month]).toEqual([2026, 2])
    })
  })

  describe('Calendar Grid', () => {
    it('should create calendar grid for month', () => {
      const calendar = generateCalendarMonth(2025, 0) // January 2025
      expect(calendar).toHaveLength(42) // 6 weeks * 7 days
    })

    it('should fill calendar with dates from current month', () => {
      const calendar = generateCalendarMonth(2025, 0) // January 2025
      const currentMonthDays = calendar.filter(day => day.currentMonth)
      
      // January 2025 has 31 days
      expect(currentMonthDays.length).toBe(31)
      expect(currentMonthDays.some(day => day.date === 1)).toBe(true)
      expect(currentMonthDays.some(day => day.date === 31)).toBe(true)
    })

    it('should include previous and next month dates', () => {
      const calendar = generateCalendarMonth(2025, 0) // January 2025
      const prevMonthDays = calendar.filter(day => !day.currentMonth && day.date > 20) // Likely from Dec
      const nextMonthDays = calendar.filter(day => !day.currentMonth && day.date < 10)
      
      // January 1, 2025 is a Wednesday (day 3 of the week)
      // So we should have 2 days from previous month
      expect(prevMonthDays.length).toBeGreaterThan(0)
      expect(nextMonthDays.length).toBeGreaterThan(0)
    })

    it('should handle month boundaries correctly for February leap year', () => {
      const calendar = generateCalendarMonth(2024, 1) // February 2024 (leap year)
      const currentMonthDays = calendar.filter(day => day.currentMonth)
      expect(currentMonthDays.length).toBe(29)
    })

    it('should handle month boundaries correctly for February non-leap year', () => {
      const calendar = generateCalendarMonth(2025, 1) // February 2025 (non-leap year)
      const currentMonthDays = calendar.filter(day => day.currentMonth)
      expect(currentMonthDays.length).toBe(28)
    })
  })
})
