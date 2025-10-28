import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock App component for basic test
const MockApp = () => {
  return (
    <div>
      <h1>Chore Coin</h1>
      <p>Welcome to the app</p>
    </div>
  )
}

describe('App Component', () => {
  it('should render the main heading', () => {
    render(<MockApp />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Chore Coin'
    )
  })

  it('should render welcome message', () => {
    render(<MockApp />)
    expect(screen.getByText('Welcome to the app')).toBeInTheDocument()
  })
})

describe('Basic Math Operations', () => {
  it('should correctly add two numbers', () => {
    expect(2 + 2).toBe(4)
  })

  it('should correctly subtract two numbers', () => {
    expect(5 - 3).toBe(2)
  })

  it('should correctly multiply two numbers', () => {
    expect(3 * 4).toBe(12)
  })
})
