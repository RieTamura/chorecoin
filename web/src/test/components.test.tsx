import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock Button Component
const Button = ({ onClick, children }: { onClick: () => void; children: string }) => (
  <button onClick={onClick}>{children}</button>
)

// Mock ChoreList Component
const ChoreList = ({ chores }: { chores: Array<{ id: string; name: string }> }) => (
  <ul>
    {chores.map((chore) => (
      <li key={chore.id}>{chore.name}</li>
    ))}
  </ul>
)

describe('UI Components', () => {
  describe('Button Component', () => {
    it('should render button with text', () => {
      const handleClick = () => {}
      render(
        <Button onClick={handleClick}>
          Click me
        </Button>
      )
      expect(screen.getByRole('button')).toHaveTextContent('Click me')
    })

    it('should call onClick handler when clicked', () => {
      let clicked = false
      const handleClick = () => {
        clicked = true
      }
      render(
        <Button onClick={handleClick}>
          Click me
        </Button>
      )
      fireEvent.click(screen.getByRole('button'))
      expect(clicked).toBe(true)
    })
  })

  describe('ChoreList Component', () => {
    it('should render empty list when no chores', () => {
      render(<ChoreList chores={[]} />)
      const items = screen.queryAllByRole('listitem')
      expect(items).toHaveLength(0)
    })

    it('should render all chores in list', () => {
      const chores = [
        { id: '1', name: '掃除' },
        { id: '2', name: '洗濯' },
        { id: '3', name: 'ご飯作り' },
      ]
      render(<ChoreList chores={chores} />)
      
      chores.forEach((chore) => {
        expect(screen.getByText(chore.name)).toBeInTheDocument()
      })
    })

    it('should render correct number of list items', () => {
      const chores = [
        { id: '1', name: 'Task 1' },
        { id: '2', name: 'Task 2' },
      ]
      render(<ChoreList chores={chores} />)
      expect(screen.getAllByRole('listitem')).toHaveLength(2)
    })
  })
})
